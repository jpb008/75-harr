import { generatePlan } from './generatePlan'
import { TIERS } from './tierConfig'
import { normalizeAnswers } from './normalizeAnswers'
import { applyCalorieAdjustment } from './bodyweight'
import { today } from '../dates'

// Approving a proposal edits the ONBOARDING ANSWERS, then regenerates the
// plan through the same deterministic engine everyone else's plan comes
// from — never a direct mutation of the plan object. That keeps "what
// changed and why" fully explainable from the answers alone.
function adjustAnswersForWorkout(answers, action) {
  const tierIndex = TIERS.indexOf(answers.meta.intensityTier)
  if (action === 'reduce') {
    if (tierIndex > 0) return { ...answers, meta: { ...answers.meta, intensityTier: TIERS[tierIndex - 1] } }
    const days = answers.training.weeklyScheduleAvailableDays
    if (days.length > 2) {
      return { ...answers, training: { ...answers.training, weeklyScheduleAvailableDays: days.slice(0, -1) } }
    }
    return answers
  }
  if (action === 'progress' && tierIndex < TIERS.length - 1) {
    return { ...answers, meta: { ...answers.meta, intensityTier: TIERS[tierIndex + 1] } }
  }
  return answers
}

function adjustAnswersForMentalDev(answers, action) {
  const focusAreas = answers.mentalGoals.focusAreas
  if (action === 'reduce' && focusAreas.length > 1) {
    return { ...answers, mentalGoals: { ...answers.mentalGoals, focusAreas: focusAreas.slice(0, -1) } }
  }
  return answers
}

// Quicker meals first; if already quick, repeat a few favourites.
function adjustAnswersForMeals(answers) {
  const p = answers.personal
  if (p.cookingTime !== 'minimal') {
    return { ...answers, personal: { ...p, cookingTime: p.cookingTime === 'lots' ? 'some' : 'minimal' } }
  }
  if (p.mealVariety !== 'same') return { ...answers, personal: { ...p, mealVariety: 'same' } }
  return answers
}

// approvedAdjustments: the subset of proposeAdjustments()'s output the
// user explicitly checked off — never applied automatically.
export function applyAdjustments(rawAnswers, approvedAdjustments) {
  let nextAnswers = normalizeAnswers(rawAnswers)
  for (const adjustment of approvedAdjustments) {
    if (adjustment.category === 'workout') nextAnswers = adjustAnswersForWorkout(nextAnswers, adjustment.action)
    else if (adjustment.category === 'mentalDev') nextAnswers = adjustAnswersForMentalDev(nextAnswers, adjustment.action)
    else if (adjustment.category === 'meals') nextAnswers = adjustAnswersForMeals(nextAnswers)
    else if (adjustment.category === 'nutrition' && adjustment.delta) nextAnswers = applyCalorieAdjustment(nextAnswers, adjustment.delta, today())
  }
  return { answers: nextAnswers, plan: generatePlan(nextAnswers) }
}
