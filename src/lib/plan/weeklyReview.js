import { computeCategoryConsistency } from '../planProgress'

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

export function computeWeekSnapshot(planDays, weekStart) {
  return {
    weekStart,
    workout: computeCategoryConsistency(planDays, 'workout', { windowDays: WINDOW_DAYS, referenceDateStr: weekStart }),
    mentalDev: computeCategoryConsistency(planDays, 'mentalDev', { windowDays: WINDOW_DAYS, referenceDateStr: weekStart }),
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
  return proposals
}
