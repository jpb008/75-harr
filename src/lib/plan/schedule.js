import { normalizeAnswers } from './normalizeAnswers'

function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number)
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// A readable default shape for a training day — not enforced, just a
// sensible ordering. Workout timing follows the user's stated preference;
// everything else anchors off wake/bed time.
export function buildDailySchedule(rawAnswers, { workout, mentalDev, financial }) {
  const a = normalizeAnswers(rawAnswers)
  const { wakeTime, bedTime } = a.personal
  const preferredTimeOfDay = a.training.preferredTimeOfDay
  const sessionMinutes = a.training.sessionMinutes
  const taskIds = new Set(mentalDev.tasks.map((t) => t.id))

  const workoutTime =
    preferredTimeOfDay === 'morning' ? addMinutes(wakeTime, 45) : preferredTimeOfDay === 'afternoon' ? '13:00' : '18:00'

  const blocks = [
    { time: wakeTime, label: 'Wake up — water and daylight', category: 'routine' },
    { time: addMinutes(wakeTime, 15), label: 'Morning routine', category: 'routine' },
  ]

  if (taskIds.has('task_meditation')) blocks.push({ time: addMinutes(wakeTime, 25), label: 'Meditate', category: 'mentalDev' })

  if (workout.sessions.length > 0) {
    blocks.push({ time: workoutTime, label: `Workout (~${sessionMinutes} min)`, category: 'workout' })
    blocks.push({ time: addMinutes(workoutTime, sessionMinutes + 15), label: 'Protein-rich meal', category: 'routine' })
  }
  if (preferredTimeOfDay !== 'morning' || workout.sessions.length === 0) {
    blocks.push({ time: addMinutes(wakeTime, 60), label: 'Breakfast', category: 'routine' })
  }

  if (taskIds.has('task_focus') || taskIds.has('task_procrastination')) {
    blocks.push({ time: addMinutes(wakeTime, 120), label: 'Focus block (phone away)', category: 'mentalDev' })
  }

  if (financial.paths.length > 0) {
    blocks.push({ time: '17:00', label: 'Income / skill-building session', category: 'financial' })
  }

  if (taskIds.has('task_reading')) blocks.push({ time: addMinutes(bedTime, -75), label: 'Reading', category: 'mentalDev' })
  if (taskIds.has('task_time_management')) blocks.push({ time: addMinutes(bedTime, -50), label: "Plan tomorrow's top 3", category: 'mentalDev' })
  if (taskIds.has('task_journaling')) blocks.push({ time: addMinutes(bedTime, -40), label: 'Journal', category: 'mentalDev' })

  blocks.push({ time: addMinutes(bedTime, -30), label: 'Wind down — screens off', category: 'routine' })
  blocks.push({ time: bedTime, label: 'Sleep', category: 'routine' })

  blocks.sort((x, y) => x.time.localeCompare(y.time))
  return { blocks, wakeTime, bedTime }
}
