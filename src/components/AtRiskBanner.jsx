import { useEffect, useState } from 'react'
import { atRiskLevel } from '../lib/atRisk'
import { fireNotification } from '../lib/notify'
import { loadJSON, saveJSON } from '../lib/storage'
import { today } from '../lib/dates'

export default function AtRiskBanner({ todayComplete, remainingCount, notificationsEnabled }) {
  const [hour, setHour] = useState(() => new Date().getHours())

  useEffect(() => {
    const id = setInterval(() => setHour(new Date().getHours()), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const level = atRiskLevel(hour, todayComplete)

  // Fire the real notification once per level per day — the ticking hour
  // state re-runs this on every check, so a dedupe key in storage is what
  // actually stops it from repeating every 5 minutes.
  useEffect(() => {
    if (!notificationsEnabled || !level || remainingCount === 0) return
    const key = `notified:${today()}:${level}`
    if (loadJSON(key, false)) return
    saveJSON(key, true)
    fireNotification(
      level === 'urgent' ? '75 Hard — less than an hour left' : '75 Hard — getting late',
      {
        body:
          level === 'urgent'
            ? `${remainingCount} task${remainingCount === 1 ? '' : 's'} left. Don't lose the streak.`
            : `${remainingCount} task${remainingCount === 1 ? '' : 's'} left today.`,
        tag: 'at-risk',
      }
    )
  }, [level, remainingCount, notificationsEnabled])

  if (!level || remainingCount === 0) return null

  const styles =
    level === 'urgent'
      ? 'bg-[var(--danger-soft)] border-[var(--danger-border)] text-[var(--danger)]'
      : 'bg-[var(--accent-a10)] border-[var(--accent-a40)] text-[var(--accent-light)]'

  const message =
    level === 'urgent'
      ? `Less than an hour left — ${remainingCount} task${remainingCount === 1 ? '' : 's'} left. Don't lose the streak.`
      : `Getting late — ${remainingCount} task${remainingCount === 1 ? '' : 's'} left today.`

  return <div className={`rounded-lg border px-4 py-3 text-sm mb-4 ${styles}`}>{message}</div>
}
