import { json, error } from '../lib/response.js'
import { authMiddleware } from './auth.js'

export async function handleGetState(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)

  const row = await env.DB.prepare('SELECT state_json, version FROM app_state WHERE user_id = ?1')
    .bind(auth.userId)
    .first()
  if (!row) return json({ state: {}, version: 0 })
  return json({ state: JSON.parse(row.state_json), version: row.version })
}

export async function handlePutState(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)

  const { state, version } = await request.json()
  if (typeof version !== 'number') return error('Missing version')

  const existing = await env.DB.prepare('SELECT state_json, version FROM app_state WHERE user_id = ?1')
    .bind(auth.userId)
    .first()

  const currentVersion = existing?.version ?? 0
  if (currentVersion !== version) {
    return json(
      {
        error: 'Version conflict',
        serverState: existing ? JSON.parse(existing.state_json) : {},
        serverVersion: currentVersion,
      },
      409
    )
  }

  const nextVersion = currentVersion + 1
  await env.DB.prepare(
    `INSERT INTO app_state (user_id, state_json, version, updated_at)
     VALUES (?1, ?2, ?3, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET state_json = ?2, version = ?3, updated_at = datetime('now')`
  )
    .bind(auth.userId, JSON.stringify(state), nextVersion)
    .run()

  return json({ version: nextVersion })
}
