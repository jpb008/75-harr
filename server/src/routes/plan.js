import { json, error } from '../lib/response.js'
import { authMiddleware } from './auth.js'

export async function handleGetPlan(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)

  const answersRow = await env.DB.prepare('SELECT answers_json FROM onboarding_answers WHERE user_id = ?1')
    .bind(auth.userId)
    .first()
  const planRow = await env.DB.prepare(
    'SELECT plan_json FROM plans WHERE user_id = ?1 ORDER BY version DESC LIMIT 1'
  )
    .bind(auth.userId)
    .first()

  if (!planRow) return error('No plan found', 404)
  return json({
    answers: answersRow ? JSON.parse(answersRow.answers_json) : null,
    plan: JSON.parse(planRow.plan_json),
  })
}

export async function handleGetPlanHistory(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)

  const { results } = await env.DB.prepare(
    'SELECT version, source, created_at FROM plans WHERE user_id = ?1 ORDER BY version DESC'
  )
    .bind(auth.userId)
    .all()
  return json(results)
}

export async function handlePostPlan(request, env) {
  const auth = await authMiddleware(request, env)
  if (!auth) return error('Unauthorized', 401)

  const { answers, plan, source } = await request.json()
  if (!answers || !plan) return error('Missing answers or plan')

  await env.DB.prepare(
    `INSERT INTO onboarding_answers (user_id, answers_json, updated_at)
     VALUES (?1, ?2, datetime('now'))
     ON CONFLICT(user_id) DO UPDATE SET answers_json = ?2, updated_at = datetime('now')`
  )
    .bind(auth.userId, JSON.stringify(answers))
    .run()

  const latest = await env.DB.prepare('SELECT MAX(version) as maxVersion FROM plans WHERE user_id = ?1')
    .bind(auth.userId)
    .first()
  const nextVersion = (latest?.maxVersion ?? 0) + 1

  await env.DB.prepare('INSERT INTO plans (id, user_id, version, plan_json, source) VALUES (?1, ?2, ?3, ?4, ?5)')
    .bind(crypto.randomUUID(), auth.userId, nextVersion, JSON.stringify(plan), source ?? 'onboarding')
    .run()

  return json({ version: nextVersion })
}
