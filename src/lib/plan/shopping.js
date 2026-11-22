import { INGREDIENTS } from './foodLibrary'
import { amountText } from './mealPlan'
import { normalizeAnswers } from './normalizeAnswers'
import { PRICE_SOURCES, BUY_OPTIONS, STORE_TIPS, SAVING_TIPS, KEEPS, FROZEN_SWAP, KEEP_TIPS } from './groceryPrices'

// Turns the 7-day meal plan into shopping trips that match how often the
// user shops, with what to buy (rounded to real package sizes), an
// estimated cost from official average prices, and cheaper-store advice.

const LB = 453.6
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const CATEGORY_ORDER = ['Produce', 'Protein', 'Dairy', 'Dairy alternatives', 'Deli', 'Bakery', 'Frozen', 'Pantry']

// Which plan days (dayOfWeek) each trip buys for. Twice a week splits
// fresh food into Mon-Thu and Fri-Sun; every two weeks doubles the week.
export function tripsFor(frequency) {
  if (frequency === 'twice') {
    return [
      { id: 'a', label: 'Trip 1', covers: 'Mon–Thu', days: [1, 2, 3, 4], weeks: 1 },
      { id: 'b', label: 'Trip 2', covers: 'Fri–Sun', days: [5, 6, 0], weeks: 1 },
    ]
  }
  if (frequency === 'biweekly') return [{ id: 'a', label: 'Big shop', covers: '2 weeks', days: [1, 2, 3, 4, 5, 6, 0], weeks: 2 }]
  return [{ id: 'a', label: 'Weekly shop', covers: 'Mon–Sun', days: [1, 2, 3, 4, 5, 6, 0], weeks: 1 }]
}

// Long-life food is bought all at once on the first trip of the week.
function isLongLife(id) {
  const keeps = KEEPS[id]
  return !keeps || keeps[0] >= 7
}

// Leftovers from an earlier trip's package count toward the next trip if
// the food keeps that long or can be frozen.
function carries(id) {
  const keeps = KEEPS[id]
  return !keeps || keeps[0] >= 7 || keeps[1]
}

function money(n, src) {
  return `${src.symbol}${n.toFixed(2)}`
}

// Best way to buy `needed` grams: the cheapest option that covers it,
// preferring big packs for bulk shoppers and canned over dry for people
// with little time to cook.
function chooseBuy(id, needed, ctx) {
  const options = BUY_OPTIONS[ctx.country]?.[id]
  if (!options?.length) return null
  const priced = options
    .filter((o) => !(o.needsCooking && ctx.quickOnly && options.some((x) => !x.needsCooking)))
    .filter((o) => !(ctx.preferFrozen && o.fresh && options.some((x) => !x.fresh)))
    .map((o) => {
      if (o.kind === 'pack') {
        const count = Math.max(1, Math.ceil(needed / o.size - 0.05))
        return { option: o, count, cost: count * o.price, text: `${count} × ${o.label}` }
      }
      const unitGrams = o.per === 'lb' ? LB : 1000
      const step = o.per === 'lb' ? 0.5 : 0.25
      const raw = needed / (o.yield ?? 1) / unitGrams
      const qty = Math.max(step, Math.ceil(raw / step - 0.05) * step)
      return { option: o, count: qty, cost: qty * o.price, text: `about ${qty} ${o.per} ${o.label}` }
    })
  if (!priced.length) return null
  const sorted = [...priced].sort((a, b) => a.cost - b.cost)
  let best = sorted[0]
  // Bulk shoppers take the biggest pack if it costs less per gram.
  if (ctx.style === 'bulk') {
    const perGram = (p) => p.option.price / (p.option.kind === 'pack' ? p.option.size : ((p.option.per === 'lb' ? LB : 1000) * (p.option.yield ?? 1)))
    best = [...priced].sort((a, b) => perGram(a) - perGram(b))[0]
  }
  const alt = sorted.find((p) => p !== best && p.option.needsCooking !== best.option.needsCooking)
  return { ...best, alt }
}

export function generateShoppingPlan(mealPlan, rawAnswers, { weekKey = null } = {}) {
  const a = normalizeAnswers(rawAnswers)
  const p = a.personal
  const country = p.country === 'us' || p.country === 'ca' ? p.country : 'other'
  const source = PRICE_SOURCES[country] ?? null
  const ctx = {
    country,
    style: p.shoppingStyle,
    quickOnly: p.cookingTime === 'minimal' || p.kitchenAccess !== 'full',
  }
  const frequency = p.shoppingFrequency
  const trips = tripsFor(frequency)

  // Grams (or ml) of each ingredient used on each day of the week.
  const perDay = {}
  for (const day of mealPlan.days) {
    for (const meal of day.meals) {
      for (const ing of meal.ingredients) {
        perDay[ing.id] ??= {}
        perDay[ing.id][day.dayOfWeek] = (perDay[ing.id][day.dayOfWeek] ?? 0) + ing.grams
      }
    }
  }

  const leftover = {}
  const builtTrips = trips.map((trip, tripIndex) => {
    const items = []
    for (const [id, byDay] of Object.entries(perDay)) {
      const ing = INGREDIENTS[id]
      if (!ing) continue
      // Long-life food: everything on the first trip of the week.
      const days = isLongLife(id) ? (tripIndex === 0 ? [0, 1, 2, 3, 4, 5, 6] : []) : trip.days
      const fullNeed = days.reduce((sum, d) => sum + (byDay[d] ?? 0), 0) * trip.weeks
      const carried = carries(id) ? Math.min(leftover[id] ?? 0, fullNeed) : 0
      const needed = fullNeed - carried
      leftover[id] = (leftover[id] ?? 0) - carried
      if (needed <= 1) continue

      // Fresh food that won't last the trip: switch to frozen, freeze, or top up.
      const coverDays = trip.weeks * 7 * (trip.days.length / 7)
      const keeps = KEEPS[id]
      let keepNote = null
      let useFrozen = false
      if (keeps && keeps[0] < coverDays) {
        if (FROZEN_SWAP[id]) {
          useFrozen = true
          keepNote = `Fresh only keeps ~${keeps[0]} days, so buy ${FROZEN_SWAP[id]} for this trip.`
        } else if (keeps[1]) {
          keepNote = `Keeps ~${keeps[0]} days in the fridge: freeze what you'll use after that and thaw it the night before.`
        } else if (KEEP_TIPS[id] && trip.weeks === 1) {
          keepNote = KEEP_TIPS[id]
        } else {
          keepNote = `Keeps ~${keeps[0]} days: buy part now and top up partway through, or swap the meal.`
        }
      }

      const finalBuy = chooseBuy(id, needed, { ...ctx, preferFrozen: useFrozen })
      if (finalBuy?.option.kind === 'pack') leftover[id] = (leftover[id] ?? 0) + finalBuy.count * finalBuy.option.size - needed

      let tip = finalBuy?.option.note ?? SAVING_TIPS[id] ?? null
      if (finalBuy?.alt && source) {
        const dry = finalBuy.option.needsCooking ? finalBuy : finalBuy.alt
        const canned = finalBuy.option.needsCooking ? finalBuy.alt : finalBuy
        if (dry.cost < canned.cost) {
          tip = finalBuy.option.needsCooking
            ? `Dry is cheapest (${money(dry.cost, source)} vs ${money(canned.cost, source)} canned). Soak overnight and cook a batch, or buy canned to save time.`
            : `Canned is quickest. Dry costs about ${money(dry.cost, source)} instead of ${money(canned.cost, source)} if you have time to cook a batch.`
        }
      }

      items.push({
        id,
        key: `${weekKey ?? 'week'}-${trip.id}-${id}`,
        name: finalBuy?.option.swapName ?? (useFrozen && FROZEN_SWAP[id] ? capitalize(FROZEN_SWAP[id]) : ing.name),
        category: useFrozen ? 'Frozen' : ing.category,
        needText: amountText(id, needed, p.units),
        buyText: finalBuy?.text ?? null,
        cost: finalBuy && source ? finalBuy.cost : null,
        tip,
        keepNote,
      })
    }
    const groups = CATEGORY_ORDER.map((category) => ({
      category,
      items: items.filter((i) => i.category === category).sort((x, y) => x.name.localeCompare(y.name)),
    })).filter((g) => g.items.length)
    const priced = items.filter((i) => i.cost != null)
    return {
      ...trip,
      coversText: trip.weeks === 2 ? 'Covers 2 weeks of meals' : `Covers ${trip.covers}`,
      groups,
      itemCount: items.length,
      total: priced.reduce((s, i) => s + i.cost, 0),
      pricedCount: priced.length,
      unpricedCount: items.length - priced.length,
    }
  })

  const stores = STORE_TIPS[country]
  const storeAdvice =
    p.shoppingStyle === 'bulk'
      ? `Big packs of rice, oats, frozen fruit and veg, meat and eggs are cheapest at ${stores.bulk.join(' or ')}. Get fresh produce at ${stores.discount.slice(0, 2).join(' or ')}.`
      : p.shoppingStyle === 'closest'
        ? `At whatever store is closest, pick the store brand and check the per-kg price on the shelf tag. When you're near one, ${stores.discount.slice(0, 3).join(', ')} are usually cheaper.`
        : `For the lowest prices, try ${stores.discount.slice(0, 4).join(', ')}.`

  return {
    frequency,
    trips: builtTrips,
    currency: source?.currency ?? null,
    symbol: source?.symbol ?? '',
    source,
    stores,
    storeAdvice,
    brandTip: stores.brands,
    tips: [
      'Check the store\'s weekly flyer (or a flyer app) before you go and swap to whichever protein is on sale.',
      'Compare the unit price (per kg or per 100 g) on the shelf tag, not the sticker price.',
      p.groceryBudget === 'tight' ? 'On a tight budget, rice, oats, eggs, dry lentils and beans, bananas and frozen veg give the most food per dollar.' : null,
    ].filter(Boolean),
  }
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function shoppingListText(plan, trip) {
  const lines = [`${trip.label} (${trip.coversText.toLowerCase()})`]
  for (const g of trip.groups) {
    lines.push('', g.category.toUpperCase())
    for (const i of g.items) lines.push(`- ${i.name}: ${i.buyText ?? i.needText}`)
  }
  if (plan.source && trip.pricedCount) lines.push('', `Estimated: ${plan.symbol}${trip.total.toFixed(2)} ${plan.currency} (${trip.pricedCount} of ${trip.itemCount} items priced)`)
  return lines.join('\n')
}

export { DAY_SHORT }
