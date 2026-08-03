import { useState } from 'react'
import { DEFAULT_TASKS } from '../lib/challenge'

export default function StartScreen({ onStart, justFinished, onDismissFinished }) {
  const [name, setName] = useState('75 Hard')
  const [lengthDays, setLengthDays] = useState(75)
  const [tasks, setTasks] = useState(DEFAULT_TASKS)
  const [newTaskLabel, setNewTaskLabel] = useState('')

  function addTask() {
    const label = newTaskLabel.trim()
    if (!label) return
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), label }])
    setNewTaskLabel('')
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const inputClass =
    'w-full rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] px-3 py-2 text-[var(--ink-50)] focus:outline-none focus:border-[var(--accent)] transition-colors'

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {justFinished && (
        <div className="mb-8 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center">
          <p className="text-emerald-300 font-semibold text-lg">🎉 Challenge complete!</p>
          <p className="text-emerald-400/80 text-sm mt-1">You made it every single day. Start a new one below.</p>
          <button onClick={onDismissFinished} className="text-xs text-emerald-500 hover:text-emerald-400 mt-2">
            Dismiss
          </button>
        </div>
      )}

      <p className="font-display text-lg text-[var(--accent-light)] tracking-wide">75<span className="text-[var(--ink-100)]">HARD</span></p>
      <h1 className="font-display text-5xl leading-none text-[var(--ink-50)] mt-1 mb-2">Start your challenge</h1>
      <p className="text-[var(--ink-300)] text-sm mb-8 max-w-md">
        Customize the rules, or keep the classic checklist. Miss a single task and it's back to Day 1.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Challenge name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Length (days)</label>
          <input
            type="number"
            min={1}
            value={lengthDays}
            onChange={(e) => setLengthDays(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Daily tasks</label>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2">
                <span className="flex-1 rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] px-3 py-2 text-sm text-[var(--ink-50)]">
                  {task.label}
                </span>
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-[var(--ink-400)] hover:text-rose-400 px-2 transition-colors"
                  aria-label="Remove task"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 mt-3">
            <input
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add a new daily task..."
              className={`flex-1 text-sm placeholder:text-[var(--ink-400)] ${inputClass}`}
            />
            <button
              onClick={addTask}
              className="rounded-lg bg-[var(--ink-800)] hover:bg-[var(--ink-700)] border border-[var(--ink-700)] px-3 py-2 text-sm text-[var(--ink-100)] transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <button
          onClick={() =>
            onStart({ name: name.trim() || 'My Challenge', lengthDays: Math.max(1, Number(lengthDays) || 75), tasks })
          }
          className="w-full rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white font-medium py-2.5 transition-colors shadow-[0_0_24px_-8px_var(--accent-a70)]"
        >
          Start Day 1
        </button>
      </div>
    </div>
  )
}
