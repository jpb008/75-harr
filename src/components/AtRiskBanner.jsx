import { useEffect, useState } from 'react'
import { atRiskLevel } from '../lib/atRisk'

export default function AtRiskBanner({ todayComplete, remainingCount }) {
  const [hour, setHour] = useState(() => new Date().getHours())

  useEffect(() => {
    const id = setInterval(() => setHour(new Date().getHours()), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const level = atRiskLevel(hour, todayComplete)
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
