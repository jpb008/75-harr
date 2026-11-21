// Protein ranges: ISSN Position Stand (Jäger et al. 2017) + Examine.com
// dose-response synthesis. Safe rate-of-change: CDC/NIH (fat loss) and
// controlled-overfeeding review synthesis (lean bulk). Sleep: AASM/National
// Sleep Foundation adult consensus.
const PROTEIN_G_PER_KG = {
  muscleGain: [1.6, 2.2],
  fatLoss: [1.6, 2.4],
  general: [0.8, 0.8],
}

const GENERAL_WELLNESS_COPY = [
  'Eat a mix of whole foods — protein, vegetables, fruit, whole grains — most days.',
  'Drink water through the day; let thirst be your main guide.',
  'Aim for 7-9 hours of sleep, with a consistent wake time including weekends — this is one of the highest-value habits for recovery and focus.',
]

function resolveWeightKg(answers) {
  return answers.fitnessGoals?.fatLoss?.currentWeightKg ?? answers.personal?.weightKg ?? null
}

export function generateNutritionGuidance(answers) {
  const disclaimer =
    'General wellness guidance based on population-level research, not individualized medical or dietary advice. Talk to a doctor or registered dietitian about your specific situation.'

  if (answers.meta?.safeMode) {
    return {
      safeMode: true,
      proteinTarget: null,
      hydration: null,
      rateOfChangeGuidance: null,
      habits: GENERAL_WELLNESS_COPY,
      disclaimer,
    }
  }

  const primaryGoals = answers.fitnessGoals?.primary ?? []
  const goalKey = primaryGoals.includes('muscleGain') ? 'muscleGain' : primaryGoals.includes('fatLoss') ? 'fatLoss' : 'general'
  const [low, high] = PROTEIN_G_PER_KG[goalKey]
  const weightKg = resolveWeightKg(answers)

  const proteinTarget = {
    gramsPerKgRange: [low, high],
    gramsPerDay: weightKg ? [Math.round(low * weightKg), Math.round(high * weightKg)] : null,
    note: 'Spread across 3-4 meals where practical.',
  }

  const rateOfChangeGuidance = primaryGoals.includes('fatLoss')
    ? 'Aim for roughly 1-2 lb/week of loss (around a 500 kcal/day deficit) — faster loss risks losing muscle along with fat.'
    : primaryGoals.includes('muscleGain')
      ? "Aim for roughly 0.25-0.5% of your bodyweight per week gained — faster surpluses mostly add fat, not muscle."
      : null

  return {
    safeMode: false,
    proteinTarget,
    hydration: { litersPerDayRange: [2.7, 3.7], note: 'Adjust upward for heat or heavy activity — thirst is a fine guide day to day.' },
    rateOfChangeGuidance,
    habits: GENERAL_WELLNESS_COPY,
    disclaimer,
  }
}
