import { hashPassword, verifyPassword, signToken, verifyToken } from '../lib/crypto.js'
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
  return { userId: payload.sub }
}

export async function handleSession(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)
  const user = await env.DB.prepare('SELECT id, email FROM users WHERE id = ?1').bind(auth.userId).first()
  if (!user) return error('Unauthorized', 401)
  return json({ userId: user.id, email: user.email })
}
