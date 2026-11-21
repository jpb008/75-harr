import { today, addDays, parseDateStr } from './dates'
import { loadJSON, saveJSON } from './storage'

// planDays is a SEPARATE, non-resetting structure from the classic
// challenge/days all-or-nothing streak engine (src/lib/challenge.js) —
// missing a mental-dev task or a workout here never touches that streak.
// Justified directly by the habit-formation research: a single missed day
// didn't disrupt habit automaticity in Lally et al. 2010, so punishing one
// miss the way the core 75-Hard challenge does isn't supported here.

function weekStartDateStr(dateStr) {
  const dow = parseDateStr(dateStr).getDay() // 0 = Sunday
  return addDays(dateStr, -dow)
}

function emptyDayRecord() {
  return { workout: { sessionId: null, completed: false }, mentalDev: {}, financial: {} }
}

function getDayRecord(planDays, dateStr) {
  return planDays[dateStr] ?? emptyDayRecord()
}

export function loadPlanDays() {
  return loadJSON('planDays', {})
}

export function savePlanDays(planDays) {
  saveJSON('planDays', planDays)
}

export function setWorkoutDone(planDays, dateStr, sessionId, completed) {
  const record = getDayRecord(planDays, dateStr)
  return { ...planDays, [dateStr]: { ...record, workout: { sessionId, completed } } }
}

export function toggleMentalDevTask(planDays, dateStr, taskId) {
  const record = getDayRecord(planDays, dateStr)
  return {
    ...planDays,
    [dateStr]: { ...record, mentalDev: { ...record.mentalDev, [taskId]: !record.mentalDev[taskId] } },
  }
}

// Financial actions are weekly in nature (per the rule engine), not daily —
// every check within a calendar week lands on that week's Sunday key so it
// reads as "done this week" regardless of which day it was checked.
export function toggleFinancialAction(planDays, dateStr, actionId) {
  const weekKey = weekStartDateStr(dateStr)
  const record = getDayRecord(planDays, weekKey)
  return {
    ...planDays,
    [weekKey]: { ...record, financial: { ...record.financial, [actionId]: !record.financial[actionId] } },
  }
}

export function isFinancialActionDone(planDays, dateStr, actionId) {
  const weekKey = weekStartDateStr(dateStr)
  return Boolean(planDays[weekKey]?.financial?.[actionId])
}

// Rolling percentage over a trailing window — never resets, just reflects
// recent consistency. Used by the weekly review (Phase 8) to decide
// whether to propose easing off or progressing.
export function computeCategoryConsistency(planDays, category, { windowDays = 14, referenceDateStr = today() } = {}) {
  let doneCount = 0
  let sampleSize = 0
  for (let offset = 0; offset < windowDays; offset += 1) {
    const dateStr = addDays(referenceDateStr, -offset)
    const record = planDays[dateStr]
    if (!record) continue
    if (category === 'workout') {
      if (record.workout?.sessionId == null) continue
      sampleSize += 1
      if (record.workout.completed) doneCount += 1
    } else if (category === 'mentalDev') {
      const taskStates = Object.values(record.mentalDev ?? {})
      if (taskStates.length === 0) continue
      sampleSize += taskStates.length
      doneCount += taskStates.filter(Boolean).length
    }
  }
  return { rate: sampleSize > 0 ? doneCount / sampleSize : null, sampleSize }
}

export function getTodaysWorkoutSession(plan, dateStr = today()) {
  if (!plan?.workout?.sessions?.length) return null
  const dow = parseDateStr(dateStr).getDay()
  return plan.workout.sessions.find((s) => s.dayOfWeek === dow) ?? null
}
