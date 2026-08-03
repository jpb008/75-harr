import { useState } from 'react'
import { DEFAULT_TASKS } from '../lib/challenge'
import { ACCENT_PRESETS } from '../lib/accent'

export default function SettingsView({ challenge, onSave, onAbandonAndRestart, accentColor, onAccentChange }) {
  const [name, setName] = useState(challenge.name)
  const [lengthDays, setLengthDays] = useState(challenge.lengthDays)
  const [tasks, setTasks] = useState(challenge.tasks)
  const [newTaskLabel, setNewTaskLabel] = useState('')
  const [confirmRestart, setConfirmRestart] = useState(false)

  const dirty =
    name !== challenge.name ||
    Number(lengthDays) !== challenge.lengthDays ||
    JSON.stringify(tasks) !== JSON.stringify(challenge.tasks)

  const isPreset = ACCENT_PRESETS.some((p) => p.hex.toLowerCase() === accentColor.toLowerCase())

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
    'w-full rounded-lg bg-ink-900 border border-ink-700 px-3 py-2 text-ink-50 focus:outline-none focus:border-[var(--accent)] transition-colors'

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 className="font-display text-3xl text-ink-50 mb-6">Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-ink-300 mb-2">Accent color</label>
          <div className="flex items-center gap-2.5 flex-wrap">
            {ACCENT_PRESETS.map((preset) => {
              const selected = preset.hex.toLowerCase() === accentColor.toLowerCase()
              return (
                <button
                  key={preset.hex}
                  onClick={() => onAccentChange(preset.hex)}
                  title={preset.name}
                  aria-label={preset.name}
                  className={`w-8 h-8 rounded-full transition-transform ${selected ? 'scale-110' : 'hover:scale-105'}`}
                  style={{
                    backgroundColor: preset.hex,
                    boxShadow: selected ? `0 0 0 2px #120a1f, 0 0 0 4px ${preset.hex}` : 'none',
                  }}
                />
              )
            })}
            <label
              title="Custom color"
              className={`relative w-8 h-8 rounded-full border-2 border-dashed border-ink-600 flex items-center justify-center text-ink-300 text-xs cursor-pointer overflow-hidden ${
                !isPreset ? 'border-solid' : ''
              }`}
              style={!isPreset ? { backgroundColor: accentColor, borderColor: accentColor, color: 'transparent' } : undefined}
            >
              {isPreset ? '+' : ''}
              <input
                type="color"
                value={accentColor}
                onChange={(e) => onAccentChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
          </div>
          <p className="text-xs text-ink-400 mt-2">
            Changes the accent only — the dark base theme stays the same.
          </p>
        </div>

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
            <button onClick={restoreDefaults} className="text-xs text-[var(--accent-light)] hover:opacity-80">
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
          className="w-full rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-strong)] disabled:bg-ink-800 disabled:text-ink-400 text-white font-medium py-2.5 transition-colors"
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
