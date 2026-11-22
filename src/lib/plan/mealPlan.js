import { INGREDIENTS, MEALS, mealCost } from './foodLibrary'
import { normalizeAnswers } from './normalizeAnswers'
import { generateNutritionGuidance } from './nutrition'
import { WEEKDAY_NAMES } from './options'

// Builds a 7-day meal plan from the food library: every meal is filtered
// by diet, restrictions, dislikes, kitchen and cooking time, adapted with
// safe substitutions (e.g. soy milk for milk when dairy-free), then scaled
// in quarter-portion steps so each day lands near the calorie target, with
// a protein top-up when a day falls short. Deterministic: same answers,
// same plan.

const SLOT_WEIGHTS = { breakfast: 0.25, lunch: 0.3, dinner: 0.32, snack: 0.13 }
const SLOT_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' }
const LB_PER_KG = 2.20462

function round(n, step = 1) {
  // toFixed strips float noise like 1.9000000000000001
  return Number((Math.round(n / step) * step).toFixed(2))
}

// ── Adapting meals to the user's diet ──────────────────────────────────

function dairySwap(id, ctx) {
  if (id === 'milk') return ctx.soyFree ? 'oatMilk' : 'soyMilk'
  if (id === 'greekYogurt') return ctx.soyFree ? 'EXCLUDE' : 'soyYogurt'
  if (id === 'whey') return 'peaProtein'
  if (id === 'cottageCheese') return 'EXCLUDE'
  if (['cheddar', 'mozzarella', 'feta'].includes(id)) return 'REMOVE'
  return null
}

function adaptIngredient(id, grams, meal, ctx) {
  const ing = INGREDIENTS[id]
  const tags = ing.tags
  const pref = ctx.diet

  if ((pref === 'vegetarian' || pref === 'vegan') && tags.some((t) => ['meat', 'fish', 'shellfish'].includes(t))) return 'EXCLUDE'
  if (pref === 'vegan' && tags.includes('egg')) return 'EXCLUDE'
  if (pref === 'pescatarian' && tags.includes('meat')) return 'EXCLUDE'
  if (pref === 'kosher' && tags.includes('shellfish')) return 'EXCLUDE'
  if (pref === 'vegan' && tags.includes('honey')) return ['maple', grams]
  if ((pref === 'vegan' || ctx.dairyFree) && tags.includes('dairy')) {
    const swap = dairySwap(id, ctx)
    if (swap === 'EXCLUDE' || swap === 'REMOVE') return swap
    if (swap) return [swap, grams]
  }
  // Kosher practice doesn't mix meat and dairy in one meal: drop the cheese.
  if (pref === 'kosher' && tags.includes('dairy') && meal.ingredients.some(([other]) => INGREDIENTS[other].tags.includes('meat'))) return 'REMOVE'
  if (ctx.glutenFree && tags.includes('gluten')) {
    const swaps = { wwPasta: ['gfPasta', grams], bread: ['gfBread', grams], tortilla: ['cornTortilla', 60], soySauce: [ctx.soyFree ? 'coconutAminos' : 'tamari', grams] }
    return swaps[id] ?? 'EXCLUDE'
  }
  if (ctx.soyFree && tags.includes('soy')) {
    const swaps = { soySauce: ['coconutAminos', grams], tamari: ['coconutAminos', grams], soyMilk: ['oatMilk', grams] }
    return swaps[id] ?? 'EXCLUDE'
  }
  if (ctx.nutAllergy && tags.includes('nut')) {
    return id === 'peanutButter' ? ['sunflowerButter', grams] : ['pumpkinSeeds', grams]
  }
  if (ing.group && ctx.dislikes.has(ing.group)) {
    // A small topping can just be left off; a main ingredient rules the meal out.
    if (ing.group === 'cheese' || grams <= 30) return 'REMOVE'
    if (ing.group === 'peanutButter') return ['almonds', grams]
    return 'EXCLUDE'
  }
  return null
}

function adaptMeal(meal, ctx) {
  if (meal.shake && !ctx.shakes) return null
  let ingredients = meal.ingredients
  // A swap can introduce a new conflict (e.g. soy milk for someone soy-free),
  // so re-check until nothing changes.
  for (let pass = 0; pass < 3; pass += 1) {
    let changed = false
    const next = []
    for (const [id, grams] of ingredients) {
      const result = adaptIngredient(id, grams, { ...meal, ingredients }, ctx)
      if (result === 'EXCLUDE') return null
      if (result === 'REMOVE') {
        changed = true
        continue
      }
      if (result) {
        changed = true
        next.push(result)
      } else next.push([id, grams])
    }
    ingredients = next
    if (!changed) break
  }
  return { ...meal, ingredients }
}

function nutritionOf(ingredients, factor = 1) {
  const totals = { kcal: 0, p: 0, c: 0, f: 0 }
  for (const [id, grams] of ingredients) {
    const ing = INGREDIENTS[id]
    const g = grams * factor
    totals.kcal += (ing.kcal * g) / 100
    totals.p += (ing.p * g) / 100
    totals.c += (ing.c * g) / 100
    totals.f += (ing.f * g) / 100
  }
  return totals
}

// ── Choosing meals ─────────────────────────────────────────────────────

function fitsKitchen(meal, ctx, relax) {
  if (relax >= 2) return true
  if (ctx.kitchen === 'none') return meal.kitchen === 'none'
  if (ctx.kitchen === 'microwave') return meal.kitchen !== 'stove'
  return true
}

function fitsTime(meal, ctx, relax) {
  if (relax >= 1) return true
  if (meal.time === 'batch') return ctx.batch || ctx.cookingTime === 'lots'
  if (ctx.cookingTime === 'minimal') return meal.time === 'quick'
  return true
}

function scoreMeal(meal, ctx) {
  const n = nutritionOf(meal.ingredients)
  let score = 0
  if (meal.cuisines.some((c) => ctx.cuisines.has(c))) score += 4
  const cost = mealCost(meal)
  if (ctx.budget === 'tight') score += cost === 3 ? -6 : cost === 2 ? -1 : 1
  else if (ctx.budget === 'moderate' && cost === 3) score -= 2
  // Match each meal's protein share of calories to the day's target share,
  // so portions scaled up for calories don't overshoot protein (or miss it).
  const proteinShare = (n.p * 4) / Math.max(n.kcal, 1)
  if (ctx.targetProteinShare) score -= Math.abs(proteinShare - ctx.targetProteinShare) * 25
  else score += proteinShare * (ctx.proteinFocus ? 8 : 3)
  if (ctx.batch && (meal.time === 'batch' || meal.prepAhead)) score += 2
  if (ctx.cookingTime === 'minimal' && meal.time === 'quick') score += 1
  return score
}

function rankedFor(slotType, ctx) {
  for (let relax = 0; relax <= 2; relax += 1) {
    const pool = MEALS.filter((meal) => meal.slot === slotType)
      .map((meal) => adaptMeal(meal, ctx))
      .filter(Boolean)
      .filter((meal) => fitsKitchen(meal, ctx, relax) && fitsTime(meal, ctx, relax))
    if (pool.length >= (slotType === 'main' ? 2 : 1)) {
      return { relaxed: relax > 0, list: pool.map((meal) => ({ meal, score: scoreMeal(meal, ctx) })).sort((a, b) => b.score - a.score).map((x) => x.meal) }
    }
  }
  return { relaxed: true, list: [] }
}

function slotsFor(ctx) {
  const n = ctx.mealsPerDay
  if (!ctx.breakfast) {
    return n <= 2 ? ['lunch', 'dinner'] : n === 3 ? ['lunch', 'snack', 'dinner'] : ['lunch', 'snack', 'dinner', 'snack']
  }
  return n <= 2 ? ['breakfast', 'dinner'] : n === 3 ? ['breakfast', 'lunch', 'dinner'] : n === 4 ? ['breakfast', 'lunch', 'snack', 'dinner'] : ['breakfast', 'snack', 'lunch', 'snack', 'dinner']
}

function slotType(slot) {
  return slot === 'lunch' || slot === 'dinner' ? 'main' : slot
}

// Picks a meal for one slot on one day, honoring the variety preference
// and keeping lunch and dinner different on the same day.
function pickMeal(list, { day, slot, ctx, usedToday, history }) {
  if (!list.length) return null
  const avoid = (meal) => usedToday.has(meal.id)
  if (ctx.batch && slotType(slot) === 'main') {
    // Two batch-cooked meals per half week for each of lunch and dinner.
    const half = day < 4 ? 0 : 1
    const offset = slot === 'lunch' ? 2 : 0
    const ordered = list.filter((m) => !avoid(m))
    return ordered[(offset + half) % ordered.length] ?? list[0]
  }
  if (ctx.variety === 'same') {
    const ordered = list.filter((m) => !avoid(m))
    return ordered[slotType(slot) === 'main' ? day % Math.min(2, ordered.length) : 0] ?? list[0]
  }
  if (ctx.variety === 'some') {
    const ordered = list.filter((m) => !avoid(m)).slice(0, 3)
    return ordered[(day + (slot === 'dinner' ? 1 : 0)) % ordered.length] ?? list[0]
  }
  // Lots of variety: rotate through the better-fitting part of the ranked
  // list, least-used first.
  const options = list.slice(0, Math.max(4, Math.ceil(list.length * 0.6))).filter((m) => !avoid(m))
  if (!options.length) return list[0]
  const uses = (m) => history.filter((id) => id === m.id).length
  return [...options].sort((x, y) => uses(x) - uses(y))[0]
}

function scaleFactor(meal, targetKcal) {
  if (!targetKcal) return 1
  const base = nutritionOf(meal.ingredients).kcal
  const raw = targetKcal / base
  // Shakes come in whole scoops; snacks stay snack-sized.
  if (meal.shake) return Math.min(2, Math.max(1, Math.round(raw)))
  const max = meal.slot === 'snack' ? 1.5 : 2
  return Math.min(max, Math.max(0.5, round(raw, 0.25)))
}

// ── Formatting amounts ─────────────────────────────────────────────────

export function amountText(id, grams, units) {
  const ing = INGREDIENTS[id]
  if (ing.unitGrams) {
    const step = ing.countStep ?? 0.5
    const count = Math.max(step, round(grams / ing.unitGrams, step))
    const label = count === 1 ? ing.unitName : `${ing.unitName}s`
    return `${count} ${label}`
  }
  // Oils, nut butters, sauces and seeds read better in spoons than ounces.
  if (ing.tbsp && grams / ing.tbsp <= 6) {
    const tbsp = grams / ing.tbsp
    if (tbsp < 0.9) {
      const tsp = Math.max(0.5, round(tbsp * 3, 0.5))
      return `${tsp} tsp`
    }
    return `${round(tbsp, 0.5)} tbsp`
  }
  if (ing.liquid) {
    if (units === 'metric') return grams >= 1000 ? `${round(grams / 1000, 0.1)} L` : `${round(grams, 10)} ml`
    const cups = round(grams / 240, 0.25)
    return `${cups} cup${cups === 1 ? '' : 's'}`
  }
  if (units === 'metric') return grams >= 1000 ? `${round(grams / 1000, 0.1)} kg` : `${round(grams, 5)} g`
  const oz = grams / 28.35
  if (oz >= 16) return `${round(grams / 453.6, 0.1)} lb`
  return `${oz < 1 ? round(oz, 0.25) : round(oz, 0.5)} oz`
}

// "1.5 bananas" rather than "1.5 bananas Banana"; "3 slices whole-wheat bread".
function displayLine(id, grams, units) {
  const ing = INGREDIENTS[id]
  const amount = amountText(id, grams, units)
  const name = ing.name.toLowerCase()
  if (ing.unitName && (name.startsWith(ing.unitName) || ing.unitName.includes(name.replace(/s$/, '')))) return amount
  return `${amount} ${ing.name.charAt(0).toLowerCase()}${ing.name.slice(1)}`
}

function mealEntry(meal, slot, factor, ctx, extra = {}) {
  const n = nutritionOf(meal.ingredients, factor)
  return {
    slot,
    slotLabel: SLOT_LABELS[slot],
    id: meal.id,
    name: meal.name,
    servings: factor,
    ingredients: meal.ingredients.map(([id, grams]) => ({
      id,
      name: INGREDIENTS[id].name,
      grams: grams * factor,
      amountText: amountText(id, grams * factor, ctx.units),
      display: displayLine(id, grams * factor, ctx.units),
    })),
    kcal: Math.round(n.kcal),
    p: Math.round(n.p),
    c: Math.round(n.c),
    f: Math.round(n.f),
    steps: meal.steps,
    kitchen: meal.kitchen,
    time: meal.time,
    ...extra,
  }
}

function sumTotals(meals) {
  return meals.reduce((t, m) => ({ kcal: t.kcal + m.kcal, p: t.p + m.p, c: t.c + m.c, f: t.f + m.f }), { kcal: 0, p: 0, c: 0, f: 0 })
}

function postWorkoutSlot(slots, preferredTimeOfDay) {
  if (preferredTimeOfDay === 'morning') return slots[0]
  if (preferredTimeOfDay === 'afternoon') return slots.includes('lunch') ? 'lunch' : slots[0]
  return 'dinner'
}

// ── Main entry ─────────────────────────────────────────────────────────

export function generateMealPlan(rawAnswers, trainingDays = []) {
  const a = normalizeAnswers(rawAnswers)
  const p = a.personal
  const nutrition = generateNutritionGuidance(a)
  const showNumbers = !nutrition.safeMode
  const kcalTarget = showNumbers ? nutrition.calories?.target ?? null : null
  const proteinRange = showNumbers ? nutrition.proteinTarget?.gramsPerDay ?? null : null

  const ctx = {
    diet: p.dietPreference,
    dairyFree: p.dietRestrictions.includes('dairyFree'),
    glutenFree: p.dietRestrictions.includes('glutenFree'),
    nutAllergy: p.dietRestrictions.includes('nutAllergy'),
    soyFree: p.dietRestrictions.includes('soyFree'),
    dislikes: new Set(p.foodDislikes),
    shakes: p.proteinShakes !== 'no',
    kitchen: p.kitchenAccess,
    cookingTime: p.cookingTime,
    budget: p.groceryBudget,
    cuisines: new Set(p.cuisines),
    breakfast: p.eatsBreakfast !== 'no',
    batch: p.mealPrepStyle === 'batch',
    variety: p.mealVariety,
    mealsPerDay: p.mealsPerDay,
    units: p.units,
    proteinFocus: a.fitnessGoals.primary.some((g) => ['fatLoss', 'muscleGain', 'strength'].includes(g)),
    targetProteinShare: kcalTarget && proteinRange ? (((proteinRange[0] + proteinRange[1]) / 2) * 4) / kcalTarget : null,
  }

  const slots = slotsFor(ctx)
  const weightSum = slots.reduce((s, slot) => s + SLOT_WEIGHTS[slot], 0)
  const ranked = {
    breakfast: rankedFor('breakfast', ctx),
    main: rankedFor('main', ctx),
    snack: rankedFor('snack', ctx),
  }
  const proteinSnacks = ranked.snack.list
    .map((meal) => ({ meal, n: nutritionOf(meal.ingredients) }))
    .sort((x, y) => y.n.p - x.n.p)

  const days = []
  const history = []
  for (let day = 0; day < 7; day += 1) {
    const dayOfWeek = (day + 1) % 7 // week runs Monday -> Sunday
    const isTraining = trainingDays.includes(dayOfWeek)
    const postSlot = isTraining ? postWorkoutSlot(slots, a.training.preferredTimeOfDay) : null
    const usedToday = new Set()
    const meals = []
    slots.forEach((slot, i) => {
      const list = ranked[slotType(slot)].list
      const meal = pickMeal(list, { day, slot, ctx, usedToday, history })
      if (!meal) return
      usedToday.add(meal.id)
      history.push(meal.id)
      const target = kcalTarget ? (kcalTarget * SLOT_WEIGHTS[slot]) / weightSum : null
      const factor = showNumbers ? scaleFactor(meal, target) : 1
      meals.push(mealEntry(meal, slot, factor, ctx, { postWorkout: slot === postSlot && slots.indexOf(slot) === i }))
    })

    // Protein top-up: if the day is short of the low end of the target,
    // swap the snack for the most protein-dense option, then add an extra
    // portion of it if still short.
    if (proteinRange && proteinSnacks.length) {
      let totals = sumTotals(meals)
      const best = proteinSnacks[0].meal
      if (totals.p < proteinRange[0] * 0.95) {
        const snackIndex = meals.findIndex((m) => m.slot === 'snack' && m.id !== best.id)
        if (snackIndex >= 0) {
          meals[snackIndex] = mealEntry(best, 'snack', 1, ctx, { swappedForProtein: true })
          totals = sumTotals(meals)
        }
      }
      if (totals.p < proteinRange[0] * 0.95) {
        meals.push(mealEntry(best, 'snack', 1, ctx, { addOn: true, slotLabel: 'Protein top-up' }))
      }
    }

    days.push({ dayOfWeek, name: WEEKDAY_NAMES[dayOfWeek], isTraining, meals, totals: sumTotals(meals) })
  }

  // Grocery list for the whole week, grouped by store section.
  const grams = {}
  for (const d of days) for (const meal of d.meals) for (const ing of meal.ingredients) grams[ing.id] = (grams[ing.id] ?? 0) + ing.grams
  const byCategory = {}
  for (const [id, g] of Object.entries(grams)) {
    const cat = INGREDIENTS[id].category
    ;(byCategory[cat] ??= []).push({ id, name: INGREDIENTS[id].name, amountText: amountText(id, g, ctx.units), display: displayLine(id, g, ctx.units) })
  }
  const categoryOrder = ['Protein', 'Produce', 'Frozen', 'Dairy', 'Dairy alternatives', 'Deli', 'Bakery', 'Pantry']
  const groceryList = categoryOrder
    .filter((c) => byCategory[c])
    .map((category) => ({ category, items: byCategory[category].sort((x, y) => x.name.localeCompare(y.name)) }))

  const prepTips = []
  const mainsUsed = [...new Set(days.flatMap((d) => d.meals.filter((m) => m.slot === 'lunch' || m.slot === 'dinner').map((m) => m.name)))]
  if (ctx.batch) {
    prepTips.push(`Sunday: cook ${mainsUsed.slice(0, 2).join(' and ')} for Monday-Thursday.`)
    if (mainsUsed.length > 2) prepTips.push(`Thursday: cook ${mainsUsed.slice(2, 4).join(' and ')} for Friday-Sunday.`)
    prepTips.push('Cooked meals keep 3-4 days in the fridge; freeze anything beyond that.')
  }
  if (days.some((d) => d.meals.some((m) => ['overnight_oats', 'chia_pudding', 'eggs_toast_pb', 'boiled_eggs_fruit'].includes(m.id)))) {
    prepTips.push('Make overnight oats or chia pudding the night before, and boil a batch of eggs at the start of the week.')
  }
  if (Object.keys(grams).some((id) => ['rice', 'quinoa'].includes(id))) {
    prepTips.push('Cook rice or quinoa in one big batch — it reheats well for 4 days.')
  }

  const notes = []
  if (ranked.main.relaxed || ranked.breakfast.relaxed || ranked.snack.relaxed) {
    notes.push('Few meals in the library fit every one of your filters, so some meals need a bit more cooking time or equipment than you selected.')
  }
  if (!kcalTarget && showNumbers) {
    notes.push('Portions are standard servings. Add your age, height and weight in Edit answers to scale them to your calorie target.')
  }
  if (ctx.diet === 'halal' || ctx.diet === 'kosher') {
    notes.push(`Buy ${ctx.diet}-certified meat and products.`)
  }

  return {
    showNumbers,
    targets: showNumbers ? { kcal: kcalTarget, protein: proteinRange } : null,
    slots,
    days,
    groceryList,
    prepTips,
    notes,
    disclaimer: 'Calories and protein are estimates from USDA nutrition data; brands and cooking change the real numbers. Not medical or dietary advice.',
  }
}
