import { addDays, daysBetween, today } from './dates'

export const DEFAULT_TASKS = [
  { id: 't1', label: 'Follow a diet — no cheat meals, no alcohol' },
  { id: 't2', label: 'Workout 1 (45 min)' },
  { id: 't3', label: 'Workout 2 — outdoors (45 min)' },
  { id: 't4', label: 'Drink 1 gallon of water' },
  { id: 't5', label: 'Read 10 pages (non-fiction / self-development)' },
  { id: 't6', label: 'Take a progress photo' },
]

export function newChallenge({ name = '75 Hard', lengthDays = 75, tasks = DEFAULT_TASKS, startDate = today() } = {}) {
  return {
    id: crypto.randomUUID(),
    name,
    lengthDays,
    tasks,
    startDate,
    createdAt: new Date().toISOString(),
  }
}

function isDayComplete(dayRecord, tasks) {
  if (!dayRecord) return false
  return tasks.every((t) => dayRecord.completedTaskIds?.includes(t.id))
}

// Walks forward from the challenge's startDate to yesterday. The first day
// that isn't fully checked off breaks the streak: 75 Hard's core rule is
// that any missed day sends you back to Day 1, so everything up to and
// including that day is archived and a fresh attempt starts the next day.
// Loops in case the app wasn't opened for multiple days in a row.
export function reconcile(challenge, days, history) {
  let current = challenge
  let newHistory = history
  const t = today()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const span = daysBetween(current.startDate, t) // days elapsed, 0 = today is day 1
    if (span <= 0) break // challenge starts today or in the future, nothing to reconcile

    let missedDate = null
    for (let offset = 0; offset < span; offset += 1) {
      const dateStr = addDays(current.startDate, offset)
      const record = days[dateStr]
      if (!isDayComplete(record, current.tasks)) {
        missedDate = dateStr
        break
      }
    }

    if (!missedDate) {
      // No misses so far, but check whether the challenge has been finished.
      if (span >= current.lengthDays) {
        const finishDate = addDays(current.startDate, current.lengthDays - 1)
        newHistory = [
          ...newHistory,
          {
            id: current.id,
            name: current.name,
            startDate: current.startDate,
            endDate: finishDate,
            lengthDays: current.lengthDays,
            daysCompleted: current.lengthDays,
            reason: 'finished',
          },
        ]
        return { challenge: null, history: newHistory, justFinished: true }
      }
      break
    }

    const attemptedDays = daysBetween(current.startDate, missedDate)
    newHistory = [
      ...newHistory,
      {
        id: current.id,
        name: current.name,
        startDate: current.startDate,
        endDate: missedDate,
        lengthDays: current.lengthDays,
        daysCompleted: attemptedDays,
        reason: 'reset',
      },
    ]
    current = { ...current, id: crypto.randomUUID(), startDate: addDays(missedDate, 1), createdAt: new Date().toISOString() }
  }

  return { challenge: current, history: newHistory, justFinished: false }
}

export function currentDayNumber(challenge) {
  return daysBetween(challenge.startDate, today()) + 1
}

export function currentStreak(challenge, days) {
  const dayNum = currentDayNumber(challenge)
  let streak = 0
  for (let offset = 0; offset < dayNum - 1; offset += 1) {
    const dateStr = addDays(challenge.startDate, offset)
    if (isDayComplete(days[dateStr], challenge.tasks)) streak += 1
    else break
  }
  return streak
}

export { isDayComplete }
