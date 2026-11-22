import { useState } from 'react'
import { X, Check, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react'
import { Button, NumberInput } from './ui'
import { exerciseById, isBodyweight } from '../lib/plan/exerciseLibrary'
import { suggestNext } from '../lib/plan/progression'

const KIND_ICON = { increase: TrendingUp, variation: TrendingUp, decrease: TrendingDown, hold: Minus, start: Sparkles }

function usesWeight(exerciseId) {
  const ex = exerciseById(exerciseId)
  return ex ? !isBodyweight(ex) && ex.bwLevel == null : true
}

function initialRows(ex, existing, suggestion, unit) {
  return Array.from({ length: ex.sets }, (_, i) => {
    const prior = existing?.sets?.[i]
    return {
      weight: prior?.weight ?? (usesWeight(ex.exerciseId) ? suggestion.weight : null),
      reps: prior?.reps ?? null,
      unit,
    }
  })
}

export default function WorkoutLogger({ session, workoutLogs, todayStr, unit, injuries = [], onSave, onClose }) {
  const todays = workoutLogs[todayStr]?.entries ?? {}
  const [rows, setRows] = useState(() =>
    Object.fromEntries(
      session.exercises.map((ex) => [ex.exerciseId, initialRows(ex, todays[ex.exerciseId], suggestNext(ex, workoutLogs, { unit, beforeDateStr: todayStr, injuries }), unit)])
    )
  )

  function setCell(exerciseId, index, field, value) {
    setRows((prev) => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    }))
  }

  function save() {
    const entries = {}
    for (const ex of session.exercises) {
      const sets = rows[ex.exerciseId].filter((r) => r.reps != null).map((r) => ({ weight: r.weight ?? null, reps: r.reps }))
      if (sets.length) entries[ex.exerciseId] = { unit, sets }
    }
    onSave(entries)
  }

  const loggedCount = session.exercises.filter((ex) => rows[ex.exerciseId].some((r) => r.reps != null)).length

  return (
    <div className="fixed inset-0 z-50 bg-[var(--ink-950)] overflow-y-auto animate-fade-in">
      <div className="sticky top-0 z-10 bg-[var(--ink-950)]/90 backdrop-blur-md border-b border-[var(--ink-800)]">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-[var(--ink-300)] uppercase tracking-[0.15em]">Log workout</p>
            <h2 className="text-[var(--ink-50)] font-semibold truncate">{session.label}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--ink-300)] hover:text-[var(--ink-50)] hover:bg-[var(--ink-800)]">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-4 pb-32 space-y-3">
        <p className="text-xs text-[var(--ink-300)]">
          Enter what you actually did. Weights are in {unit}. Leave a set blank if you skipped it.
        </p>
        {session.exercises.map((ex) => {
          const suggestion = suggestNext(ex, workoutLogs, { unit, beforeDateStr: todayStr, injuries })
          const Icon = KIND_ICON[suggestion.kind] ?? Minus
          const weighted = usesWeight(ex.exerciseId)
          const valueLabel = ex.unit === 'seconds' ? 'Seconds' : 'Reps'
          return (
            <div key={ex.exerciseId} className="rounded-2xl border border-[var(--ink-800)] bg-[var(--ink-900)] p-3.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--ink-50)]">
                  {ex.supersetGroup && <span className="text-[var(--accent-light)] mr-1.5">{ex.supersetGroup}</span>}
                  {ex.name}
                </p>
                <span className="text-xs text-[var(--ink-300)] tabular-nums shrink-0">
                  {ex.sets}×{ex.repRange[0]}-{ex.repRange[1]}
                  {ex.unit === 'seconds' ? 's' : ex.unit === 'perSide' ? '/side' : ''}
                </span>
              </div>
              <p className="flex gap-1.5 text-xs text-[var(--accent-light)] mt-1.5">
                <Icon size={14} className="shrink-0 mt-px" /> {suggestion.text}
              </p>
              {suggestion.last && <p className="text-xs text-[var(--ink-400)] mt-0.5 pl-5">Last time: {suggestion.last}</p>}
              <div className="mt-3 space-y-2">
                {rows[ex.exerciseId].map((row, i) => (
                  <div key={i} className="grid grid-cols-[2.5rem_1fr_1fr] gap-2 items-center">
                    <span className="text-xs text-[var(--ink-400)] font-medium">Set {i + 1}</span>
                    {weighted ? (
                      <NumberInput value={row.weight} onChange={(v) => setCell(ex.exerciseId, i, 'weight', v)} min={0} step={0.5} suffix={unit} placeholder="Weight" />
                    ) : (
                      <span className="text-xs text-[var(--ink-400)] px-1">Bodyweight</span>
                    )}
                    <NumberInput
                      value={row.reps}
                      onChange={(v) => setCell(ex.exerciseId, i, 'reps', v)}
                      min={0}
                      suffix={ex.unit === 'seconds' ? 's' : ''}
                      placeholder={valueLabel}
                    />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-10 bg-[var(--ink-950)] border-t border-[var(--ink-800)] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-xl mx-auto px-4 py-3">
          <Button onClick={save} disabled={loggedCount === 0} className="w-full">
            <Check size={16} /> Save workout {loggedCount > 0 ? `(${loggedCount} of ${session.exercises.length} exercises)` : ''}
          </Button>
        </div>
      </div>
    </div>
  )
}
