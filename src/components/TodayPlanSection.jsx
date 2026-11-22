import { Dumbbell, HeartPulse, BedDouble, Brain, Wallet, Apple, ChevronRight, Check, Quote, Footprints } from 'lucide-react'
import Disclaimer from './Disclaimer'
import { Card, IconBadge } from './ui'

function CheckRow({ checked, onChange, children, extra }) {
  return (
    <label
      className={`flex items-start gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-colors ${
        checked ? 'bg-[var(--accent-a08)]' : 'hover:bg-[var(--ink-800)]/50'
      }`}
    >
      <input type="checkbox" checked={checked} onChange={onChange} className="task-check mt-0.5" />
      <span className={`text-sm leading-relaxed ${checked ? 'text-[var(--ink-300)] line-through decoration-[var(--ink-400)]' : 'text-[var(--ink-100)]'}`}>
        {children}
        {extra}
      </span>
    </label>
  )
}

function CardHeader({ icon, title, subtitle, right, tone }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <IconBadge icon={icon} tone={tone} />
      <div className="min-w-0 flex-1">
        <h3 className="text-[var(--ink-50)] font-semibold leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--ink-300)] mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

function formatReps(ex) {
  const [lo, hi] = ex.repRange
  const range = lo === hi ? `${lo}` : `${lo}-${hi}`
  return ex.unit === 'seconds' ? `${ex.sets}×${range}s` : ex.unit === 'perSide' ? `${ex.sets}×${range}/side` : `${ex.sets}×${range}`
}

export default function TodayPlanSection({ plan, planDayApi, onOpenPlan, motivationWhy }) {
  if (!plan) return null
  const { todayRecord, todaysSession, toggleMentalDev, toggleFinancial, isFinancialDone, setWorkoutDone } = planDayApi
  const todayDow = new Date().getDay()
  const todayPlan = plan.workout.weekSchedule?.find((d) => d.dayOfWeek === todayDow)

  const dailyMentalTasks = plan.mentalDev.tasks.filter((t) => t.cadence === 'daily')
  const financialActions = plan.financial.paths.flatMap((p) =>
    p.weeklyActions.map((action, i) => ({
      id: `${p.id}-${i}`,
      label: action,
      requiresDisclosureReminder: p.requiresDisclosureReminder,
    }))
  )
  const doneMental = dailyMentalTasks.filter((t) => todayRecord.mentalDev[t.id]).length
  const doneMoney = financialActions.filter((a) => isFinancialDone(a.id)).length
  const workoutDone = todayRecord.workout.completed

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs uppercase tracking-[0.15em] text-[var(--ink-300)] font-semibold">Your plan today</h2>
        <button type="button" onClick={onOpenPlan} className="text-xs font-medium text-[var(--accent-light)] inline-flex items-center gap-0.5">
          Full plan <ChevronRight size={14} />
        </button>
      </div>

      {motivationWhy && (
        <Card className="p-3.5 flex gap-3">
          <Quote size={16} className="text-[var(--accent-light)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--ink-200)] italic">{motivationWhy}</p>
        </Card>
      )}

      {todaysSession ? (
        <Card className={`p-4 ${workoutDone ? 'border-[var(--success-border)]' : ''}`}>
          <CardHeader
            icon={todaysSession.type === 'cardio' ? HeartPulse : Dumbbell}
            tone={workoutDone ? 'success' : 'accent'}
            title={todaysSession.label}
            subtitle={`About ${todaysSession.estimatedMinutes} min${todaysSession.format === 'superset' ? ' · supersets' : ''}`}
          />
          {todaysSession.type === 'cardio' ? (
            <p className="text-sm text-[var(--ink-200)] leading-relaxed">{todaysSession.cardio.description}</p>
          ) : (
            <ul className="divide-y divide-[var(--ink-800)]">
              {todaysSession.exercises.map((ex, i) => (
                <li key={ex.exerciseId} className="flex items-center justify-between gap-3 py-2">
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[11px] font-semibold text-[var(--ink-400)] w-5 shrink-0">{ex.supersetGroup ?? i + 1}</span>
                    <span className="text-sm text-[var(--ink-100)] truncate">{ex.name}</span>
                  </span>
                  <span className="text-xs text-[var(--ink-300)] tabular-nums shrink-0">{formatReps(ex)}</span>
                </li>
              ))}
              {todaysSession.finisher && (
                <li className="flex items-center justify-between gap-3 py-2">
                  <span className="text-sm text-[var(--ink-100)] pl-7">{todaysSession.finisher.label}</span>
                  <span className="text-xs text-[var(--ink-300)] shrink-0">{todaysSession.finisher.minutes} min</span>
                </li>
              )}
            </ul>
          )}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={onOpenPlan}
              className="flex-1 rounded-xl border border-[var(--ink-700)] py-2.5 text-sm font-medium text-[var(--ink-100)] hover:border-[var(--ink-600)]"
            >
              Warm-up & form tips
            </button>
            <button
              type="button"
              onClick={() => setWorkoutDone(!workoutDone)}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                workoutDone ? 'bg-[var(--success-soft)] text-[var(--success)] border border-[var(--success-border)]' : 'bg-[var(--accent)] text-white'
              }`}
            >
              <Check size={16} /> {workoutDone ? 'Done!' : 'Mark done'}
            </button>
          </div>
        </Card>
      ) : (
        todayPlan && (
          <Card className="p-4">
            <CardHeader
              icon={todayPlan.type === 'recovery' ? Footprints : BedDouble}
              tone="muted"
              title={todayPlan.title}
              subtitle={todayPlan.detail}
            />
          </Card>
        )
      )}

      {dailyMentalTasks.length > 0 && (
        <Card className="p-4">
          <CardHeader icon={Brain} title="Mind & habits" subtitle={`${doneMental} of ${dailyMentalTasks.length} done`} />
          <div className="space-y-0.5 -mx-1">
            {dailyMentalTasks.map((task) => (
              <CheckRow key={task.id} checked={Boolean(todayRecord.mentalDev[task.id])} onChange={() => toggleMentalDev(task.id)}>
                {task.label}
              </CheckRow>
            ))}
          </div>
        </Card>
      )}

      {financialActions.length > 0 && (
        <Card className="p-4">
          <CardHeader icon={Wallet} title="This week's money moves" subtitle={`${doneMoney} of ${financialActions.length} done this week`} />
          <div className="space-y-0.5 -mx-1">
            {financialActions.map((action) => (
              <CheckRow
                key={action.id}
                checked={isFinancialDone(action.id)}
                onChange={() => toggleFinancial(action.id)}
                extra={action.requiresDisclosureReminder ? <span className="text-[var(--ink-400)] text-xs"> (remember to disclose)</span> : null}
              >
                {action.label}
              </CheckRow>
            ))}
          </div>
          <Disclaimer text={plan.financial.disclaimer} />
        </Card>
      )}

      {plan.nutrition && (
        <Card className="p-4">
          <CardHeader icon={Apple} title="Nutrition" />
          {plan.nutrition.safeMode ? (
            <ul className="text-sm text-[var(--ink-200)] space-y-1.5 list-disc pl-4">
              {plan.nutrition.habits.map((habit, i) => (
                <li key={i}>{habit}</li>
              ))}
            </ul>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {plan.nutrition.calories && (
                <div className="rounded-xl bg-[var(--ink-950)] border border-[var(--ink-800)] p-3">
                  <p className="text-xs text-[var(--ink-300)]">Calories</p>
                  <p className="text-base font-semibold text-[var(--ink-50)] tabular-nums">
                    {plan.nutrition.calories.range[0]}-{plan.nutrition.calories.range[1]}
                  </p>
                </div>
              )}
              {plan.nutrition.proteinTarget && (
                <div className="rounded-xl bg-[var(--ink-950)] border border-[var(--ink-800)] p-3">
                  <p className="text-xs text-[var(--ink-300)]">Protein</p>
                  <p className="text-base font-semibold text-[var(--ink-50)] tabular-nums">
                    {plan.nutrition.proteinTarget.gramsPerDay
                      ? `${plan.nutrition.proteinTarget.gramsPerDay[0]}-${plan.nutrition.proteinTarget.gramsPerDay[1]}g`
                      : `${plan.nutrition.proteinTarget.gramsPerKgRange[0]}-${plan.nutrition.proteinTarget.gramsPerKgRange[1]} g/kg`}
                  </p>
                </div>
              )}
              {plan.nutrition.rateOfChangeGuidance && <p className="col-span-2 text-xs text-[var(--ink-300)] mt-1">{plan.nutrition.rateOfChangeGuidance}</p>}
            </div>
          )}
          <Disclaimer text={plan.nutrition.disclaimer} />
        </Card>
      )}
    </div>
  )
}
