import { useEffect, useState } from 'react'
import { Flame, CheckCircle2, Clock, Lock } from 'lucide-react'
import { apiFetch } from '../lib/api'
import { today, parseDateStr } from '../lib/dates'

// What an accountability friend sees: no login, read-only, only the
// numbers the owner chose to share.
export default function FriendView({ token }) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await apiFetch(`/share/view?token=${encodeURIComponent(token)}`, { method: 'GET' })
        if (!cancelled) setData(res)
      } catch (e) {
        if (!cancelled) setErr(e?.status === 404 ? 'This link was turned off or never existed.' : "Couldn't load. Check your connection and refresh.")
      }
    }
    load()
    const id = setInterval(load, 60000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [token])

  const s = data?.snapshot
  const isToday = s?.date === today()
  const updated = s?.updatedAt ? new Date(s.updatedAt).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }) : null

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 py-10">
      <p className="font-display text-lg text-[var(--accent-light)] tracking-wide">
        75<span className="text-[var(--ink-100)]">HARD</span>
      </p>
      {err && <p className="mt-6 text-[var(--ink-200)]">{err}</p>}
      {!err && !data && <p className="mt-6 text-[var(--ink-300)]">Loading…</p>}
      {data && (
        <>
          <h1 className="font-display text-5xl leading-none text-[var(--ink-50)] mt-2">{data.nickname}'s 75 Hard</h1>
          {!s ? (
            <p className="mt-6 text-[var(--ink-200)]">{data.nickname} hasn't started sharing progress yet. Check back soon.</p>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl border border-[var(--ink-800)] bg-[var(--ink-900)] p-6">
                <p className="text-xs uppercase tracking-[0.15em] text-[var(--ink-300)]">{s.finished ? 'Finished' : 'Day'}</p>
                <p className="font-display text-7xl leading-none text-[var(--ink-50)] tabular-nums">
                  {s.dayNumber}
                  <span className="text-2xl text-[var(--ink-400)]"> / {s.lengthDays}</span>
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--accent-light)]">
                  <Flame size={16} /> {s.streak} day streak
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--ink-800)] bg-[var(--ink-900)] p-4 flex items-center gap-3">
                {isToday && s.todayDone ? <CheckCircle2 size={24} className="text-[var(--success)] shrink-0" /> : <Clock size={24} className="text-[var(--ink-300)] shrink-0" />}
                <div>
                  <p className="text-[var(--ink-50)] font-semibold">
                    {isToday ? (s.todayDone ? "Today's checklist is done" : `Today: ${s.tasksDone} of ${s.tasksTotal} tasks done`) : "Hasn't checked in today yet"}
                  </p>
                  {updated && <p className="text-xs text-[var(--ink-400)]">Last update {updated}{s.date && !isToday ? ` (${parseDateStr(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})` : ''}</p>}
                </div>
              </div>
              <p className="text-sm text-[var(--ink-300)]">Send {data.nickname} a message to keep them going. 💪</p>
            </div>
          )}
          <p className="mt-10 flex items-center gap-1.5 text-xs text-[var(--ink-400)]">
            <Lock size={12} /> Private link. Only shows the day count, streak and whether today is done.
          </p>
        </>
      )}
    </div>
  )
}
