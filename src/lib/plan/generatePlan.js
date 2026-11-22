import { generateWorkoutProgram } from './workout'
import { generateNutritionGuidance } from './nutrition'
import { generateMentalDevPlan } from './mentalDev'
import { generateFinancialPlan } from './financial'
import { buildDailySchedule } from './schedule'
import { normalizeAnswers } from './normalizeAnswers'

export const ENGINE_VERSION = 3

// Pure, deterministic — no AI call, no network, no randomness beyond the
// id. Same answers in, same plan shape out. Free-text onboarding fields
// (weaknessesFreeText, injuryNotes, motivationWhy) are never read here for
// branching logic — only structured fields drive what gets generated.
export function generatePlan(rawAnswers) {
  const answers = normalizeAnswers(rawAnswers)
  const workout = generateWorkoutProgram(answers)
  const nutrition = generateNutritionGuidance(answers)
  const mentalDev = generateMentalDevPlan(answers)
  const financial = generateFinancialPlan(answers)
  const schedule = buildDailySchedule(answers, { workout, mentalDev, financial })

  return {
    id: crypto.randomUUID(),
    engineVersion: ENGINE_VERSION,
    generatedAt: new Date().toISOString(),
    intensityTier: answers.meta.intensityTier,
    workout,
    nutrition,
    mentalDev,
    financial,
    schedule,
    disclaimers: [nutrition.disclaimer, financial.disclaimer].filter(Boolean),
  }
}
