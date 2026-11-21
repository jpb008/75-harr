import { json, error } from '../lib/response.js'
import { authMiddleware } from './auth.js'

export async function handleGetWeeklyReview(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)

  const weekStart = new URL(request.url).searchParams.get('weekStart')
  if (!weekStart) return error('Missing weekStart')

  const row = await env.DB.prepare('SELECT * FROM weekly_reviews WHERE user_id = ?1 AND week_start = ?2')
    .bind(auth.userId, weekStart)
    .first()
  if (!row) return error('Not found', 404)

  return json({
    id: row.id,
    weekStart: row.week_start,
    answers: JSON.parse(row.answers_json),
    stats: JSON.parse(row.stats_json),
    proposedAdjustments: row.proposed_adjustments_json ? JSON.parse(row.proposed_adjustments_json) : [],
    applied: Boolean(row.applied),
  })
}

export async function handlePostWeeklyReview(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)

  const { weekStart, answers, stats, proposedAdjustments } = await request.json()
  if (!weekStart || !answers || !stats) return error('Missing weekStart, answers, or stats')

  await env.DB.prepare(
    `INSERT INTO weekly_reviews (id, user_id, week_start, answers_json, stats_json, proposed_adjustments_json)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)
     ON CONFLICT(user_id, week_start) DO UPDATE SET
       answers_json = ?4, stats_json = ?5, proposed_adjustments_json = ?6`
  )
    .bind(
      crypto.randomUUID(),
      auth.userId,
      weekStart,
      JSON.stringify(answers),
      JSON.stringify(stats),
      JSON.stringify(proposedAdjustments ?? [])
    )
    .run()

  const row = await env.DB.prepare('SELECT id FROM weekly_reviews WHERE user_id = ?1 AND week_start = ?2')
    .bind(auth.userId, weekStart)
    .first()
  return json({ id: row.id })
}

export async function handlePatchWeeklyReview(request, env, id) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)

  const { applied } = await request.json()
  const result = await env.DB.prepare('UPDATE weekly_reviews SET applied = ?1 WHERE id = ?2 AND user_id = ?3')
    .bind(applied ? 1 : 0, id, auth.userId)
    .run()
  if (!result.meta.changes) return error('Not found', 404)
  return json({ ok: true })
}
