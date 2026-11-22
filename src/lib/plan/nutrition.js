import { normalizeAnswers } from './normalizeAnswers'

// Protein ranges: ISSN Position Stand (Jäger et al. 2017); per-meal dose
// ~0.4 g/kg (Schoenfeld & Aragon 2018). Energy estimate: Mifflin-St Jeor
// equation with standard activity multipliers. Safe rate-of-change:
// CDC/NIH (fat loss) and lean-bulk review synthesis. Water: National
// Academies adequate intake (total water, ~80% from drinks). Fiber: Dietary
// Guidelines for Americans (14 g per 1,000 kcal). Sleep: AASM consensus.
const PROTEIN_G_PER_KG = {
  muscleGain: [1.6, 2.2],
  fatLoss: [1.6, 2.4],
  general: [1.2, 1.6],
}

const ACTIVITY_FACTORS = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725 }
const ACTIVITY_ORDER = ['sedentary', 'light', 'moderate', 'very']
const CALORIE_FLOORS = { female: 1200, male: 1500, unspecified: 1350 }

const GENERAL_WELLNESS_COPY = [
  'Build most meals around a protein, a vegetable or fruit, and a whole-grain or starchy carb.',
  'Drink water through the day; pale-yellow urine is a simple check.',
  'Aim for 7-9 hours of sleep with a consistent wake time — even on weekends. It is one of the highest-value habits for recovery, appetite and focus.',
]

const PROTEIN_FOODS = {
  none: ['Chicken or turkey', 'Eggs', 'Greek yogurt', 'Lean beef', 'Fish or canned tuna', 'Cottage cheese', 'Lentils or beans'],
  vegetarian: ['Eggs', 'Greek yogurt', 'Cottage cheese', 'Tofu or tempeh', 'Lentils and beans', 'Edamame', 'Protein-rich pasta'],
  vegan: ['Tofu or tempeh', 'Lentils and beans', 'Edamame', 'Seitan', 'Soy milk', 'Pea-protein products', 'Peanut butter'],
  pescatarian: ['Salmon', 'Canned tuna or sardines', 'Shrimp', 'Eggs', 'Greek yogurt', 'Tofu', 'Lentils'],
  halal: ['Halal chicken or beef', 'Eggs', 'Greek yogurt', 'Fish', 'Lentils and chickpeas', 'Cottage cheese'],
  kosher: ['Kosher chicken or beef', 'Eggs', 'Fish with fins and scales', 'Greek yogurt', 'Lentils and beans', 'Cottage cheese'],
}

const RESTRICTION_FILTERS = {
  dairyFree: /yogurt|cottage cheese/i,
  glutenFree: /seitan|pasta/i,
  nutAllergy: /peanut|nut butter/i,
  soyFree: /tofu|tempeh|edamame|soy/i,
}

const MEAL_IDEAS = {
  minimal: [
    'Breakfast: Greek yogurt (or soy yogurt) with fruit and oats',
    'Lunch: Rotisserie chicken or canned beans in a wrap with bagged salad',
    'Dinner: Microwave rice + pre-cooked protein + frozen vegetables',
    'Snack: Fruit with a protein shake or a handful of edamame',
  ],
  some: [
    'Breakfast: Scrambled eggs or tofu with toast and fruit',
    'Lunch: Grain bowl — rice, a protein, roasted vegetables, sauce',
    'Dinner: Sheet-pan protein and vegetables (20 min in the oven)',
    'Snack: Cottage cheese or hummus with vegetables',
  ],
  lots: [
    'Meal prep 2-3 proteins and 2 carbs on the weekend, then mix and match',
    'Batch-cook a big pot of chili or curry for easy lunches',
    'Overnight oats in jars for grab-and-go breakfasts',
    'Prep cut vegetables and portioned snacks for the week',
  ],
}

function resolveWeightKg(a) {
  return a.fitnessGoals.fatLoss?.currentWeightKg ?? a.personal.weightKg ?? null
}

function estimateCalories(a, weightKg) {
  const { age, heightCm, sex, activityLevel } = a.personal
  if (!weightKg || !heightCm || !age) return null
  const sexOffset = sex === 'male' ? 5 : sex === 'female' ? -161 : -78
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset
  let levelIndex = ACTIVITY_ORDER.indexOf(activityLevel)
  if (levelIndex < 0) levelIndex = 1
  if (a.training.weeklyScheduleAvailableDays.length >= 3) levelIndex = Math.min(levelIndex + 1, ACTIVITY_ORDER.length - 1)
  const maintenance = Math.round((bmr * ACTIVITY_FACTORS[ACTIVITY_ORDER[levelIndex]]) / 10) * 10

  const goals = a.fitnessGoals.primary
  const floor = CALORIE_FLOORS[sex] ?? CALORIE_FLOORS.unspecified
  let target = maintenance
  let label = 'Maintenance'
  if (goals.includes('fatLoss') && goals.includes('muscleGain')) {
    target = maintenance - 250
    label = 'Body recomposition (small deficit)'
  } else if (goals.includes('fatLoss')) {
    target = maintenance - 500
    label = 'Fat loss'
  } else if (goals.includes('muscleGain')) {
    target = maintenance + 250
    label = 'Lean muscle gain'
  }
  const adjustment = a.meta.calorieAdjustmentKcal ?? 0
  target += adjustment
  const floored = target < floor
  target = Math.max(target, floor)
  return {
    maintenance,
    target,
    range: [target - 100, target + 100],
    label,
    adjustment,
    note: floored
      ? `Your estimated target was below ${floor} kcal, so it was raised to that floor. Going lower generally needs medical supervision.`
      : adjustment
        ? `Includes a ${adjustment > 0 ? '+' : ''}${adjustment} kcal adjustment based on your weigh-ins.`
        : 'This is an estimate from a standard equation, not a measurement. Log your weight weekly in the Progress tab and the app will suggest small adjustments once there is a trend.',
  }
}

function weightTimeline(a, weightKg) {
  const target = a.fitnessGoals.fatLoss?.targetWeightKg ?? a.fitnessGoals.targetWeightKg
  if (!weightKg || !target) return null
  const diff = weightKg - target
  if (diff > 0) {
    const fast = Math.ceil(diff / (weightKg * 0.01))
    const slow = Math.ceil(diff / (weightKg * 0.005))
    return `At a sustainable 0.5-1% of bodyweight per week, reaching your target would take roughly ${fast}-${slow} weeks.`
  }
  if (diff < 0) {
    const gain = -diff
    const fast = Math.ceil(gain / (weightKg * 0.005))
    const slow = Math.ceil(gain / (weightKg * 0.0025))
    return `At a lean-gain pace of 0.25-0.5% of bodyweight per week, reaching your target would take roughly ${fast}-${slow} weeks.`
  }
  return null
}

function proteinFoodsFor(a) {
  const base = PROTEIN_FOODS[a.personal.dietPreference] ?? PROTEIN_FOODS.none
  return base.filter((food) => !a.personal.dietRestrictions.some((r) => RESTRICTION_FILTERS[r]?.test(food)))
}

export function generateNutritionGuidance(rawAnswers) {
  const a = normalizeAnswers(rawAnswers)
  const disclaimer =
    'General wellness guidance based on population-level research, not individualized medical or dietary advice. Talk to a doctor or registered dietitian about your specific situation.'
  const proteinFoods = proteinFoodsFor(a)
  const mealIdeas = MEAL_IDEAS[a.personal.cookingTime] ?? MEAL_IDEAS.some
  const timing = 'Have a meal with protein and carbs 1-3 hours before training, and another protein-rich meal within a couple of hours after.'

  if (a.meta.safeMode) {
    return {
      safeMode: true,
      proteinTarget: null,
      calories: null,
      hydration: null,
      rateOfChangeGuidance: null,
      habits: GENERAL_WELLNESS_COPY,
      proteinFoods,
      mealIdeas,
      timing,
      disclaimer,
    }
  }

  const goals = a.fitnessGoals.primary
  const goalKey = goals.includes('muscleGain') ? 'muscleGain' : goals.includes('fatLoss') ? 'fatLoss' : 'general'
  const [low, high] = PROTEIN_G_PER_KG[goalKey]
  const weightKg = resolveWeightKg(a)

  const proteinTarget = {
    gramsPerKgRange: [low, high],
    gramsPerDay: weightKg ? [Math.round(low * weightKg), Math.round(high * weightKg)] : null,
    perMealGrams: weightKg ? Math.round(0.4 * weightKg) : null,
    mealsPerDay: a.personal.mealsPerDay,
    note: `Spread across your ${a.personal.mealsPerDay} meals — roughly an even amount at each.`,
  }

  const calories = estimateCalories(a, weightKg)
  const rateOfChangeGuidance = goals.includes('fatLoss')
    ? 'Aim for about 0.5-1% of your bodyweight per week (roughly 1-2 lb). Faster loss tends to cost muscle along with fat.'
    : goals.includes('muscleGain')
      ? 'Aim to gain about 0.25-0.5% of your bodyweight per week. Faster surpluses mostly add fat, not muscle.'
      : null

  const sex = a.personal.sex
  const hydration = {
    litersPerDayRange: sex === 'male' ? [3.7, 3.7] : sex === 'female' ? [2.7, 2.7] : [2.7, 3.7],
    note: 'Total water from all drinks and food. Drink more in heat or on hard training days.',
  }

  return {
    safeMode: false,
    proteinTarget,
    calories,
    fiberGrams: calories ? Math.round((calories.target / 1000) * 14) : null,
    hydration,
    rateOfChangeGuidance,
    weightTimeline: weightTimeline(a, weightKg),
    habits: GENERAL_WELLNESS_COPY,
    proteinFoods,
    mealIdeas,
    timing,
    disclaimer,
  }
}
