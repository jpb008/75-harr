import { useState } from 'react'
import { DEFAULT_TASKS, TASK_ICONS, TASK_COLORS } from '../lib/challenge'
import { ACCENT_PRESETS } from '../lib/accent'
import { BACKGROUND_PRESETS } from '../lib/background'

export default function SettingsView({
  challenge,
  onSave,
  onAbandonAndRestart,
  accentColor,
  onAccentChange,
  backgroundColor,
  onBackgroundChange,
  themeMode,
  onThemeModeChange,
}) {
  const [name, setName] = useState(challenge.name)
  const [lengthDays, setLengthDays] = useState(challenge.lengthDays)
  const [tasks, setTasks] = useState(challenge.tasks)
  const [newTaskLabel, setNewTaskLabel] = useState('')
  const [confirmRestart, setConfirmRestart] = useState(false)
  const [openPicker, setOpenPicker] = useState(null) // `${taskId}:icon` | `${taskId}:color` | null
  const [dragIndex, setDragIndex] = useState(null)

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

  function updateTask(id, patch) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function restoreDefaults() {
    setTasks(DEFAULT_TASKS.map((t) => ({ ...t, id: crypto.randomUUID() })))
  }

  function reorder(from, to) {
    setTasks((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  function save() {
    onSave({ name: name.trim() || 'My Challenge', lengthDays: Math.max(1, Number(lengthDays) || 75), tasks })
  }

  const inputClass =
    'w-full rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] px-3 py-2 text-[var(--ink-50)] focus:outline-none focus:border-[var(--accent)] transition-colors'

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 className="font-display text-3xl text-[var(--ink-50)] mb-6">Settings</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-2">Appearance</label>
          <div className="inline-flex rounded-lg border border-[var(--ink-700)] p-0.5 bg-[var(--ink-900)]">
            {['dark', 'light'].map((mode) => (
              <button
                key={mode}
                onClick={() => onThemeModeChange(mode)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  themeMode === mode ? 'bg-[var(--accent)] text-white' : 'text-[var(--ink-300)] hover:text-[var(--ink-50)]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <ColorPicker
          label="Background color"
          hint="Retints the dark base (surfaces, borders, text) — everything else stays the same."
          presets={BACKGROUND_PRESETS}
          value={backgroundColor}
          onChange={onBackgroundChange}
        />

        <ColorPicker
          label="Accent color"
          hint="Changes the accent only — the dark base stays whatever you set above."
          presets={ACCENT_PRESETS}
          value={accentColor}
          onChange={onAccentChange}
        />

        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Challenge name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Challenge length (days)</label>
          <input
            type="number"
            min={1}
            value={lengthDays}
            onChange={(e) => setLengthDays(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-[var(--ink-400)] mt-1">
            Changing this only applies to your current attempt going forward.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm text-[var(--ink-300)]">Daily tasks</label>
            <button onClick={restoreDefaults} className="text-xs text-[var(--accent-light)] hover:opacity-80">
              Restore classic 75 Hard tasks
            </button>
          </div>
          <p className="text-xs text-[var(--ink-400)] mb-2">Drag the handle to reorder.</p>
          <ul className="space-y-2">
            {tasks.map((task, index) => (
              <TaskRow
                key={task.id}
                task={task}
                dragging={dragIndex === index}
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault()
                  if (dragIndex !== null && dragIndex !== index) reorder(dragIndex, index)
                  setDragIndex(index)
                }}
                onDragEnd={() => setDragIndex(null)}
                onLabelChange={(label) => updateTask(task.id, { label })}
                onRemove={() => removeTask(task.id)}
                iconPickerOpen={openPicker === `${task.id}:icon`}
                colorPickerOpen={openPicker === `${task.id}:color`}
                onToggleIconPicker={() => setOpenPicker((p) => (p === `${task.id}:icon` ? null : `${task.id}:icon`))}
                onToggleColorPicker={() => setOpenPicker((p) => (p === `${task.id}:color` ? null : `${task.id}:color`))}
                onPickIcon={(icon) => {
                  updateTask(task.id, { icon })
                  setOpenPicker(null)
                }}
                onPickColor={(color) => {
                  updateTask(task.id, { color })
                  setOpenPicker(null)
                }}
                inputClass={inputClass}
              />
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
          onClick={save}
          disabled={!dirty}
          className="w-full rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-strong)] disabled:bg-[var(--ink-800)] disabled:text-[var(--ink-400)] text-white font-medium py-2.5 transition-colors"
        >
          Save changes
        </button>

        <div className="pt-6 border-t border-[var(--ink-800)]">
          {!confirmRestart ? (
            <button onClick={() => setConfirmRestart(true)} className="text-sm text-[var(--danger)] hover:opacity-80">
              Give up and restart from Day 1
            </button>
          ) : (
            <div className="rounded-lg border border-[var(--danger-border)] bg-[var(--danger-soft)] p-4">
              <p className="text-sm text-[var(--danger)] mb-3">
                This archives your current attempt as a reset and starts a brand new Day 1. Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onAbandonAndRestart()
                    setConfirmRestart(false)
                  }}
                  className="rounded-lg bg-[var(--danger)] hover:brightness-110 text-white text-sm px-3 py-1.5 transition-colors"
                >
                  Yes, restart
                </button>
                <button
                  onClick={() => setConfirmRestart(false)}
                  className="rounded-lg bg-[var(--ink-800)] hover:bg-[var(--ink-700)] text-[var(--ink-100)] text-sm px-3 py-1.5 transition-colors"
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

function TaskRow({
  task,
  dragging,
  onDragStart,
  onDragOver,
  onDragEnd,
  onLabelChange,
  onRemove,
  iconPickerOpen,
  colorPickerOpen,
  onToggleIconPicker,
  onToggleColorPicker,
  onPickIcon,
  onPickColor,
  inputClass,
}) {
  return (
    <li
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      className={`relative flex items-center gap-1.5 transition-opacity ${dragging ? 'opacity-40' : ''}`}
      style={task.color ? { borderLeft: `3px solid ${task.color}`, paddingLeft: '6px', marginLeft: '-9px' } : undefined}
    >
      <span className="text-[var(--ink-400)] cursor-grab select-none px-0.5" aria-hidden="true">
        ⠿
      </span>

      <div className="relative">
        <button
          onClick={onToggleIconPicker}
          className="w-9 h-9 shrink-0 rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] flex items-center justify-center text-base hover:border-[var(--ink-600)] transition-colors"
          aria-label="Choose icon"
        >
          {task.icon || '＋'}
        </button>
        {iconPickerOpen && (
          <div className="absolute z-10 top-11 left-0 grid grid-cols-4 gap-1 p-2 rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] shadow-xl w-40">
            <button
              onClick={() => onPickIcon(undefined)}
              className="w-8 h-8 rounded-md hover:bg-[var(--ink-800)] flex items-center justify-center text-xs text-[var(--ink-400)]"
              title="No icon"
            >
              ✕
            </button>
            {TASK_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => onPickIcon(icon)}
                className="w-8 h-8 rounded-md hover:bg-[var(--ink-800)] flex items-center justify-center text-base"
              >
                {icon}
              </button>
            ))}
          </div>
        )}
      </div>

      <input
        value={task.label}
        onChange={(e) => onLabelChange(e.target.value)}
        className={`flex-1 text-sm ${inputClass}`}
      />

      <div className="relative">
        <button
          onClick={onToggleColorPicker}
          className="w-7 h-7 shrink-0 rounded-full border border-[var(--ink-700)]"
          style={{ backgroundColor: task.color || 'var(--ink-800)' }}
          aria-label="Choose color"
        />
        {colorPickerOpen && (
          <div className="absolute z-10 top-9 right-0 flex flex-wrap gap-1.5 p-2 rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] shadow-xl w-36">
            <button
              onClick={() => onPickColor(undefined)}
              className="w-6 h-6 rounded-full border border-dashed border-[var(--ink-600)] flex items-center justify-center text-[10px] text-[var(--ink-400)]"
              title="No color"
            >
              ✕
            </button>
            {TASK_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onPickColor(color)}
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onRemove}
        className="text-[var(--ink-400)] hover:text-[var(--danger)] px-1.5 transition-colors"
        aria-label="Remove task"
      >
        ✕
      </button>
    </li>
  )
}

function ColorPicker({ label, hint, presets, value, onChange }) {
  const isPreset = presets.some((p) => p.hex.toLowerCase() === value.toLowerCase())

  return (
    <div>
      <label className="block text-sm text-[var(--ink-300)] mb-2">{label}</label>
      <div className="flex items-center gap-2.5 flex-wrap">
        {presets.map((preset) => {
          const selected = preset.hex.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={preset.hex}
              onClick={() => onChange(preset.hex)}
              title={preset.name}
              aria-label={preset.name}
              className={`w-8 h-8 rounded-full transition-transform ${selected ? 'scale-110' : 'hover:scale-105'}`}
              style={{
                backgroundColor: preset.hex,
                boxShadow: selected ? `0 0 0 2px var(--ink-950), 0 0 0 4px ${preset.hex}` : 'none',
              }}
            />
          )
        })}
        <label
          title="Custom color"
          className={`relative w-8 h-8 rounded-full border-2 border-dashed border-[var(--ink-600)] flex items-center justify-center text-[var(--ink-300)] text-xs cursor-pointer overflow-hidden ${
            !isPreset ? 'border-solid' : ''
          }`}
          style={!isPreset ? { backgroundColor: value, borderColor: value, color: 'transparent' } : undefined}
        >
          {isPreset ? '+' : ''}
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      </div>
      <p className="text-xs text-[var(--ink-400)] mt-2">{hint}</p>
    </div>
  )
}
