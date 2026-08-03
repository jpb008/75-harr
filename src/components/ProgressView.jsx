import { addDays, formatPretty, today } from '../lib/dates'
import { isDayComplete } from '../lib/challenge'

export default function ProgressView({ challenge, days, history }) {
  const todayStr = today()
  const cells = Array.from({ length: challenge.lengthDays }, (_, i) => {
    const dateStr = addDays(challenge.startDate, i)
    const record = days[dateStr]
    let status = 'upcoming'
    if (dateStr < todayStr) status = isDayComplete(record, challenge.tasks) ? 'done' : 'missed'
    else if (dateStr === todayStr) status = isDayComplete(record, challenge.tasks) ? 'done' : 'today'
    return { day: i + 1, dateStr, status }
  })

  const styles = {
    done: 'bg-emerald-500/80 text-emerald-950',
    missed: 'bg-rose-500/30 text-rose-300 border border-rose-500/40',
    today: 'bg-ember-500/20 text-ember-300 border border-ember-500/60 animate-pulse',
    upcoming: 'bg-slate-900 text-slate-600 border border-slate-800',
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-1">Progress</h2>
      <p className="text-slate-400 text-sm mb-6">
        Started {formatPretty(challenge.startDate)} · {challenge.lengthDays} day challenge
      </p>

      <div className="grid grid-cols-8 gap-2 mb-8">
        {cells.map((c) => (
          <div
            key={c.dateStr}
            title={`Day ${c.day} · ${formatPretty(c.dateStr)} · ${c.status}`}
            className={`aspect-square rounded-md flex items-center justify-center text-[11px] font-medium ${styles[c.status]}`}
          >
            {c.day}
          </div>
        ))}
      </div>

      <div className="flex gap-4 text-xs text-slate-400 mb-10 flex-wrap">
        <Legend swatch="bg-emerald-500/80" label="Complete" />
        <Legend swatch="bg-rose-500/30 border border-rose-500/40" label="Missed" />
        <Legend swatch="bg-ember-500/20 border border-ember-500/60" label="Today" />
        <Legend swatch="bg-slate-900 border border-slate-800" label="Upcoming" />
      </div>

      <h3 className="text-lg font-semibold text-white mb-3">Past attempts</h3>
      {history.length === 0 && <p className="text-slate-500 text-sm">No past attempts yet — this is your first run.</p>}
      <ul className="space-y-2">
        {[...history].reverse().map((h, idx) => (
          <li
            key={`${h.id}-${idx}`}
            className="flex items-center justify-between rounded-lg bg-slate-900 border border-slate-800 px-4 py-3 text-sm"
          >
            <div>
              <p className="text-slate-200">{h.name}</p>
              <p className="text-slate-500 text-xs">
                {formatPretty(h.startDate)} → {formatPretty(h.endDate)}
              </p>
            </div>
            <div className="text-right">
              <p className={h.reason === 'finished' ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                {h.reason === 'finished' ? 'Finished 🎉' : 'Reset'}
              </p>
              <p className="text-slate-500 text-xs">
                {h.daysCompleted}/{h.lengthDays} days
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Legend({ swatch, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm ${swatch}`} />
      {label}
    </span>
  )
}
