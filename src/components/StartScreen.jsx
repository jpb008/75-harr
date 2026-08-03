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

      <h1 className="text-3xl font-bold text-white mb-1">Start your challenge</h1>
      <p className="text-slate-400 text-sm mb-8">
        Customize the rules, or keep the classic 75 Hard checklist. Miss a single task and it's back to Day 1.
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Challenge name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:border-ember-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Length (days)</label>
          <input
            type="number"
            min={1}
            value={lengthDays}
            onChange={(e) => setLengthDays(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:border-ember-500"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Daily tasks</label>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2">
                <span className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-100">
                  {task.label}
                </span>
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-slate-500 hover:text-rose-400 px-2"
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
              className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-ember-500"
            />
            <button
              onClick={addTask}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-sm text-slate-200"
            >
              Add
            </button>
          </div>
        </div>

        <button
          onClick={() =>
            onStart({ name: name.trim() || 'My Challenge', lengthDays: Math.max(1, Number(lengthDays) || 75), tasks })
          }
          className="w-full rounded-lg bg-ember-500 hover:bg-ember-600 text-white font-medium py-2.5 transition-colors"
        >
          Start Day 1
        </button>
      </div>
    </div>
  )
}
