// Task phrasing follows Gollwitzer & Sheeran's implementation-intention
// research ("if/after X, then Y" beats a vague intention) wherever a
// natural trigger exists. formationNote reflects Lally et al. 2010's real
// habit-automaticity timeline (average ~66 days, range 18-254) rather than
// the unsupported "21 days" myth.
//
// Only structured fields (focusAreas, journalingInterest, etc.) drive which
// tasks get generated — weaknessesFreeText is carried through for display
// only and never parsed to pick tasks.
const FOCUS_AREA_TASKS = {
  discipline: { id: 'task_discipline', label: 'Do the one task you\'re most tempted to put off, first thing today.', cadence: 'daily' },
  confidence: { id: 'task_confidence', label: 'Do one small thing today that pushes past your comfort zone.', cadence: 'daily' },
  consistency: { id: 'task_consistency', label: 'Check in on your plan at the same time today as yesterday.', cadence: 'daily' },
  mentalResilience: { id: 'task_resilience', label: 'Write down one setback from this week and one thing it taught you.', cadence: 'weekly' },
  reducingProcrastination: { id: 'task_procrastination', label: 'After you wake up, spend 10 minutes on the task you\'ve been avoiding most.', cadence: 'daily' },
  improvingFocus: { id: 'task_focus', label: 'Do one 25-minute focused work block with your phone out of reach.', cadence: 'daily' },
  timeManagement: { id: 'task_time_management', label: 'Before bed, write down tomorrow\'s top 3 priorities.', cadence: 'daily' },
  buildingHabits: { id: 'task_habit_stack', label: 'Attach your new habit to an existing one (e.g. "after I brush my teeth, I will...").', cadence: 'daily' },
  reducingScreenTime: { id: 'task_screen_time', label: 'Keep today\'s screen time under your target.', cadence: 'daily' },
}

export function generateMentalDevPlan(answers) {
  const mentalGoals = answers.mentalGoals ?? {}
  const focusAreas = mentalGoals.focusAreas ?? []
  const tasks = []

  for (const area of focusAreas) {
    const template = FOCUS_AREA_TASKS[area]
    if (template) tasks.push({ ...template, category: 'mentalDev' })
  }

  if (mentalGoals.readingInterest) {
    tasks.push({ id: 'task_reading', label: 'Read 10-20 pages (non-fiction / self-development).', cadence: 'daily', category: 'mentalDev' })
  }
  if (mentalGoals.journalingInterest) {
    tasks.push({ id: 'task_journaling', label: 'Journal for a few minutes — what went well today, what didn\'t.', cadence: 'daily', category: 'mentalDev' })
  }
  if (typeof mentalGoals.screenTimeTargetHoursPerDay === 'number' && !focusAreas.includes('reducingScreenTime')) {
    tasks.push({
      id: 'task_screen_time',
      label: `Keep today's screen time under ${mentalGoals.screenTimeTargetHoursPerDay}h.`,
      cadence: 'daily',
      category: 'mentalDev',
    })
  }

  return {
    tasks,
    weaknessesNote: mentalGoals.weaknessesFreeText ?? null,
    formationNote:
      "Building a new habit takes real time — research found it averages around two months, ranging anywhere from about two weeks to several months. Missing a single day along the way doesn't undo your progress; what matters is getting back to it.",
  }
}
