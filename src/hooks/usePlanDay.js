import { useState } from 'react'
import { today } from '../lib/dates'
import {
  loadPlanDays,
  savePlanDays,
  setWorkoutDone,
  toggleMentalDevTask,
  toggleFinancialAction,
  isFinancialActionDone,
  getTodaysWorkoutSession,
} from '../lib/planProgress'

export function usePlanDay(plan) {
  const [planDays, setPlanDays] = useState(() => loadPlanDays())
  const todayStr = today()
  const todayRecord = planDays[todayStr] ?? { workout: { sessionId: null, completed: false }, mentalDev: {}, financial: {} }
  const todaysSession = getTodaysWorkoutSession(plan, todayStr)

  function update(next) {
    setPlanDays(next)
    savePlanDays(next)
  }

  return {
    planDays,
    todayRecord,
    todaysSession,
    toggleMentalDev: (taskId) => update(toggleMentalDevTask(planDays, todayStr, taskId)),
    toggleFinancial: (actionId) => update(toggleFinancialAction(planDays, todayStr, actionId)),
    isFinancialDone: (actionId) => isFinancialActionDone(planDays, todayStr, actionId),
    setWorkoutDone: (completed) => update(setWorkoutDone(planDays, todayStr, todaysSession?.dayOfWeek ?? null, completed)),
  }
}
