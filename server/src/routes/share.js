import { json, error } from '../lib/response.js'
import { authMiddleware } from './auth.js'

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// GET /share: this user's link (if any).
export async function handleGetShare(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)
  const row = await env.DB.prepare('SELECT token, nickname, created_at FROM share_links WHERE user_id = ?1').bind(auth.userId).first()
  return json(row ? { token: row.token, nickname: row.nickname, createdAt: row.created_at } : { token: null })
}

// POST /share { nickname }: creates a new link, replacing any old one.
export async function handleCreateShare(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)
  const { nickname } = await request.json()
  const name = String(nickname ?? '').trim().slice(0, 30)
  if (!name) return error('Add a first name or nickname for your friend to see.')
  const token = newToken()
  await env.DB.batch([
    env.DB.prepare('DELETE FROM share_links WHERE user_id = ?1').bind(auth.userId),
    env.DB.prepare('INSERT INTO share_links (token, user_id, nickname) VALUES (?1, ?2, ?3)').bind(token, auth.userId, name),
  ])
  return json({ token, nickname: name }, 201)
}

// DELETE-style POST /share/revoke: the link stops working immediately.
export async function handleRevokeShare(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)
  await env.DB.prepare('DELETE FROM share_links WHERE user_id = ?1').bind(auth.userId).run()
  return json({ revoked: true })
}

// GET /share/view?token=...: public, read-only. Returns only the
// snapshot the user's app publishes (day count, streak, today done).
export async function handleViewShare(request, env) {
  const token = new URL(request.url).searchParams.get('token') ?? ''
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(token)) return error('Link not found', 404)
  const link = await env.DB.prepare('SELECT user_id, nickname FROM share_links WHERE token = ?1').bind(token).first()
  if (!link) return error('Link not found', 404)
  const state = await env.DB.prepare('SELECT state_json FROM app_state WHERE user_id = ?1').bind(link.user_id).first()
  const snap = state ? JSON.parse(state.state_json).shareSnapshot ?? null : null
  if (!snap) return json({ nickname: link.nickname, snapshot: null })
  const { dayNumber, lengthDays, streak, todayDone, tasksDone, tasksTotal, date, updatedAt, finished } = snap
  return json({ nickname: link.nickname, snapshot: { dayNumber, lengthDays, streak, todayDone, tasksDone, tasksTotal, date, updatedAt, finished } })
}
