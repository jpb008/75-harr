import { useState } from 'react'

export default function GoalsView({ goals, addGoal, toggleGoal, removeGoal }) {
  const [newGoalText, setNewGoalText] = useState('')

  function submit() {
    addGoal(newGoalText)
    setNewGoalText('')
  }

  const doneCount = goals.filter((g) => g.done).length

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-display text-5xl leading-none text-[var(--ink-50)] mt-1 mb-2">Goals</h1>
      <p className="text-[var(--ink-300)] text-sm mb-6 max-w-md">
        Things you're personally working toward — set your own, whenever you want. Unlike the daily checklist,
        there's no streak and nothing resets if you miss one.
      </p>

      {goals.length > 0 && (
        <p className="text-sm text-[var(--ink-300)] mb-3 tabular-nums">
          {doneCount} / {goals.length} done
        </p>
      )}

      <ul className="space-y-2.5 mb-4">
        {goals.map((goal) => (
          <li key={goal.id}>
            <label
              className={`flex items-center gap-3 rounded-xl border border-dashed px-4 py-3.5 cursor-pointer transition-colors ${
                goal.done
                  ? 'bg-[var(--accent-a10)] border-[var(--accent-a40)]'
                  : 'bg-[var(--ink-900)] border-[var(--ink-700)] hover:border-[var(--ink-600)]'
              }`}
            >
              <input type="checkbox" checked={goal.done} onChange={() => toggleGoal(goal.id)} className="task-check" />
              <span
                className={`flex-1 ${goal.done ? 'text-[var(--ink-200)] line-through decoration-[var(--ink-400)]' : 'text-[var(--ink-50)]'}`}
              >
                {goal.text}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  removeGoal(goal.id)
                }}
                className="text-[var(--ink-400)] hover:text-rose-400 px-1 transition-colors"
                aria-label="Remove goal"
              >
                ✕
              </button>
            </label>
          </li>
        ))}
      </ul>

      {goals.length === 0 && <p className="text-[var(--ink-400)] text-sm mb-4">No goals yet — add one below.</p>}

      <div className="flex items-center gap-2">
        <input
          value={newGoalText}
          onChange={(e) => setNewGoalText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="e.g. Run a 5k"
          className="flex-1 rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] px-3 py-2 text-sm text-[var(--ink-50)] placeholder:text-[var(--ink-400)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        <button
          onClick={submit}
          className="rounded-lg bg-[var(--ink-800)] hover:bg-[var(--ink-700)] border border-[var(--ink-700)] px-3 py-2 text-sm text-[var(--ink-100)] transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  )
}
