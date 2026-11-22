import { normalizeAnswers } from './normalizeAnswers'

// Task phrasing follows Gollwitzer & Sheeran's implementation-intention
// research ("if/after X, then Y" beats a vague intention) wherever a
// natural trigger exists. formationNote reflects Lally et al. 2010's real
// habit-automaticity timeline (average ~66 days, range 18-254) rather than
// the unsupported "21 days" myth. The number of daily tasks is capped by
// the time the user said they have — too many goals at once dilutes
// follow-through.
//
// Only structured fields drive which tasks get generated —
// weaknessesFreeText is carried through for display only.
const FOCUS_AREA_TASKS = {
  discipline: { id: 'task_discipline', label: "Do the one task you're most tempted to put off, first thing today.", cadence: 'daily' },
  confidence: { id: 'task_confidence', label: 'Do one small thing today that pushes past your comfort zone.', cadence: 'daily' },
  consistency: { id: 'task_consistency', label: 'Check in on your plan at the same time today as yesterday.', cadence: 'daily' },
  mentalResilience: { id: 'task_resilience', label: 'Write down one setback from this week and one thing it taught you.', cadence: 'weekly' },
  reducingProcrastination: { id: 'task_procrastination', label: "After you wake up, spend 10 minutes on the task you've been avoiding most.", cadence: 'daily' },
  improvingFocus: { id: 'task_focus', label: 'Do one 25-minute focused work block with your phone in another room.', cadence: 'daily' },
  timeManagement: { id: 'task_time_management', label: "Before bed, write down tomorrow's top 3 priorities.", cadence: 'daily' },
  buildingHabits: { id: 'task_habit_stack', label: 'Attach your new habit to an existing one ("After I brush my teeth, I will…").', cadence: 'daily' },
  reducingScreenTime: { id: 'task_screen_time', label: "Keep today's screen time under your target.", cadence: 'daily' },
  stress: { id: 'task_stress', label: 'Take 5 slow breaths (4 seconds in, 6 seconds out) when you feel stress rising — and once before bed.', cadence: 'daily' },
}

const DISTRACTION_STEPS = {
  socialMedia: 'Move social media apps off your home screen and set a daily time limit in your phone settings.',
  videoStreaming: 'Turn off autoplay on YouTube/streaming apps so each video is a choice, not a default.',
  gaming: 'Make games a reward: play only after the day\'s plan is done.',
  news: 'Pick one set time to check news instead of refreshing through the day.',
  messaging: 'Turn off non-essential notifications and mute busy group chats during focus blocks.',
}

// Minutes each daily task actually takes out of the user's personal-
// development time. Zero-cost ones are rules you follow during the day.
const TASK_MINUTES = {
  task_discipline: 0, task_confidence: 0, task_consistency: 1, task_procrastination: 10, task_focus: 0,
  task_time_management: 3, task_habit_stack: 0, task_screen_time: 0, task_stress: 3, task_sleep: 0,
  task_journaling: 5,
}
const MAX_DAILY_TASKS = 6
const MIN_READING_MINUTES = 10

function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number)
  const total = (((h * 60 + m + minutes) % 1440) + 1440) % 1440
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function generateMentalDevPlan(rawAnswers) {
  const a = normalizeAnswers(rawAnswers)
  const m = a.mentalGoals
  const minutes = m.dailyMinutesAvailable
  const candidates = []

  const orderedAreas = m.priorityFocus ? [m.priorityFocus, ...m.focusAreas.filter((f) => f !== m.priorityFocus)] : m.focusAreas
  for (const area of orderedAreas) {
    const template = FOCUS_AREA_TASKS[area]
    if (!template) continue
    let label = template.label
    if (area === 'reducingScreenTime' && m.screenTimeTargetHoursPerDay != null) label = `Keep today's screen time under ${m.screenTimeTargetHoursPerDay}h.`
    candidates.push({ ...template, label, category: 'mentalDev', priority: area === m.priorityFocus })
  }

  const needsSleepHelp = a.personal.sleepQuality === 'poor' || (a.personal.sleepHours != null && a.personal.sleepHours < 7)
  if (needsSleepHelp) {
    // Sleep underpins everything else, so it ranks right after the #1 focus.
    candidates.splice(Math.min(1, candidates.length), 0, {
      id: 'task_sleep',
      label: `At ${addMinutes(a.personal.bedTime, -30)}, start winding down: screens off, lights low, ready for bed by ${a.personal.bedTime}.`,
      cadence: 'daily',
      category: 'mentalDev',
    })
  }

  if (m.readingInterest) {
    candidates.push({ id: 'task_reading', cadence: 'daily', category: 'mentalDev', flexible: true })
  }

  if (m.meditationInterest || m.meditationExperience === 'regular') {
    const medMinutes = m.meditationExperience === 'regular' ? 10 : 5
    candidates.push({
      id: 'task_meditation',
      label: `Meditate for ${medMinutes} minutes${m.meditationExperience === 'regular' ? '' : ' — a guided session is perfect for starting out'}.`,
      cadence: 'daily',
      category: 'mentalDev',
      minutes: medMinutes,
    })
  }

  if (m.journalingInterest) {
    candidates.push({ id: 'task_journaling', label: "Journal for 5 minutes: what went well today, what didn't, and one thing to try tomorrow.", cadence: 'daily', category: 'mentalDev' })
  }

  if (m.screenTimeTargetHoursPerDay != null && !m.focusAreas.includes('reducingScreenTime')) {
    candidates.push({ id: 'task_screen_time', label: `Keep today's screen time under ${m.screenTimeTargetHoursPerDay}h.`, cadence: 'daily', category: 'mentalDev' })
  }

  // Fit daily tasks into the minutes the user has. Fixed-length tasks go
  // first in priority order; reading then takes whatever time is left
  // (10-30 min), so a reader always gets a realistic reading slot.
  const daily = candidates.filter((t) => t.cadence === 'daily')
  const weekly = candidates.filter((t) => t.cadence === 'weekly')
  const keptDaily = []
  const deferred = []
  let remaining = minutes
  const reserveForReading = daily.some((t) => t.id === 'task_reading') ? MIN_READING_MINUTES : 0
  for (const task of daily) {
    if (task.flexible) continue
    const cost = task.minutes ?? TASK_MINUTES[task.id] ?? 5
    if (keptDaily.length < MAX_DAILY_TASKS - (reserveForReading ? 1 : 0) && cost <= remaining - reserveForReading) {
      keptDaily.push(task)
      remaining -= cost
    } else {
      deferred.push(task)
    }
  }
  const reading = daily.find((t) => t.flexible)
  if (reading) {
    const readMinutes = Math.min(30, Math.max(MIN_READING_MINUTES, Math.floor(remaining / 5) * 5))
    const verb = m.readingFormat === 'audiobook' ? 'Listen to' : 'Read'
    const pages = m.readingFormat === 'audiobook' ? '' : ` (about ${Math.round(readMinutes * 0.7)} pages)`
    keptDaily.push({ ...reading, label: `${verb} ${readMinutes} minutes of non-fiction${pages}.` })
  }

  const tasks = [
    ...keptDaily,
    ...weekly,
    { id: 'task_weekly_reflection', label: 'Weekly check-in: review what worked this week and set one focus for next week.', cadence: 'weekly', category: 'mentalDev' },
  ].map(({ priority, flexible, minutes: _m, ...task }) => task)

  let screenTimeStep = null
  if (m.currentScreenTimeHours != null && m.screenTimeTargetHoursPerDay != null && m.currentScreenTimeHours > m.screenTimeTargetHoursPerDay) {
    screenTimeStep = `Step down gradually: cut about 30-60 minutes a week from your current ${m.currentScreenTimeHours}h until you reach ${m.screenTimeTargetHoursPerDay}h.`
  }

  return {
    tasks,
    deferredTasks: deferred.map(({ priority, flexible, minutes: _m, ...task }) => task),
    dailyMinutes: minutes,
    setupSteps: [...m.distractions.map((d) => DISTRACTION_STEPS[d]).filter(Boolean), screenTimeStep].filter(Boolean),
    weaknessesNote: m.weaknessesFreeText || null,
    formationNote:
      "Building a new habit takes real time — research found it averages around two months, ranging anywhere from about two weeks to several months. Missing a single day along the way doesn't undo your progress; what matters is getting back to it.",
  }
}
