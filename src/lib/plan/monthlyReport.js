import { addDays, parseDateStr } from '../dates'
import { isDayComplete } from '../challenge'
import { entryBest, findNewPRs } from './trends'
import { convertWeight } from './progression'
import { exerciseById } from './exerciseLibrary'
import { waterGoalMl } from '../dailyHealth'

// One month's summary from the synced logs. monthKey: "YYYY-MM".

export function monthLabel(monthKey) {
  return parseDateStr(`${monthKey}-01`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

export function previousMonthKey(todayStr) {
  const d = parseDateStr(`${todayStr.slice(0, 7)}-01`)
  d.setMonth(d.getMonth() - 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function daysOfMonth(monthKey, todayStr) {
  const out = []
  for (let d = `${monthKey}-01`; d.startsWith(monthKey) && d <= todayStr; d = addDays(d, 1)) out.push(d)
  return out
}

// Months (newest first) that have anything logged.
export function reportMonths({ workoutLogs = {}, weighIns = {}, mealChecks = {}, dailyHealth = {}, planDays = {} }) {
  const keys = new Set()
  for (const src of [workoutLogs, weighIns, mealChecks, dailyHealth, planDays]) for (const d of Object.keys(src)) if (/^\d{4}-\d{2}-\d{2}$/.test(d)) keys.add(d.slice(0, 7))
  return [...keys].sort().reverse()
}

const pct = (done, total) => (total ? Math.round((done / total) * 100) : null)

export function buildMonthlyReport({ monthKey, todayStr, plan, planDays = {}, workoutLogs = {}, weighIns = {}, mealChecks = {}, dailyHealth = {}, challenge, days = {}, unit = 'lb', mealsPerDay = 3 }) {
  const dates = daysOfMonth(monthKey, todayStr)
  const tracked = [...Object.keys(planDays), ...Object.keys(workoutLogs), ...Object.keys(mealChecks), ...Object.keys(dailyHealth)].filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()
  const start = tracked[0] ?? todayStr
  const sessionDays = new Set((plan?.workout?.sessions ?? []).filter((s) => s.type !== 'rest').map((s) => s.dayOfWeek))
  const habits = (plan?.mentalDev?.tasks ?? []).filter((t) => t.cadence === 'daily').map((t) => t.id)

  let wDone = 0, wPlanned = 0, hDone = 0, hTotal = 0, mDone = 0, mTotal = 0, sets = 0, sessions = 0
  let waterHit = 0, waterDays = 0, sleepSum = 0, sleepN = 0, challengeDone = 0, challengeDays = 0
  const waterGoal = waterGoalMl(challenge, plan)
  for (const d of dates) {
    const logged = Object.values(workoutLogs[d]?.entries ?? {}).filter((e) => e?.sets?.some((s) => s.reps))
    if (logged.length) {
      sessions += 1
      sets += logged.reduce((n, e) => n + e.sets.filter((s) => s.reps).length, 0)
    }
    if (d >= start) {
      if (sessionDays.has(parseDateStr(d).getDay())) {
        wPlanned += 1
        if (planDays[d]?.workout?.completed || logged.length) wDone += 1
      }
      if (habits.length) {
        hTotal += habits.length
        hDone += habits.filter((id) => planDays[d]?.mentalDev?.[id]).length
      }
    }
    // Only days with at least one tick count, so forgetting to tick isn't a miss.
    if (mealChecks[d]?.length) {
      mTotal += mealsPerDay
      mDone += Math.min(mealChecks[d].length, mealsPerDay)
    }
    const h = dailyHealth[d]
    if (h?.waterMl) {
      waterDays += 1
      if (h.waterMl >= waterGoal - 1) waterHit += 1
    }
    if (h?.sleepHours != null) {
      sleepSum += h.sleepHours
      sleepN += 1
    }
    if (challenge && d >= challenge.startDate && d < todayStr) {
      challengeDays += 1
      if (isDayComplete(days[d], challenge.tasks)) challengeDone += 1
    }
  }

  // Personal records set this month, replaying logs in order.
  let prCount = 0
  const sortedLogDates = Object.keys(workoutLogs).sort()
  for (const d of dates) {
    if (!workoutLogs[d]) continue
    const before = Object.fromEntries(sortedLogDates.filter((x) => x < d).map((x) => [x, workoutLogs[x]]))
    prCount += findNewPRs(before, d, workoutLogs[d].entries, unit).length
  }

  // Biggest strength gain: first vs last log of a weighted lift in the month.
  let strength = null
  const ids = new Set(dates.flatMap((d) => Object.keys(workoutLogs[d]?.entries ?? {})))
  for (const id of ids) {
    const points = dates.map((d) => entryBest(workoutLogs[d]?.entries?.[id], unit, id)).filter((b) => b?.weighted)
    if (points.length < 2) continue
    const gain = points[points.length - 1].value - points[0].value
    const pctGain = (gain / points[0].value) * 100
    if (!strength || pctGain > strength.pctGain) strength = { name: exerciseById(id)?.name ?? id, from: Math.round(points[0].value), to: Math.round(points[points.length - 1].value), pctGain, unit }
  }
  if (strength && strength.pctGain <= 0) strength = null

  const weights = dates.filter((d) => weighIns[d]?.weight).map((d) => convertWeight(weighIns[d].weight, weighIns[d].unit, unit))
  const weight = weights.length >= 2 ? { from: Math.round(weights[0] * 10) / 10, to: Math.round(weights[weights.length - 1] * 10) / 10, change: Math.round((weights[weights.length - 1] - weights[0]) * 10) / 10, unit } : null

  const rates = { workouts: pct(wDone, wPlanned), habits: pct(hDone, hTotal), meals: pct(mDone, mTotal) }
  const sleepAvg = sleepN ? Math.round((sleepSum / sleepN) * 10) / 10 : null

  return {
    monthKey,
    label: monthLabel(monthKey),
    complete: dates.length > 0 && !addDays(dates[dates.length - 1], 1).startsWith(monthKey),
    workouts: { done: wDone, planned: wPlanned, rate: rates.workouts },
    sessionsLogged: sessions,
    setsLogged: sets,
    prCount,
    strength,
    weight,
    habits: rates.habits,
    meals: rates.meals,
    water: waterDays ? { hit: waterHit, days: waterDays } : null,
    sleepAvg,
    challenge: challengeDays ? { done: challengeDone, days: challengeDays } : null,
    best: bestArea(rates),
    focus: focusFor(rates, sleepAvg, waterDays ? waterHit / waterDays : null),
  }
}

const AREA_NAMES = { workouts: 'workouts', habits: 'daily habits', meals: 'meal plan' }

function bestArea(rates) {
  const entries = Object.entries(rates).filter(([, r]) => r != null)
  if (!entries.length) return null
  const [key, rate] = entries.sort((a, b) => b[1] - a[1])[0]
  return rate >= 50 ? `Your most consistent area was your ${AREA_NAMES[key]} (${rate}%).` : null
}

function focusFor(rates, sleepAvg, waterRate) {
  if (sleepAvg != null && sleepAvg < 6.5) return `Sleep averaged ${sleepAvg} h. Getting closer to 7-9 h is the single biggest boost to recovery, mood and strength — try a fixed bedtime.`
  const entries = Object.entries(rates).filter(([, r]) => r != null).sort((a, b) => a[1] - b[1])
  if (entries.length && entries[0][1] < 70) {
    const [key, rate] = entries[0]
    const tips = {
      workouts: 'Schedule your sessions like appointments, or lower to fewer days so every one happens.',
      habits: 'Tie each habit to something you already do every day (after brushing your teeth, read 10 pages).',
      meals: 'Swap meals you skip for ones you actually like, or batch cook twice a week.',
    }
    return `Your ${AREA_NAMES[key]} came in at ${rate}%. ${tips[key]}`
  }
  if (waterRate != null && waterRate < 0.7) return 'You hit your water goal on fewer than 70% of days. Keep a full bottle in sight and refill it with every meal.'
  return 'Strong month. Keep the same routine and aim to beat a few of your lift records next month.'
}

export function reportShareText(r) {
  const lines = [`My ${r.label} report`]
  if (r.workouts.planned) lines.push(`Workouts: ${r.workouts.done}/${r.workouts.planned} (${r.workouts.rate}%)`)
  if (r.prCount) lines.push(`Personal records: ${r.prCount}`)
  if (r.strength) lines.push(`${r.strength.name}: +${Math.round(r.strength.pctGain)}% estimated max`)
  if (r.weight) lines.push(`Weight: ${r.weight.change > 0 ? '+' : ''}${r.weight.change} ${r.weight.unit}`)
  if (r.habits != null) lines.push(`Habits: ${r.habits}%`)
  if (r.meals != null) lines.push(`Meals on plan: ${r.meals}%`)
  if (r.water) lines.push(`Water goal: ${r.water.hit}/${r.water.days} days`)
  if (r.sleepAvg != null) lines.push(`Sleep: ${r.sleepAvg} h average`)
  return lines.join('\n')
}
