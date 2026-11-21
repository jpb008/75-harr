function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number)
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// A rough, readable daily shape — not a minute-by-minute schedule the app
// enforces, just a sensible default ordering the user can drag around
// later (Phase 9). Workout timing follows the user's stated preference;
// everything else anchors off wake/bed time.
export function buildDailySchedule(answers, { workout, mentalDev, financial }) {
  const wakeTime = answers.personal?.wakeTime ?? '07:00'
  const bedTime = answers.personal?.bedTime ?? '22:30'
  const preferredTimeOfDay = answers.personal?.preferredTimeOfDay ?? 'morning'

  const workoutTime =
    preferredTimeOfDay === 'morning'
      ? addMinutes(wakeTime, 45)
      : preferredTimeOfDay === 'afternoon'
        ? '13:00'
        : '18:00'

  const blocks = [
    { time: wakeTime, label: 'Wake up', category: 'routine' },
    { time: addMinutes(wakeTime, 30), label: 'Morning routine', category: 'routine' },
  ]

  if (workout.sessions.length > 0) {
    blocks.push({ time: workoutTime, label: 'Workout', category: 'workout' })
    blocks.push({ time: addMinutes(workoutTime, 60), label: 'Breakfast / refuel', category: 'routine' })
  } else {
    blocks.push({ time: addMinutes(wakeTime, 60), label: 'Breakfast', category: 'routine' })
  }

  if (mentalDev.tasks.some((t) => t.id === 'task_reading')) {
    blocks.push({ time: addMinutes(wakeTime, 120), label: 'Reading', category: 'mentalDev' })
  }

  if (financial.paths.length > 0) {
    blocks.push({ time: '17:00', label: 'Income-building session', category: 'financial' })
  }

  const otherMentalDevTasks = mentalDev.tasks.filter((t) => t.id !== 'task_reading' && t.id !== 'task_journaling')
  if (otherMentalDevTasks.length > 0) {
    blocks.push({ time: addMinutes(bedTime, -90), label: 'Personal development', category: 'mentalDev' })
  }
  if (mentalDev.tasks.some((t) => t.id === 'task_journaling')) {
    blocks.push({ time: addMinutes(bedTime, -30), label: 'Journal', category: 'mentalDev' })
  }

  blocks.push({ time: addMinutes(bedTime, -15), label: 'Evening wind-down', category: 'routine' })
  blocks.push({ time: bedTime, label: 'Sleep', category: 'routine' })

  blocks.sort((a, b) => a.time.localeCompare(b.time))
  return { blocks, wakeTime, bedTime }
}
