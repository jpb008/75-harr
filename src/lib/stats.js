import { addDays, daysBetween, parseDateStr, today } from './dates'
import { isDayComplete } from './challenge'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// The earliest date worth counting from — the start of the first-ever
// attempt, whether it's still active or already in history.
function earliestDate(challenge, history) {
  const starts = history.map((h) => h.startDate)
  if (challenge) starts.push(challenge.startDate)
  if (starts.length === 0) return today()
  return starts.reduce((min, d) => (d < min ? d : min))
}

// Note: completeness for historical days is judged against the *current*
// task list, same simplification ProgressView already makes for the
// current attempt's calendar — the app doesn't keep a snapshot of the
// task list as it existed on any given past day.
export function computeStats(challenge, days, history) {
  const tasks = challenge?.tasks ?? []
  const start = earliestDate(challenge, history)
  const end = today()
  const span = Math.max(0, daysBetween(start, end))

  let longestStreak = 0
  let currentRun = 0
  const weekdayTotals = Array.from({ length: 7 }, () => ({ complete: 0, total: 0 }))

  for (let offset = 0; offset <= span; offset += 1) {
    const dateStr = addDays(start, offset)
    const complete = isDayComplete(days[dateStr], tasks)
    if (complete) {
      currentRun += 1
      longestStreak = Math.max(longestStreak, currentRun)
    } else {
      currentRun = 0
    }
    const weekday = parseDateStr(dateStr).getDay()
    weekdayTotals[weekday].total += 1
    if (complete) weekdayTotals[weekday].complete += 1
  }

  const completionByWeekday = weekdayTotals.map((w, i) => ({
    weekday: i,
    label: WEEKDAY_LABELS[i],
    pct: w.total ? Math.round((w.complete / w.total) * 100) : 0,
    count: w.total,
  }))

  const withData = completionByWeekday.filter((w) => w.count > 0)
  const bestWeekday = withData.length ? withData.reduce((a, b) => (b.pct > a.pct ? b : a)) : null

  const resets = history.filter((h) => h.reason === 'reset')
  const avgResetDays = resets.length
    ? Math.round(resets.reduce((sum, h) => sum + h.daysCompleted, 0) / resets.length)
    : null

  const totalAttempts = history.length + (challenge ? 1 : 0)

  return {
    longestStreak,
    totalAttempts,
    completionByWeekday,
    bestWeekday,
    avgResetDays,
  }
}

// Trailing `weeks` weeks of complete/incomplete cells (Sunday-start),
// for an all-time contribution-style heatmap.
export function computeHeatmapCells(challenge, days, weeks = 26) {
  const tasks = challenge?.tasks ?? []
  const end = today()
  const endWeekday = parseDateStr(end).getDay()

  // Align the grid so the last column ends on the current week's Saturday.
  const gridEnd = addDays(end, 6 - endWeekday)
  const gridStart = addDays(gridEnd, -(weeks * 7 - 1))

  const cells = []
  for (let offset = 0; offset < weeks * 7; offset += 1) {
    const dateStr = addDays(gridStart, offset)
    if (dateStr > end) {
      cells.push({ date: dateStr, status: 'future' })
      continue
    }
    cells.push({ date: dateStr, status: isDayComplete(days[dateStr], tasks) ? 'complete' : 'incomplete' })
  }
  return cells
}
