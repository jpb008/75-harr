import { normalizeAnswers } from './normalizeAnswers'

// weighIns shape: { [dateStr]: { weight, unit: 'lb'|'kg' } }
//
// Rate targets mirror the nutrition guidance: fat loss ~0.5-1% of
// bodyweight per week, lean gain ~0.25-0.5%/week, recomposition holds
// roughly steady. Adjustments are +/-150 kcal — small enough not to
// overshoot — and need >=3 weigh-ins over >=14 days so day-to-day water
// swings aren't mistaken for a trend.

const LB_PER_KG = 2.20462
const DAY_MS = 86400000
export const CALORIE_STEP = 150
const WINDOW_DAYS = 42
const MIN_SPAN_DAYS = 14
const MIN_POINTS = 3
const MIN_DAYS_BETWEEN_ADJUSTMENTS = 14

export function toKg(entry) {
  return entry.unit === 'kg' ? entry.weight : entry.weight / LB_PER_KG
}

export function fromKg(kg, unit) {
  return unit === 'kg' ? kg : kg * LB_PER_KG
}

function dayNumber(dateStr) {
  return Math.round(new Date(`${dateStr}T12:00:00`).getTime() / DAY_MS)
}

export function sortedWeighIns(weighIns) {
  return Object.keys(weighIns)
    .sort()
    .map((date) => ({ date, kg: toKg(weighIns[date]) }))
}

export function goalRate(rawAnswers) {
  const goals = normalizeAnswers(rawAnswers).fitnessGoals.primary
  if (goals.includes('fatLoss') && goals.includes('muscleGain')) return { range: [-0.5, 0.1], label: 'roughly steady, drifting slightly down' }
  if (goals.includes('fatLoss')) return { range: [-1, -0.5], label: 'losing 0.5-1% a week' }
  if (goals.includes('muscleGain')) return { range: [0.25, 0.5], label: 'gaining 0.25-0.5% a week' }
  return { range: [-0.25, 0.25], label: 'holding steady' }
}

// Least-squares slope over the recent window, as % of bodyweight per week.
export function weightTrend(weighIns, todayStr) {
  const today = dayNumber(todayStr)
  const points = sortedWeighIns(weighIns).filter((p) => today - dayNumber(p.date) <= WINDOW_DAYS)
  if (points.length < 2) return { points, enough: false }
  const xs = points.map((p) => dayNumber(p.date))
  const ys = points.map((p) => p.kg)
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  const num = xs.reduce((acc, x, i) => acc + (x - mx) * (ys[i] - my), 0)
  const den = xs.reduce((acc, x) => acc + (x - mx) ** 2, 0)
  const slopePerDay = den === 0 ? 0 : num / den
  const span = xs[n - 1] - xs[0]
  return {
    points,
    enough: n >= MIN_POINTS && span >= MIN_SPAN_DAYS && today - xs[n - 1] <= 10,
    kgPerWeek: slopePerDay * 7,
    pctPerWeek: ((slopePerDay * 7) / my) * 100,
    spanDays: span,
  }
}

// Calorie targets need age, height and weight (Mifflin-St Jeor); without
// them there's no number to adjust, so no suggestion is made.
export function hasCalorieTarget(rawAnswers) {
  const { personal, fitnessGoals, meta } = normalizeAnswers(rawAnswers)
  return !meta.safeMode && Boolean(personal.age && personal.heightCm && (personal.weightKg ?? fitnessGoals.fatLoss?.currentWeightKg))
}

export function calorieSuggestion(weighIns, rawAnswers, todayStr) {
  const answers = normalizeAnswers(rawAnswers)
  if (!hasCalorieTarget(answers)) return null
  const trend = weightTrend(weighIns, todayStr)
  if (!trend.enough) return null
  const last = answers.meta.lastCalorieAdjustmentAt
  if (last && dayNumber(todayStr) - dayNumber(last) < MIN_DAYS_BETWEEN_ADJUSTMENTS) return null

  const { range, label } = goalRate(answers)
  const pct = Math.round(trend.pctPerWeek * 100) / 100
  const direction = pct >= 0 ? 'gaining' : 'losing'
  const rateText = `You're ${direction} about ${Math.abs(pct).toFixed(2)}% of your bodyweight per week`
  if (pct < range[0]) {
    return { delta: CALORIE_STEP, reason: `${rateText}, faster down than your goal (${label}). Adding ${CALORIE_STEP} calories a day should bring it back on pace.` }
  }
  if (pct > range[1]) {
    return { delta: -CALORIE_STEP, reason: `${rateText}, above your goal (${label}). Cutting ${CALORIE_STEP} calories a day should bring it back on pace.` }
  }
  return null
}

export function applyCalorieAdjustment(rawAnswers, delta, todayStr) {
  const answers = normalizeAnswers(rawAnswers)
  return {
    ...answers,
    meta: {
      ...answers.meta,
      calorieAdjustmentKcal: (answers.meta.calorieAdjustmentKcal ?? 0) + delta,
      lastCalorieAdjustmentAt: todayStr,
    },
  }
}
