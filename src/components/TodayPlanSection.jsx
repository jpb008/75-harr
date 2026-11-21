import Disclaimer from './Disclaimer'

export default function TodayPlanSection({ plan, planDayApi }) {
  if (!plan) return null
  const { todayRecord, todaysSession, toggleMentalDev, toggleFinancial, isFinancialDone, setWorkoutDone } = planDayApi

  const dailyMentalTasks = plan.mentalDev.tasks.filter((t) => t.cadence === 'daily')
  const financialActions = plan.financial.paths.flatMap((p) =>
    p.weeklyActions.map((action, i) => ({
      id: `${p.id}-${i}`,
      label: action,
      requiresDisclosureReminder: p.requiresDisclosureReminder,
    }))
  )

  return (
    <div className="mt-8 space-y-6">
      {todaysSession && (
        <div className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-900)] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[var(--ink-50)] font-medium">{todaysSession.label} workout</h3>
            <label className="flex items-center gap-2 text-sm text-[var(--ink-300)]">
              <input type="checkbox" checked={todayRecord.workout.completed} onChange={(e) => setWorkoutDone(e.target.checked)} />
              Done
            </label>
          </div>
          <ul className="space-y-1.5 text-sm text-[var(--ink-200)]">
            {todaysSession.exercises.map((ex) => (
              <li key={ex.exerciseId}>
                {ex.name} — {ex.sets} × {ex.repRange[0]}-{ex.repRange[1]} reps, rest {ex.restSeconds}s
              </li>
            ))}
          </ul>
        </div>
      )}

      {dailyMentalTasks.length > 0 && (
        <div className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-900)] p-4">
          <h3 className="text-[var(--ink-50)] font-medium mb-3">Personal development</h3>
          <ul className="space-y-2">
            {dailyMentalTasks.map((task) => (
              <li key={task.id}>
                <label className="flex items-center gap-2 text-sm text-[var(--ink-200)]">
                  <input
                    type="checkbox"
                    checked={Boolean(todayRecord.mentalDev[task.id])}
                    onChange={() => toggleMentalDev(task.id)}
                  />
                  {task.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {financialActions.length > 0 && (
        <div className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-900)] p-4">
          <h3 className="text-[var(--ink-50)] font-medium mb-3">This week's income-building actions</h3>
          <ul className="space-y-2">
            {financialActions.map((action) => (
              <li key={action.id}>
                <label className="flex items-center gap-2 text-sm text-[var(--ink-200)]">
                  <input type="checkbox" checked={isFinancialDone(action.id)} onChange={() => toggleFinancial(action.id)} />
                  {action.label}
                  {action.requiresDisclosureReminder && (
                    <span className="text-[var(--ink-400)] text-xs">(remember disclosure)</span>
                  )}
                </label>
              </li>
            ))}
          </ul>
          <Disclaimer text={plan.financial.disclaimer} />
        </div>
      )}

      {plan.nutrition && (
        <div className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-900)] p-4">
          <h3 className="text-[var(--ink-50)] font-medium mb-2">Nutrition</h3>
          {plan.nutrition.safeMode ? (
            <ul className="text-sm text-[var(--ink-200)] space-y-1 list-disc pl-4">
              {plan.nutrition.habits.map((habit, i) => (
                <li key={i}>{habit}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-[var(--ink-200)] space-y-1">
              <p>
                Protein target:{' '}
                {plan.nutrition.proteinTarget.gramsPerDay
                  ? `${plan.nutrition.proteinTarget.gramsPerDay[0]}-${plan.nutrition.proteinTarget.gramsPerDay[1]}g/day`
                  : `${plan.nutrition.proteinTarget.gramsPerKgRange[0]}-${plan.nutrition.proteinTarget.gramsPerKgRange[1]}g/kg bodyweight`}
              </p>
              {plan.nutrition.rateOfChangeGuidance && <p>{plan.nutrition.rateOfChangeGuidance}</p>}
            </div>
          )}
          <Disclaimer text={plan.nutrition.disclaimer} />
        </div>
      )}
    </div>
  )
}
