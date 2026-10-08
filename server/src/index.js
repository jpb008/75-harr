import { buildPushPayload } from '@block65/webcrypto-web-push'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

async function handleSubscribe(request, env) {
  const body = await request.json()
  const { subscription, tzOffsetMinutes } = body
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return json({ error: 'Invalid subscription' }, 400)
  }
  await env.DB.prepare(
    `INSERT INTO subscriptions (endpoint, p256dh, auth, tz_offset_minutes)
     VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(endpoint) DO UPDATE SET
       p256dh = ?2, auth = ?3, tz_offset_minutes = ?4`
  )
    .bind(subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth, tzOffsetMinutes ?? 0)
    .run()
  return json({ ok: true })
}

async function handleUnsubscribe(request, env) {
  const { endpoint } = await request.json()
  if (!endpoint) return json({ error: 'Missing endpoint' }, 400)
  await env.DB.prepare(`DELETE FROM subscriptions WHERE endpoint = ?1`).bind(endpoint).run()
  return json({ ok: true })
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    if (request.method === 'POST' && url.pathname === '/subscribe') {
      return handleSubscribe(request, env)
    }
    if (request.method === 'POST' && url.pathname === '/unsubscribe') {
      return handleUnsubscribe(request, env)
    }
    return json({ error: 'Not found' }, 404)
  },

  // Runs hourly. For each subscriber, works out their local hour from the
  // stored UTC offset and sends the at-risk nudge once per level per local
  // day — mirroring the in-app AtRiskBanner thresholds (9pm / 11pm).
  async scheduled(_event, env) {
    const vapid = {
      subject: env.VAPID_SUBJECT,
      publicKey: env.VAPID_PUBLIC_KEY,
      privateKey: env.VAPID_PRIVATE_KEY,
    }

    const { results } = await env.DB.prepare(`SELECT * FROM subscriptions`).all()
    const nowUtc = new Date()

    for (const row of results) {
      const localMs = nowUtc.getTime() - row.tz_offset_minutes * 60 * 1000
      const local = new Date(localMs)
      const localHour = local.getUTCHours()
      const localDate = local.toISOString().slice(0, 10)

      const level = localHour >= 23 ? 'urgent' : localHour >= 21 ? 'warning' : null
      if (!level) continue
      if (row.last_sent_date === localDate && row.last_sent_level === level) continue

      const subscription = {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      }
      const message = {
        data: JSON.stringify({
          title: level === 'urgent' ? '75 Hard — less than an hour left' : '75 Hard — getting late',
          body:
            level === 'urgent'
              ? "Don't lose the streak — finish up before midnight."
              : "Today's tasks aren't done yet.",
          tag: 'at-risk',
        }),
        options: { ttl: 60 * 60 },
      }

      try {
        const payload = await buildPushPayload(message, subscription, vapid)
        const res = await fetch(subscription.endpoint, payload)
        if (res.status === 404 || res.status === 410) {
          await env.DB.prepare(`DELETE FROM subscriptions WHERE endpoint = ?1`).bind(row.endpoint).run()
          continue
        }
        await env.DB.prepare(
          `UPDATE subscriptions SET last_sent_date = ?1, last_sent_level = ?2 WHERE endpoint = ?3`
        )
          .bind(localDate, level, row.endpoint)
          .run()
      } catch (err) {
        console.error('push failed for', row.endpoint, err)
      }
    }
  },
}
