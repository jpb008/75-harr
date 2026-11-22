import { useMemo, useState } from 'react'
import { Target, Plus, Trash2, Trophy } from 'lucide-react'
import { SectionCard, Segmented, Button, NumberInput, DateInput, Field } from './ui'
import { parseDateStr } from '../lib/dates'
import { loggedExercises, liftSeries, weightSeries, targetProgress } from '../lib/plan/trends'

const pretty = (d) => parseDateStr(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const fmt = (n) => (Math.round(n * 10) / 10).toLocaleString()

function statusText(goal, pr, unitLabel) {
  const per = (v) => `${v > 0 ? '+' : ''}${fmt(v)} ${unitLabel}/week`
  switch (pr.status) {
    case 'reached':
      return { tone: 'success', text: 'Target reached. Set a new one!' }
    case 'noData':
      return { tone: 'muted', text: goal.kind === 'weight' ? 'Log a weigh-in to start tracking.' : 'Log this exercise to start tracking.' }
    case 'needMoreData':
      return { tone: 'muted', text: `Keep logging. A finish date shows after about 3 entries over 2 weeks.${pr.neededPerWeek ? ` You need ${per(pr.neededPerWeek)} to make your date.` : ''}` }
    case 'offTrack':
      return { tone: 'warn', text: `Recent trend is ${per(pr.perWeek)}, away from your target.${pr.neededPerWeek ? ` You need ${per(pr.neededPerWeek)} to make your date.` : ''}` }
    case 'behind':
      return { tone: 'warn', text: `At ${per(pr.perWeek)} you'd get there around ${pretty(pr.eta)}, after your date. You need ${per(pr.neededPerWeek)}.` }
    default:
      return { tone: 'success', text: `At ${per(pr.perWeek)} you'll get there around ${pretty(pr.eta)}.${goal.deadline ? ' On track for your date.' : ''}` }
  }
}

export default function TargetGoals({ targets, setTargets, workoutLogs, weighIns, plan, unit, allowWeight, todayStr }) {
  const [adding, setAdding] = useState(false)
  const [kind, setKind] = useState('lift')
  const exercises = useMemo(() => {
    const logged = loggedExercises(workoutLogs)
    const planned = (plan?.workout?.sessions ?? []).flatMap((s) => s.exercises ?? []).map((e) => ({ id: e.exerciseId, name: e.name }))
    const all = [...logged, ...planned].filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i)
    return all
  }, [workoutLogs, plan])
  const [exerciseId, setExerciseId] = useState(null)
  const [target, setTarget] = useState(null)
  const [deadline, setDeadline] = useState('')
  const data = { workoutLogs, weighIns, unit, todayStr }
  const exId = exerciseId ?? exercises[0]?.id

  function add() {
    if (!target) return
    const points = kind === 'weight' ? weightSeries(weighIns, unit) : liftSeries(workoutLogs, exId, unit).points
    const goal = {
      id: crypto.randomUUID(),
      kind,
      exerciseId: kind === 'lift' ? exId : null,
      name: kind === 'lift' ? exercises.find((e) => e.id === exId)?.name : 'Body weight',
      target,
      unit,
      deadline: deadline || null,
      startValue: points.length ? points[points.length - 1].value : null,
      createdAt: todayStr,
    }
    setTargets((prev) => [...prev, goal])
    setAdding(false)
    setTarget(null)
    setDeadline('')
  }

  const kinds = [{ id: 'lift', label: 'Lift' }, ...(allowWeight ? [{ id: 'weight', label: 'Body weight' }] : [])]

  return (
    <SectionCard icon={Target} title="Targets" hint="Set a number to hit. The app estimates when you'll get there from your logged trend.">
      {targets.length === 0 && !adding && <p className="text-sm text-[var(--ink-300)]">No targets yet. Try "squat 225 lb" or a goal weight.</p>}
      <ul className="space-y-3">
        {targets.map((goal) => {
          const pr = targetProgress(goal, data)
          const unitLabel = goal.kind === 'weight' ? unit : liftSeries(workoutLogs, goal.exerciseId, unit).unit
          const st = statusText(goal, pr, unitLabel)
          return (
            <li key={goal.id} className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-950)] p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--ink-50)]">
                    {goal.name}: {fmt(goal.target)} {unitLabel}
                    {goal.kind === 'lift' && unitLabel === unit ? ' (est. max)' : ''}
                  </p>
                  <p className="text-xs text-[var(--ink-300)]">
                    {pr.current != null ? `Now ${fmt(pr.current)} ${unitLabel}` : 'No data yet'}
                    {goal.deadline ? ` · by ${pretty(goal.deadline)}` : ''}
                  </p>
                </div>
                <button type="button" onClick={() => setTargets((prev) => prev.filter((g) => g.id !== goal.id))} aria-label={`Delete ${goal.name} target`} className="p-1.5 rounded-lg text-[var(--ink-400)] hover:text-[var(--danger)] hover:bg-[var(--ink-800)] shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="mt-2 h-2 rounded-full bg-[var(--ink-800)] overflow-hidden" role="progressbar" aria-valuenow={pr.pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${goal.name} progress`}>
                <div className={`h-full rounded-full ${pr.status === 'reached' ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'}`} style={{ width: `${pr.pct}%` }} />
              </div>
              <p className={`flex gap-1.5 text-xs mt-2 ${st.tone === 'success' ? 'text-[var(--success)]' : st.tone === 'warn' ? 'text-[var(--ink-100)]' : 'text-[var(--ink-300)]'}`}>
                {pr.status === 'reached' && <Trophy size={13} className="shrink-0 mt-px" />}
                {st.text}
              </p>
            </li>
          )
        })}
      </ul>

      {adding ? (
        <div className="rounded-xl border border-[var(--accent-a40)] p-3 space-y-3">
          <Segmented options={kinds} value={kind} onChange={setKind} />
          {kind === 'lift' && (
            <Field label="Exercise">
              {exercises.length ? (
                <select value={exId} onChange={(e) => setExerciseId(e.target.value)} className="w-full min-w-0 rounded-xl bg-[var(--ink-950)] border border-[var(--ink-700)] px-3 py-2 text-sm text-[var(--ink-50)]">
                  {exercises.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-[var(--ink-300)]">Build a plan with workouts first.</p>
              )}
            </Field>
          )}
          <Field label={kind === 'weight' ? `Goal weight (${unit})` : `Target (${unit} estimated max, or reps for bodyweight moves)`}>
            <NumberInput value={target} onChange={setTarget} min={1} step={0.5} suffix={kind === 'weight' ? unit : ''} placeholder={kind === 'weight' ? 'e.g. 170' : 'e.g. 225'} />
          </Field>
          <Field label="By when?" optional>
            <DateInput value={deadline} onChange={setDeadline} ariaLabel="Target date" />
          </Field>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={add} disabled={!target || (kind === 'lift' && !exId)}>
              Add target
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" className="w-full" onClick={() => setAdding(true)}>
          <Plus size={15} /> Add a target
        </Button>
      )}
    </SectionCard>
  )
}
