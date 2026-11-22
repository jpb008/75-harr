import { buildPushPayload } from '@block65/webcrypto-web-push'
import { json, error } from '../lib/response.js'
import { authMiddleware } from './auth.js'
import { dueReminders, localClock } from '../lib/reminders.js'

export async function handleSubscribe(request, env) {
  const body = await request.json()
  const { subscription, tzOffsetMinutes } = body
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return error('Invalid subscription')
  }
  // Linking to the signed-in account lets reminders check real progress;
  // an anonymous subscription keeps the original generic nudges.
  const auth = await authMiddleware(request, env)
  await env.DB.prepare(
    `INSERT INTO subscriptions (endpoint, p256dh, auth, tz_offset_minutes, user_id)
     VALUES (?1, ?2, ?3, ?4, ?5)
     ON CONFLICT(endpoint) DO UPDATE SET
       p256dh = ?2, auth = ?3, tz_offset_minutes = ?4, user_id = COALESCE(?5, user_id)`
  )
    .bind(subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, tzOffsetMinutes ?? 0, auth?.userId ?? null)
    .run()
  return json({ ok: true })
}

export async function handleUnsubscribe(request, env) {
  const { endpoint } = await request.json()
  if (!endpoint) return error('Missing endpoint')
  await env.DB.prepare('DELETE FROM subscriptions WHERE endpoint = ?1').bind(endpoint).run()
  return json({ ok: true })
}

async function sendPush(env, row, vapid, message) {
  const subscription = { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }
  const payload = await buildPushPayload(
    { data: JSON.stringify(message), options: { ttl: 60 * 60 } },
    subscription,
    vapid
  )
  const res = await fetch(subscription.endpoint, payload)
  if (res.status === 404 || res.status === 410) {
    await env.DB.prepare('DELETE FROM subscriptions WHERE endpoint = ?1').bind(row.endpoint).run()
    return 'gone'
  }
  return 'sent'
}

async function loadUserContext(env, userId) {
  const stateRow = await env.DB.prepare('SELECT state_json FROM app_state WHERE user_id = ?1').bind(userId).first()
  const planRow = await env.DB.prepare('SELECT plan_json FROM plans WHERE user_id = ?1 ORDER BY version DESC LIMIT 1').bind(userId).first()
  return {
    state: stateRow ? JSON.parse(stateRow.state_json) : {},
    plan: planRow ? JSON.parse(planRow.plan_json) : null,
  }
}

// Original behaviour for subscriptions not linked to an account: a
// generic 9pm / 11pm nudge, once per level per local day.
async function runLegacyReminder(env, row, vapid, clock) {
  const level = clock.hour >= 23 ? 'urgent' : clock.hour >= 21 ? 'warning' : null
  if (!level) return
  if (row.last_sent_date === clock.date && row.last_sent_level === level) return
  const result = await sendPush(env, row, vapid, {
    title: level === 'urgent' ? '75 Hard — less than an hour left' : '75 Hard — getting late',
    body: level === 'urgent' ? "Don't lose the streak — finish up before midnight." : "Today's tasks aren't done yet.",
    tag: 'at-risk',
  })
  if (result === 'sent') {
    await env.DB.prepare('UPDATE subscriptions SET last_sent_date = ?1, last_sent_level = ?2 WHERE endpoint = ?3')
      .bind(clock.date, level, row.endpoint)
      .run()
  }
}

// Runs hourly. Account-linked subscribers get reminders that check their
// actual progress first (see lib/reminders.js); each kind is sent at most
// once per local day.
export async function runScheduledPush(env, nowUtc = new Date()) {
  const vapid = {
    subject: env.VAPID_SUBJECT,
    publicKey: env.VAPID_PUBLIC_KEY,
    privateKey: env.VAPID_PRIVATE_KEY,
  }

  const { results } = await env.DB.prepare('SELECT * FROM subscriptions').all()
  const contexts = new Map()

  for (const row of results) {
    const clock = localClock(nowUtc, row.tz_offset_minutes)
    try {
      if (!row.user_id) {
        await runLegacyReminder(env, row, vapid, clock)
        continue
      }
      if (!contexts.has(row.user_id)) contexts.set(row.user_id, await loadUserContext(env, row.user_id))
      const { state, plan } = contexts.get(row.user_id)
      const sentLog = row.sent_log ? JSON.parse(row.sent_log) : {}
      let changed = false
      for (const reminder of dueReminders({ clock, state, plan })) {
        if (sentLog[reminder.kind] === clock.date) continue
        const result = await sendPush(env, row, vapid, { title: reminder.title, body: reminder.body, tag: reminder.tag })
        if (result === 'gone') break
        sentLog[reminder.kind] = clock.date
        changed = true
      }
      if (changed) {
        await env.DB.prepare('UPDATE subscriptions SET sent_log = ?1 WHERE endpoint = ?2').bind(JSON.stringify(sentLog), row.endpoint).run()
      }
    } catch (err) {
      console.error('push failed for', row.endpoint, err)
    }
  }
}
