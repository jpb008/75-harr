export default function TodayView({ challenge, dayNumber, streak, todayRecord, todayComplete, onToggle }) {
  const percent = challenge.tasks.length
    ? Math.round((todayRecord.completedTaskIds.length / challenge.tasks.length) * 100)
    : 0

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-slate-400 text-sm uppercase tracking-wide">{challenge.name}</p>
        <div className="flex items-baseline gap-3 mt-1">
          <h1 className="text-4xl font-bold text-white">Day {dayNumber}</h1>
          <span className="text-slate-500">/ {challenge.lengthDays}</span>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <span className="inline-flex items-center gap-1.5 text-sm text-ember-400 font-medium">
            🔥 {streak} day streak
          </span>
          {todayComplete && (
            <span className="inline-flex items-center gap-1 text-sm text-emerald-400 font-medium">
              ✓ Today complete
            </span>
          )}
        </div>
      </div>

      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-ember-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <ul className="space-y-3">
        {challenge.tasks.map((task) => {
          const checked = todayRecord.completedTaskIds.includes(task.id)
          return (
            <li key={task.id}>
              <label
                className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${
                  checked
                    ? 'bg-ember-500/10 border-ember-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(task.id)}
                  className="w-5 h-5 rounded accent-ember-500 shrink-0"
                />
                <span className={checked ? 'text-slate-300 line-through decoration-slate-500' : 'text-slate-100'}>
                  {task.label}
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      {challenge.tasks.length === 0 && (
        <p className="text-slate-500 text-sm mt-6">
          No tasks yet — add some in Settings to start checking off your day.
        </p>
      )}

      <p className="text-slate-500 text-xs mt-8 text-center">
        Miss any task by midnight and the challenge resets to Day 1 automatically.
      </p>
    </div>
  )
}
