// Pure decision logic for scheduled reminders: given a subscriber's local
// time, their synced app state and their latest plan, which reminders are
// due right now? Kept separate from sending so it can be tested directly.
//
// Every reminder checks real progress first — nothing is sent for work
// that's already done.

const DAY_MS = 86400000

function hourOf(time, fallback) {
  const h = Number(String(time ?? '').split(':')[0])
  return Number.isFinite(h) ? h : fallback
}

function shiftDate(dateStr, days) {
  return new Date(Date.parse(`${dateStr}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10)
}

export const DEFAULT_PREFS = { workout: true, evening: true, weeklyMoney: true, weighIn: true }

export function localClock(nowUtc, tzOffsetMinutes) {
  const local = new Date(nowUtc.getTime() - tzOffsetMinutes * 60 * 1000)
  return { hour: local.getUTCHours(), date: local.toISOString().slice(0, 10), dow: local.getUTCDay() }
}

export function dueReminders({ clock, state = {}, plan = null }) {
  const prefs = { ...DEFAULT_PREFS, ...(state.reminderPrefs ?? {}) }
  const due = []
  const today = state.planDays?.[clock.date] ?? {}

  if (prefs.workout && plan?.workout?.sessions) {
    const session = plan.workout.sessions.find((s) => s.dayOfWeek === clock.dow)
    const block = plan.schedule?.blocks?.find((b) => b.category === 'workout')
    if (session && clock.hour === hourOf(block?.time, 7) && !today.workout?.completed) {
      due.push({
        kind: 'workout',
        title: `Today: ${session.label}`,
        body: `About ${session.estimatedMinutes ?? 45} minutes${block?.time ? `, planned for ${block.time}` : ''}. Log your sets in the app.`,
        tag: 'workout',
      })
    }
  }

  if (prefs.evening && (clock.hour === 21 || clock.hour === 23)) {
    const challenge = state.challenge
    const done = state.days?.[clock.date]?.completedTaskIds ?? []
    const checklistLeft = challenge?.tasks ? challenge.tasks.filter((t) => !done.includes(t.id)).length : 0
    const dailyTasks = (plan?.mentalDev?.tasks ?? []).filter((t) => t.cadence === 'daily')
    const planLeft = dailyTasks.filter((t) => !today.mentalDev?.[t.id]).length
    if (clock.hour === 21 && (checklistLeft > 0 || planLeft > 0)) {
      const parts = []
      if (checklistLeft) parts.push(`${checklistLeft} checklist task${checklistLeft === 1 ? '' : 's'}`)
      if (planLeft) parts.push(`${planLeft} habit${planLeft === 1 ? '' : 's'}`)
      due.push({ kind: 'evening', title: '75 Hard — getting late', body: `${parts.join(' and ')} left today.`, tag: 'at-risk' })
    }
    if (clock.hour === 23 && checklistLeft > 0) {
      due.push({
        kind: 'urgent',
        title: '75 Hard — less than an hour left',
        body: `${checklistLeft} task${checklistLeft === 1 ? '' : 's'} left. Finish before midnight to keep your streak.`,
        tag: 'at-risk',
      })
    }
  }

  // Saturday noon: the money week runs Sunday-Saturday, so this is the
  // last full day to get the week's actions in.
  if (prefs.weeklyMoney && clock.dow === 6 && clock.hour === 12 && plan?.financial?.paths?.length) {
    const weekKey = shiftDate(clock.date, -6)
    const doneMap = state.planDays?.[weekKey]?.financial ?? {}
    const ids = plan.financial.paths.flatMap((p) => p.weeklyActions.map((_, i) => `${p.id}-${i}`))
    const left = ids.filter((id) => !doneMap[id]).length
    if (left > 0) {
      due.push({ kind: 'money', title: "This week's money moves", body: `${left} action${left === 1 ? '' : 's'} left this week. Log your hours and results too.`, tag: 'money' })
    }
  }

  if (prefs.weighIn && clock.dow === 1 && plan && !plan.nutrition?.safeMode) {
    const wakeHour = hourOf(plan.schedule?.wakeTime, 7)
    const recent = Object.keys(state.weighIns ?? {}).some((d) => d > shiftDate(clock.date, -6))
    if (clock.hour === wakeHour && !recent) {
      due.push({ kind: 'weighIn', title: 'Weekly weigh-in', body: 'Weigh in before breakfast and log it in the Progress tab.', tag: 'weigh-in' })
    }
  }

  return due
}
