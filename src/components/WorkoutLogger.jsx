import { useState } from 'react'
import { X, Check, TrendingUp, TrendingDown, Minus, Sparkles, Timer, Info, PlayCircle, BellRing } from 'lucide-react'
import { useRestTimer, formatClock } from '../hooks/useRestTimer'
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

export default function WorkoutLogger({ session, workoutLogs, todayStr, unit, injuries = [], onSave, onClose, dateLabel, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const todays = workoutLogs[todayStr]?.entries ?? {}
  const rest = useRestTimer()
  const [tipsOpen, setTipsOpen] = useState({})
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
            <p className="text-xs text-[var(--ink-300)] uppercase tracking-[0.15em]">{dateLabel ? `Workout · ${dateLabel}` : 'Log workout'}</p>
            <h2 className="text-[var(--ink-50)] font-semibold truncate">{session.label}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="h-9 w-9 rounded-full flex items-center justify-center text-[var(--ink-300)] hover:text-[var(--ink-50)] hover:bg-[var(--ink-800)]">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className={`max-w-xl mx-auto px-4 pt-4 space-y-3 ${rest.active || rest.finished ? 'pb-64' : 'pb-32'}`}>
        <p className="text-xs text-[var(--ink-300)]">
          Enter what you actually did. Weights are in {unit}. Leave a set blank if you skipped it. Tap <Timer size={12} className="inline -mt-0.5" /> after a set to start your rest.
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
              {(ex.cues?.length > 0 || ex.videoUrl) && (
                <button
                  type="button"
                  onClick={() => setTipsOpen((prev) => ({ ...prev, [ex.exerciseId]: !prev[ex.exerciseId] }))}
                  aria-expanded={Boolean(tipsOpen[ex.exerciseId])}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--ink-200)] hover:text-[var(--ink-50)]"
                >
                  <Info size={13} /> {tipsOpen[ex.exerciseId] ? 'Hide form tips' : 'How to do it'}
                </button>
              )}
              {tipsOpen[ex.exerciseId] && (
                <div className="mt-2 rounded-xl bg-[var(--ink-950)] border border-[var(--ink-800)] p-3 space-y-2">
                  {ex.cues?.length > 0 && (
                    <ol className="space-y-1">
                      {ex.cues.map((cue, n) => (
                        <li key={n} className="flex gap-2 text-sm text-[var(--ink-100)]">
                          <span className="text-[var(--accent-light)] font-semibold tabular-nums">{n + 1}.</span>
                          {cue}
                        </li>
                      ))}
                    </ol>
                  )}
                  {ex.mistake && (
                    <p className="text-sm text-[var(--ink-200)]">
                      <span className="text-[var(--danger)] font-medium">Avoid: </span>
                      {ex.mistake}
                    </p>
                  )}
                  {ex.videoUrl && (
                    <a href={ex.videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-light)] hover:underline">
                      <PlayCircle size={16} /> Watch form videos
                    </a>
                  )}
                </div>
              )}
              <div className="mt-3 space-y-2">
                {rows[ex.exerciseId].map((row, i) => (
                  <div key={i} className="grid grid-cols-[2.5rem_minmax(0,1fr)_minmax(0,1fr)_2.5rem] gap-2 items-center">
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
                    <button
                      type="button"
                      onClick={() => rest.start(ex.restSeconds ?? 90, `${ex.name} · set ${i + 1} done`)}
                      aria-label={`Start rest after set ${i + 1}`}
                      title="Start rest timer"
                      className="h-10 w-10 rounded-xl border border-[var(--ink-700)] text-[var(--ink-200)] hover:text-[var(--ink-50)] hover:border-[var(--accent)] flex items-center justify-center"
                    >
                      <Timer size={17} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="fixed bottom-0 inset-x-0 z-10 bg-[var(--ink-950)] border-t border-[var(--ink-800)] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-xl mx-auto px-4 py-3">
          {rest.active && (
            <div className="mb-3 rounded-2xl border border-[var(--accent-a40)] bg-[var(--accent-a10)] p-3" role="timer" aria-live="off">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-[var(--ink-300)] truncate">Rest · {rest.label}</p>
                  <p className="text-3xl font-semibold text-[var(--ink-50)] tabular-nums leading-tight">{formatClock(rest.remaining)}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="secondary" className="!px-2.5" onClick={() => rest.adjust(-15)} aria-label="15 seconds less">
                    -15
                  </Button>
                  <Button variant="secondary" className="!px-2.5" onClick={() => rest.adjust(15)} aria-label="15 seconds more">
                    +15
                  </Button>
                  <Button variant="secondary" className="!px-2.5" onClick={rest.stop}>
                    Skip
                  </Button>
                </div>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-[var(--ink-800)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${rest.total ? (rest.remaining / rest.total) * 100 : 0}%` }} />
              </div>
            </div>
          )}
          {!rest.active && rest.finished && (
            <div className="mb-3 rounded-2xl border border-[var(--success)] bg-[var(--ink-900)] p-3 flex items-center gap-2 animate-fade-in" role="status">
              <BellRing size={18} className="text-[var(--success)] shrink-0" />
              <p className="text-sm font-medium text-[var(--ink-50)]">Rest's up — next set!</p>
            </div>
          )}
          {onDelete && (
            <div className="mb-2 text-center">
              {confirmDelete ? (
                <p className="text-sm text-[var(--ink-200)]">
                  Delete this day's log?{' '}
                  <button type="button" onClick={onDelete} className="font-semibold text-[var(--danger)] hover:underline">
                    Delete
                  </button>{' '}
                  ·{' '}
                  <button type="button" onClick={() => setConfirmDelete(false)} className="text-[var(--ink-300)] hover:underline">
                    Keep
                  </button>
                </p>
              ) : (
                <button type="button" onClick={() => setConfirmDelete(true)} className="text-xs text-[var(--danger)] hover:underline">
                  Delete this log
                </button>
              )}
            </div>
          )}
          <Button onClick={save} disabled={loggedCount === 0} className="w-full">
            <Check size={16} /> Save workout {loggedCount > 0 ? `(${loggedCount} of ${session.exercises.length} exercises)` : ''}
          </Button>
        </div>
      </div>
    </div>
  )
}
