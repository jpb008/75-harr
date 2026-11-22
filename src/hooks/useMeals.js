import { useMemo } from 'react'
import { useStoredState } from './useStoredState'
import { generateMealPlan, nextSwapId } from '../lib/plan/mealPlan'
import { generateShoppingPlan } from '../lib/plan/shopping'
import { today, addDays, parseDateStr } from '../lib/dates'

// One meal plan for the whole app (Today card and Plan > Nutrition), with
// the user's swaps and eaten-meal check-offs, both synced to the account.
export function useMeals(plan, answers) {
  const [swaps, setSwaps] = useStoredState('mealSwaps', {})
  const [checks, setChecks] = useStoredState('mealChecks', {})

  const mealPlan = useMemo(() => {
    if (!plan || !answers) return null
    const trainingDays = [...new Set(plan.workout.sessions.map((s) => s.dayOfWeek))]
    return generateMealPlan(answers, trainingDays, swaps)
  }, [plan, answers, swaps])

  // Grocery list for this week (Monday start), with ticked items kept per week.
  const todayStr = today()
  const weekKey = addDays(todayStr, -((parseDateStr(todayStr).getDay() + 6) % 7))
  const shoppingPlan = useMemo(() => (mealPlan && answers ? generateShoppingPlan(mealPlan, answers, { weekKey }) : null), [mealPlan, answers, weekKey])
  const [groceryChecks, setGroceryChecks] = useStoredState('groceryChecks', {})
  function toggleGrocery(key) {
    setGroceryChecks((prev) => {
      // Keep only the current and previous weeks' ticks.
      const next = Object.fromEntries(Object.entries(prev).filter(([k]) => k >= addDays(weekKey, -7)))
      const set = new Set(next[weekKey] ?? [])
      if (set.has(key)) set.delete(key)
      else set.add(key)
      next[weekKey] = [...set]
      return next
    })
  }
  function clearGroceries(keys) {
    setGroceryChecks((prev) => ({ ...prev, [weekKey]: (prev[weekKey] ?? []).filter((k) => !keys.includes(k)) }))
  }

  function swap(dayOfWeek, slotIndex) {
    const next = nextSwapId(mealPlan, dayOfWeek, slotIndex)
    if (next) setSwaps((prev) => ({ ...prev, [`${dayOfWeek}-${slotIndex}`]: next }))
  }

  function resetSwap(dayOfWeek, slotIndex) {
    setSwaps((prev) => {
      const next = { ...prev }
      delete next[`${dayOfWeek}-${slotIndex}`]
      return next
    })
  }

  // checks: { "YYYY-MM-DD": ["0", "2", "addon"] } — meal positions eaten that day.
  function toggleCheck(dateStr, key) {
    setChecks((prev) => {
      const day = new Set(prev[dateStr] ?? [])
      if (day.has(key)) day.delete(key)
      else day.add(key)
      return { ...prev, [dateStr]: [...day] }
    })
  }

  return {
    shoppingPlan,
    groceryChecked: new Set(groceryChecks[weekKey] ?? []),
    toggleGrocery,
    clearGroceries,
    mealPlan, swaps, swap, resetSwap, checks, toggleCheck, canSwap: (dow, idx) => Boolean(mealPlan && nextSwapId(mealPlan, dow, idx)) }
}

export function mealCheckKey(meal) {
  return meal.addOn ? 'addon' : String(meal.slotIndex)
}
