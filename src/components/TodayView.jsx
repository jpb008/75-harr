export default function TodayView({ challenge, dayNumber, streak, todayRecord, todayComplete, onToggle }) {
  const percent = challenge.tasks.length
    ? Math.round((todayRecord.completedTaskIds.length / challenge.tasks.length) * 100)
    : 0

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-[var(--ink-300)] text-xs uppercase tracking-[0.15em]">{challenge.name}</p>
        <div className="flex items-baseline gap-3 mt-1">
          <h1 className="font-display text-6xl leading-none text-[var(--ink-50)]">
            Day {dayNumber}
          </h1>
          <span className="text-[var(--ink-400)] tabular-nums">/ {challenge.lengthDays}</span>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-[var(--accent-light)] font-medium">
            🔥 {streak} day streak
          </span>
          {todayComplete && (
            <span className="inline-flex items-center gap-1 text-sm text-emerald-400 font-medium">
              ✓ Today complete
            </span>
          )}
        </div>
      </div>

      <div className="w-full h-1.5 bg-[var(--ink-800)] rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent-light)] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="space-y-2.5">
        {challenge.tasks.map((task) => {
          const checked = todayRecord.completedTaskIds.includes(task.id)
          return (
            <li key={task.id}>
              <label
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${
                  checked
                    ? 'bg-[var(--accent-a10)] border-[var(--accent-a40)]'
                    : 'bg-[var(--ink-900)] border-[var(--ink-800)] hover:border-[var(--ink-700)]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(task.id)}
                  className="task-check"
                />
                <span className={checked ? 'text-[var(--ink-200)] line-through decoration-[var(--ink-400)]' : 'text-[var(--ink-50)]'}>
                  {task.label}
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      {challenge.tasks.length === 0 && (
        <p className="text-[var(--ink-400)] text-sm mt-6">
          No tasks yet — add some in Settings to start checking off your day.
        </p>
      )}

      <p className="text-[var(--ink-400)] text-xs mt-8 text-center">
        Miss any task by midnight and the challenge resets to Day 1 automatically.
      </p>
    </div>
  )
}
