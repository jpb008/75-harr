import { hashPassword, verifyPassword, signToken, verifyToken, generateRecoveryCode, hashRecoveryCode } from '../lib/crypto.js'
import { json, error } from '../lib/response.js'

const TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60 // 30 days
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

async function issueToken(env, userId) {
  const now = Math.floor(Date.now() / 1000)
  return signToken({ sub: userId, iat: now, exp: now + TOKEN_TTL_SECONDS }, env.SESSION_HMAC_SECRET)
}

export async function handleSignup(request, env) {
  const { email, password } = await request.json()
  const normalizedEmail = normalizeEmail(email)
  if (!EMAIL_RE.test(normalizedEmail)) return error('Enter a valid email address.')
  if (typeof password !== 'string' || password.length < 8) {
    return error('Password must be at least 8 characters.')
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?1').bind(normalizedEmail).first()
  if (existing) return error('An account with that email already exists.', 409)

  const userId = crypto.randomUUID()
  const passwordHash = await hashPassword(password)
  await env.DB.prepare('INSERT INTO users (id, email, password_hash) VALUES (?1, ?2, ?3)')
    .bind(userId, normalizedEmail, passwordHash)
    .run()

  return json({ token: await issueToken(env, userId), userId }, 201)
}

export async function handleLogin(request, env) {
  const { email, password } = await request.json()
  const normalizedEmail = normalizeEmail(email)
  const user = await env.DB.prepare('SELECT id, password_hash FROM users WHERE email = ?1')
    .bind(normalizedEmail)
    .first()
  if (!user) return error('Incorrect email or password.', 401)

  const valid = await verifyPassword(password ?? '', user.password_hash)
  if (!valid) return error('Incorrect email or password.', 401)

  return json({ token: await issueToken(env, user.id), userId: user.id })
}

export async function authMiddleware(request, env) {
  const header = request.headers.get('Authorization') ?? ''
  const match = header.match(/^Bearer (.+)$/)
  if (!match) return null
  const payload = await verifyToken(match[1], env.SESSION_HMAC_SECRET)
  if (!payload?.sub) return null
  // A password reset signs out every device that logged in before it.
  let user
  try {
    user = await env.DB.prepare('SELECT password_changed_at FROM users WHERE id = ?1').bind(payload.sub).first()
  } catch {
    // Migration 0008 not applied yet: fall back to the signature check alone.
    return { userId: payload.sub }
  }
  if (!user) return null
  if (user.password_changed_at && (payload.iat ?? 0) < user.password_changed_at) return null
  return { userId: payload.sub }
}

export async function handleSession(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)
  const user = await env.DB.prepare('SELECT id, email FROM users WHERE id = ?1').bind(auth.userId).first()
  if (!user) return error('Unauthorized', 401)
  return json({ userId: user.id, email: user.email })
}

const RECOVERY_CODE_COUNT = 10
const RECOVERY_MAX_FAILURES = 5
const RECOVERY_LOCK_SECONDS = 15 * 60

// Creates a fresh set of recovery codes (old ones stop working) and
// returns them once; only their hashes are stored.
export async function handleCreateRecoveryCodes(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, generateRecoveryCode)
  const hashes = await Promise.all(codes.map(hashRecoveryCode))
  await env.DB.batch([
    env.DB.prepare('DELETE FROM recovery_codes WHERE user_id = ?1').bind(auth.userId),
    ...hashes.map((hash) =>
      env.DB.prepare('INSERT INTO recovery_codes (id, user_id, code_hash) VALUES (?1, ?2, ?3)').bind(crypto.randomUUID(), auth.userId, hash)
    ),
  ])
  return json({ codes, remaining: codes.length }, 201)
}

export async function handleRecoveryStatus(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS total, SUM(CASE WHEN used_at IS NULL THEN 1 ELSE 0 END) AS remaining, MAX(created_at) AS created_at FROM recovery_codes WHERE user_id = ?1'
  )
    .bind(auth.userId)
    .first()
  return json({ total: row?.total ?? 0, remaining: row?.remaining ?? 0, createdAt: row?.created_at ?? null })
}

// Resets a forgotten password with one unused recovery code.
export async function handleRecover(request, env) {
  const { email, code, newPassword } = await request.json()
  if (typeof newPassword !== 'string' || newPassword.length < 8) return error('New password must be at least 8 characters.')
  const generic = "That email and recovery code don't match."
  const user = await env.DB.prepare('SELECT id, recovery_failures, recovery_locked_until FROM users WHERE email = ?1')
    .bind(normalizeEmail(email))
    .first()
  if (!user) return error(generic, 401)

  const now = Math.floor(Date.now() / 1000)
  if (user.recovery_locked_until && user.recovery_locked_until > now) {
    return error('Too many wrong codes. Wait 15 minutes and try again.', 429)
  }

  const hash = await hashRecoveryCode(code)
  const match = await env.DB.prepare('SELECT id FROM recovery_codes WHERE user_id = ?1 AND code_hash = ?2 AND used_at IS NULL')
    .bind(user.id, hash)
    .first()
  if (!match) {
    const failures = (user.recovery_failures ?? 0) + 1
    const locked = failures >= RECOVERY_MAX_FAILURES
    await env.DB.prepare('UPDATE users SET recovery_failures = ?1, recovery_locked_until = ?2 WHERE id = ?3')
      .bind(locked ? 0 : failures, locked ? now + RECOVERY_LOCK_SECONDS : null, user.id)
      .run()
    return error(generic, 401)
  }

  const passwordHash = await hashPassword(newPassword)
  await env.DB.batch([
    env.DB.prepare("UPDATE recovery_codes SET used_at = datetime('now') WHERE id = ?1").bind(match.id),
    env.DB.prepare(
      'UPDATE users SET password_hash = ?1, password_changed_at = ?2, recovery_failures = 0, recovery_locked_until = NULL WHERE id = ?3'
    ).bind(passwordHash, now, user.id),
  ])
  const remaining = await env.DB.prepare('SELECT COUNT(*) AS n FROM recovery_codes WHERE user_id = ?1 AND used_at IS NULL').bind(user.id).first()
  return json({ token: await issueToken(env, user.id), userId: user.id, remaining: remaining?.n ?? 0 })
}

// Change password while logged in. Signs out every other device.
export async function handleChangePassword(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)
  const { currentPassword, newPassword } = await request.json()
  if (typeof newPassword !== 'string' || newPassword.length < 8) return error('New password must be at least 8 characters.')
  const user = await env.DB.prepare('SELECT id, password_hash FROM users WHERE id = ?1').bind(auth.userId).first()
  if (!user) return error('Unauthorized', 401)
  if (!(await verifyPassword(currentPassword ?? '', user.password_hash))) return error('Your current password is wrong.', 403)
  const now = Math.floor(Date.now() / 1000)
  await env.DB.prepare('UPDATE users SET password_hash = ?1, password_changed_at = ?2 WHERE id = ?3')
    .bind(await hashPassword(newPassword), now, user.id)
    .run()
  return json({ token: await issueToken(env, user.id) })
}

// Permanently deletes the account and everything stored for it.
export async function handleDeleteAccount(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)
  const { password } = await request.json()
  const user = await env.DB.prepare('SELECT id, password_hash FROM users WHERE id = ?1').bind(auth.userId).first()
  if (!user) return error('Unauthorized', 401)
  if (!(await verifyPassword(password ?? '', user.password_hash))) return error('Your password is wrong.', 403)
  const id = user.id
  await env.DB.batch([
    env.DB.prepare('DELETE FROM recovery_codes WHERE user_id = ?1').bind(id),
    env.DB.prepare('DELETE FROM subscriptions WHERE user_id = ?1').bind(id),
    env.DB.prepare('DELETE FROM weekly_reviews WHERE user_id = ?1').bind(id),
    env.DB.prepare('DELETE FROM plans WHERE user_id = ?1').bind(id),
    env.DB.prepare('DELETE FROM onboarding_answers WHERE user_id = ?1').bind(id),
    env.DB.prepare('DELETE FROM app_state WHERE user_id = ?1').bind(id),
    env.DB.prepare('DELETE FROM users WHERE id = ?1').bind(id),
  ])
  return json({ deleted: true })
}
