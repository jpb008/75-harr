import { generateWorkoutProgram } from './workout'
import { generateNutritionGuidance } from './nutrition'
import { generateMentalDevPlan } from './mentalDev'
import { generateFinancialPlan } from './financial'
import { buildDailySchedule } from './schedule'

// Pure, deterministic — no AI call, no network, no randomness beyond the
// id. Same answers in, same plan shape out. Free-text onboarding fields
// (weaknessesFreeText, injuryNotes) are never read here for branching
// logic — only structured fields drive what gets generated; free text is
// carried through for display only (see mentalDev.js).
export function generatePlan(answers) {
  const workout = generateWorkoutProgram(answers)
  const nutrition = generateNutritionGuidance(answers)
  const mentalDev = generateMentalDevPlan(answers)
  const financial = generateFinancialPlan(answers)
  const schedule = buildDailySchedule(answers, { workout, mentalDev, financial })

  return {
    id: crypto.randomUUID(),
    generatedAt: new Date().toISOString(),
    intensityTier: answers.meta?.intensityTier ?? null,
    workout,
    nutrition,
    mentalDev,
    financial,
    schedule,
    disclaimers: [nutrition.disclaimer, financial.disclaimer].filter(Boolean),
  }
}
