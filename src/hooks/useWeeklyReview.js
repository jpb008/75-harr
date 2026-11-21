import { useState } from 'react'
import { apiFetch, apiConfigured } from '../lib/api'
import { today, addDays, parseDateStr } from '../lib/dates'
import { loadJSON, saveJSON } from '../lib/storage'
import { computeWeekSnapshot, proposeAdjustments } from '../lib/plan/weeklyReview'
import { applyAdjustments } from '../lib/plan/applyAdjustments'

function weekStartDateStr(dateStr) {
  const dow = parseDateStr(dateStr).getDay()
  return addDays(dateStr, -dow)
}

// Reviews the week that just ended, once per week — never the
// still-in-progress current week.
export function useWeeklyReview(token, plan, answers, savePlan) {
  const previousWeekStart = addDays(weekStartDateStr(today()), -7)
  const lastReviewedWeek = loadJSON('lastReviewedWeekStart', null)
  // A plan generated THIS week (e.g. a brand-new user who just finished
  // onboarding) has no completed week behind it yet — nothing to review.
  const planPredatesReviewWeek = Boolean(plan?.generatedAt) && plan.generatedAt.slice(0, 10) <= previousWeekStart
  const isDue = Boolean(plan) && lastReviewedWeek !== previousWeekStart && planPredatesReviewWeek

  const [snapshot, setSnapshot] = useState(null)
  const [proposals, setProposals] = useState([])

  function prepareReview() {
    const planDays = loadJSON('planDays', {})
    const weekSnapshot = computeWeekSnapshot(planDays, previousWeekStart)
    setSnapshot(weekSnapshot)
    setProposals(proposeAdjustments(weekSnapshot))
  }

  async function submitReview(reviewAnswers, approvedAdjustmentIds) {
    const approved = proposals.filter((p) => approvedAdjustmentIds.includes(p.id))
    saveJSON('lastReviewedWeekStart', previousWeekStart)

    if (token && apiConfigured()) {
      try {
        await apiFetch('/weekly-review', {
          method: 'POST',
          token,
          body: { weekStart: previousWeekStart, answers: reviewAnswers, stats: snapshot, proposedAdjustments: proposals },
        })
      } catch {
        // offline — the local flag above still stops this from re-prompting
      }
    }

    if (approved.length > 0 && answers) {
      const { answers: nextAnswers, plan: nextPlan } = applyAdjustments(answers, approved)
      await savePlan(nextAnswers, { source: 'weekly_review_adjustment' })
      return nextPlan
    }
    return null
  }

  return { isDue, previousWeekStart, snapshot, proposals, prepareReview, submitReview }
}
