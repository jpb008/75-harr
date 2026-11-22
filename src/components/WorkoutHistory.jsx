import { useMemo, useState } from 'react'
import { History, Plus, ChevronRight, Trophy } from 'lucide-react'
import { SectionCard, Button, DateInput, Disclosure } from './ui'
import WorkoutLogger from './WorkoutLogger'
import { parseDateStr, addDays } from '../lib/dates'
import { exerciseById } from '../lib/plan/exerciseLibrary'
import { personalRecords } from '../lib/plan/trends'

const prettyDate = (d) => parseDateStr(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

function strengthSessions(plan) {
  return (plan?.workout?.sessions ?? []).filter((s) => s.exercises?.length)
}

// A logger session for a past day: the planned session if it still
// exists, plus any exercises that were logged but are no longer in it.
function sessionForDay(plan, log, dateStr, chosenId) {
  const sessions = strengthSessions(plan)
  const dow = parseDateStr(dateStr).getDay()
  const base = sessions.find((s) => s.id === (chosenId ?? log?.sessionId)) ?? sessions.find((s) => s.dayOfWeek === dow) ?? sessions[0]
  const exercises = [...(base?.exercises ?? [])]
  for (const [id, entry] of Object.entries(log?.entries ?? {})) {
    if (exercises.some((e) => e.exerciseId === id)) continue
    const lib = exerciseById(id)
    const reps = entry.sets.map((s) => s.reps).filter(Boolean)
    exercises.push({
      exerciseId: id,
      name: lib?.name ?? id,
      sets: Math.max(1, entry.sets.length),
      repRange: [Math.min(...reps, 8), Math.max(...reps, 12)],
      unit: lib?.unit ?? 'reps',
      restSeconds: 90,
      cues: lib?.cues,
      mistake: lib?.mistake,
    })
  }
  return { id: base?.id ?? `custom-${dow}`, dayOfWeek: base?.dayOfWeek ?? dow, label: base?.label ?? 'Workout', exercises }
}

export default function WorkoutHistory({ plan, workoutLogs, unit, injuries, todayStr, onSave, onDelete }) {
  const [editing, setEditing] = useState(null) // { dateStr, sessionId }
  const [adding, setAdding] = useState(false)
  const [newDate, setNewDate] = useState(addDays(todayStr, -1))
  const [newSessionId, setNewSessionId] = useState(null)
  const [showAll, setShowAll] = useState(false)

  const days = useMemo(
    () =>
      Object.entries(workoutLogs ?? {})
        .filter(([, d]) => Object.values(d?.entries ?? {}).some((e) => e?.sets?.some((s) => s.reps)))
        .sort(([a], [b]) => b.localeCompare(a)),
    [workoutLogs],
  )
  const records = useMemo(() => personalRecords(workoutLogs, unit), [workoutLogs, unit])
  const sessions = strengthSessions(plan)
  const visible = showAll ? days : days.slice(0, 6)

  if (editing) {
    const log = workoutLogs[editing.dateStr]
    const session = sessionForDay(plan, log, editing.dateStr, editing.sessionId)
    return (
      <WorkoutLogger
        session={session}
        workoutLogs={workoutLogs}
        todayStr={editing.dateStr}
        dateLabel={prettyDate(editing.dateStr)}
        unit={unit}
        injuries={injuries}
        onClose={() => setEditing(null)}
        onSave={(entries) => {
          // Keep logged exercises that aren't part of this session.
          const kept = Object.fromEntries(Object.entries(log?.entries ?? {}).filter(([id]) => !session.exercises.some((e) => e.exerciseId === id)))
          onSave(editing.dateStr, session, { ...kept, ...entries })
          setEditing(null)
        }}
        onDelete={log ? () => { onDelete(editing.dateStr, session); setEditing(null) } : undefined}
      />
    )
  }

  return (
    <SectionCard icon={History} title="Workout history" hint="Tap a day to see or fix what you logged. Forgot to log one? Add it here.">
      {adding ? (
        <div className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-950)] p-3 space-y-2.5">
          <p className="text-sm font-medium text-[var(--ink-50)]">Log a past workout</p>
          <DateInput value={newDate} onChange={setNewDate} max={todayStr} ariaLabel="Workout date" />
          {sessions.length > 1 && (
            <select
              value={newSessionId ?? sessionForDay(plan, null, newDate).id}
              onChange={(e) => setNewSessionId(e.target.value)}
              aria-label="Which workout"
              className="w-full min-w-0 rounded-xl bg-[var(--ink-900)] border border-[var(--ink-700)] px-3 py-2 text-sm text-[var(--ink-50)]"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!newDate || newDate > todayStr}
              onClick={() => {
                setEditing({ dateStr: newDate, sessionId: newSessionId })
                setAdding(false)
                setNewSessionId(null)
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" className="w-full" onClick={() => setAdding(true)} disabled={!sessions.length}>
          <Plus size={15} /> Log a past workout
        </Button>
      )}

      {days.length === 0 ? (
        <p className="text-sm text-[var(--ink-300)]">No workouts logged yet.</p>
      ) : (
        <ul className="divide-y divide-[var(--ink-800)]">
          {visible.map(([date, d]) => {
            const entries = Object.entries(d.entries).filter(([, e]) => e?.sets?.some((s) => s.reps))
            const sets = entries.reduce((n, [, e]) => n + e.sets.filter((s) => s.reps).length, 0)
            const label = strengthSessions(plan).find((s) => s.id === d.sessionId)?.label ?? 'Workout'
            return (
              <li key={date}>
                <button type="button" onClick={() => setEditing({ dateStr: date, sessionId: d.sessionId })} className="w-full flex items-center justify-between gap-3 py-2.5 text-left">
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-[var(--ink-50)]">{prettyDate(date)}</span>
                    <span className="block text-xs text-[var(--ink-300)] truncate">
                      {label} · {entries.length} exercise{entries.length === 1 ? '' : 's'} · {sets} set{sets === 1 ? '' : 's'}
                    </span>
                  </span>
                  <ChevronRight size={16} className="text-[var(--ink-400)] shrink-0" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {days.length > 6 && (
        <button type="button" onClick={() => setShowAll(!showAll)} className="w-full text-center text-xs text-[var(--ink-300)] hover:text-[var(--ink-50)]">
          {showAll ? 'Show fewer' : `Show all ${days.length} workouts`}
        </button>
      )}

      {records.length > 0 && (
        <Disclosure title="Personal records" subtitle={`Your best on ${records.length} exercise${records.length === 1 ? '' : 's'}`} left={<Trophy size={18} className="text-[var(--accent-light)] shrink-0" />}>
          <ul className="space-y-1.5">
            {records.map((r) => (
              <li key={r.exerciseId} className="flex items-start justify-between gap-3 text-sm">
                <span className="min-w-0 text-[var(--ink-100)]">{r.name}</span>
                <span className="text-right shrink-0">
                  <span className="block font-semibold text-[var(--ink-50)] tabular-nums">{r.detail}</span>
                  <span className="block text-[11px] text-[var(--ink-400)]">
                    {r.weighted ? `est. max ${r.value} ${r.unit} · ` : ''}
                    {prettyDate(r.date)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Disclosure>
      )}
    </SectionCard>
  )
}
