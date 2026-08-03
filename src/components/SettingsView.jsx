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

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

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
          <label className="block text-sm text-slate-400 mb-1.5">Challenge length (days)</label>
          <input
            type="number"
            min={1}
            value={lengthDays}
            onChange={(e) => setLengthDays(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:border-ember-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            Changing this only applies to your current attempt going forward.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm text-slate-400">Daily tasks</label>
            <button onClick={restoreDefaults} className="text-xs text-ember-400 hover:text-ember-300">
              Restore classic 75 Hard tasks
            </button>
          </div>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-2">
                <input
                  value={task.label}
                  onChange={(e) => updateTaskLabel(task.id, e.target.value)}
                  className="flex-1 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-ember-500"
                />
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
          onClick={save}
          disabled={!dirty}
          className="w-full rounded-lg bg-ember-500 hover:bg-ember-600 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium py-2.5 transition-colors"
        >
          Save changes
        </button>

        <div className="pt-6 border-t border-slate-800">
          {!confirmRestart ? (
            <button
              onClick={() => setConfirmRestart(true)}
              className="text-sm text-rose-400 hover:text-rose-300"
            >
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
                  className="rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-sm px-3 py-1.5"
                >
                  Yes, restart
                </button>
                <button
                  onClick={() => setConfirmRestart(false)}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm px-3 py-1.5"
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
