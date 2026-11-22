import { computeCategoryConsistency } from '../planProgress'
import { addDays } from '../dates'

// Thresholds and framing straight from the self-efficacy/goal-revision
// research: people naturally lower goals after repeated failure and raise
// them after repeated success (2025 goal-revision review), and reframing a
// lapse as normal/situational — not an identity failure — preserves
// self-efficacy better than pressure does (Leiden setback-forewarning
// study). Needs at least a few data points before saying anything —
// a single day's miss or win is noise, not a trend.
const REDUCE_THRESHOLD = 0.45
const PROGRESS_THRESHOLD = 0.9
const WINDOW_DAYS = 14
const MIN_SAMPLE_SIZE = 3

const CATEGORY_LABELS = { workout: 'workout', mentalDev: 'personal development' }

// mealChecks: { "YYYY-MM-DD": [eaten meal keys] }; mealsPerDay: planned
// meals on a normal day. Only days with at least one tick count, so
// someone who never uses the checkboxes isn't told they skipped meals.
export function computeMealAdherence(mealChecks, mealsPerDay, endDateStr, windowDays = 7) {
  if (!mealChecks || !mealsPerDay) return { rate: null, sampleSize: 0 }
  let eaten = 0
  let trackedDays = 0
  for (let offset = 0; offset < windowDays; offset += 1) {
    const ticks = mealChecks[addDays(endDateStr, -offset)]
    if (!ticks?.length) continue
    trackedDays += 1
    eaten += Math.min(ticks.length, mealsPerDay)
  }
  return { rate: trackedDays ? eaten / (trackedDays * mealsPerDay) : null, sampleSize: trackedDays }
}

export function computeWeekSnapshot(planDays, weekStart, { mealChecks, mealsPerDay } = {}) {
  // The reviewed week runs weekStart..weekStart+6; look back two weeks from its end.
  const weekEnd = addDays(weekStart, 6)
  return {
    weekStart,
    workout: computeCategoryConsistency(planDays, 'workout', { windowDays: WINDOW_DAYS, referenceDateStr: weekEnd }),
    mentalDev: computeCategoryConsistency(planDays, 'mentalDev', { windowDays: WINDOW_DAYS, referenceDateStr: weekEnd }),
    meals: computeMealAdherence(mealChecks, mealsPerDay, weekEnd),
  }
}

export function proposeAdjustments(weekSnapshot) {
  const proposals = []
  for (const category of ['workout', 'mentalDev']) {
    const { rate, sampleSize } = weekSnapshot[category]
    if (rate == null || sampleSize < MIN_SAMPLE_SIZE) continue

    if (rate < REDUCE_THRESHOLD) {
      proposals.push({
        id: `${category}-reduce`,
        category,
        action: 'reduce',
        reason: `You've completed ${Math.round(rate * 100)}% of your ${CATEGORY_LABELS[category]} tasks over the last two weeks. That's normal, not a failure — easing the load for a bit tends to make it more sustainable.`,
      })
    } else if (rate > PROGRESS_THRESHOLD) {
      proposals.push({
        id: `${category}-progress`,
        category,
        action: 'progress',
        reason: `You've completed ${Math.round(rate * 100)}% of your ${CATEGORY_LABELS[category]} tasks over the last two weeks — you're ready for more of a challenge.`,
      })
    }
  }
  const meals = weekSnapshot.meals
  if (meals && meals.rate != null && meals.sampleSize >= MIN_SAMPLE_SIZE && meals.rate < 0.5) {
    proposals.push({
      id: 'meals-simplify',
      category: 'meals',
      action: 'simplify',
      reason: `You ate ${Math.round(meals.rate * 100)}% of your planned meals on the days you tracked. That usually means the plan doesn't fit your week yet — quicker meals and fewer different recipes are easier to stick with. Approving switches your plan to quicker recipes.`,
    })
  }
  return proposals
}
