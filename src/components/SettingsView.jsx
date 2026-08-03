import { useState } from 'react'
import { DEFAULT_TASKS } from '../lib/challenge'

export default function SettingsView({ challenge, onSave, onAbandonAndRestart }) {
  const [name, setName] = useState(challenge.name)
  const [lengthDays, setLengthDays] = useState(challenge.lengthDays)
  const [tasks, setTasks] = useState(challenge.tasks)
  const [newTaskLabel, setNewTaskLabel] = useState('')
  const [confirmRestart, setConfirmRestart] = useState(false)

  const dirty =
    name !== challenge.name ||
    Number(lengthDays) !== challenge.lengthDays ||
    JSON.stringify(tasks) !== JSON.stringify(challenge.tasks)

  function addTask() {
    const label = newTaskLabel.trim()
    if (!label) return
    setTasks((prev) => [...prev, { id: crypto.randomUUID(), label }])
    setNewTaskLabel('')
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  function updateTaskLabel(id, label) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, label } : t)))
  }

  function restoreDefaults() {
    setTasks(DEFAULT_TASKS.map((t) => ({ ...t, id: crypto.randomUUID() })))
  }

  function save() {
    onSave({ name: name.trim() || 'My Challenge', lengthDays: Math.max(1, Number(lengthDays) || 75), tasks })
  }

  const inputClass =
    'w-full rounded-lg bg-ink-900 border border-ink-700 px-3 py-2 text-ink-50 focus:outline-none focus:border-violet-500 transition-colors'

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 className="font-display text-3xl text-ink-50 mb-6">Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-ink-300 mb-1.5">Challenge name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm text-ink-300 mb-1.5">Challenge length (days)</label>
          <input
            type="number"
            min={1}
            value={lengthDays}
            onChange={(e) => setLengthDays(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-ink-400 mt-1">
            Changing this only applies to your current attempt going forward.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm text-ink-300">Daily tasks</label>
            <button onClick={restoreDefaults} className="text-xs text-violet-400 hover:text-violet-300">
              Restore classic 75 Hard tasks
            </button>
          </div>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2">
                <input
                  value={task.label}
                  onChange={(e) => updateTaskLabel(task.id, e.target.value)}
                  className={`flex-1 text-sm ${inputClass}`}
                />
                <button
                  onClick={() => removeTask(task.id)}
                  className="text-ink-400 hover:text-rose-400 px-2 transition-colors"
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
              className={`flex-1 text-sm placeholder:text-ink-400 ${inputClass}`}
            />
            <button
              onClick={addTask}
              className="rounded-lg bg-ink-800 hover:bg-ink-700 border border-ink-700 px-3 py-2 text-sm text-ink-100 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        <button
          onClick={save}
          disabled={!dirty}
          className="w-full rounded-lg bg-violet-500 hover:bg-violet-600 disabled:bg-ink-800 disabled:text-ink-400 text-white font-medium py-2.5 transition-colors"
        >
          Save changes
        </button>

        <div className="pt-6 border-t border-ink-800">
          {!confirmRestart ? (
            <button onClick={() => setConfirmRestart(true)} className="text-sm text-rose-400 hover:text-rose-300">
              Give up and restart from Day 1
            </button>
          ) : (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4">
              <p className="text-sm text-rose-300 mb-3">
                This archives your current attempt as a reset and starts a brand new Day 1. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onAbandonAndRestart()
                    setConfirmRestart(false)
                  }}
                  className="rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm px-3 py-1.5 transition-colors"
                >
                  Yes, restart
                </button>
                <button
                  onClick={() => setConfirmRestart(false)}
                  className="rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-100 text-sm px-3 py-1.5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
