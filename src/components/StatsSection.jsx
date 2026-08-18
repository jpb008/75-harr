export default function StatsSection({ stats }) {
  const { longestStreak, totalAttempts, bestWeekday, avgResetDays } = stats

  const cards = [
    { label: 'Longest streak ever', value: `${longestStreak} ${longestStreak === 1 ? 'day' : 'days'}` },
    { label: 'Total attempts', value: totalAttempts },
    { label: 'Best day of week', value: bestWeekday ? `${bestWeekday.label} (${bestWeekday.pct}%)` : '—' },
    { label: 'Avg. days before reset', value: avgResetDays !== null ? avgResetDays : '—' },
  ]

  return (
    <div className="mb-10">
      <h3 className="font-display text-xl text-[var(--ink-50)] mb-3 tracking-wide">Stats</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg bg-[var(--ink-900)] border border-[var(--ink-800)] px-3.5 py-3">
            <p className="text-2xl font-display tabular-nums text-[var(--ink-50)] leading-none mb-1">{c.value}</p>
            <p className="text-xs text-[var(--ink-400)]">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
