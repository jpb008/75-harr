import { useMemo } from 'react'
import { useStoredState } from './useStoredState'
import { generateMealPlan, nextSwapId } from '../lib/plan/mealPlan'

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

  return { mealPlan, swaps, swap, resetSwap, checks, toggleCheck, canSwap: (dow, idx) => Boolean(mealPlan && nextSwapId(mealPlan, dow, idx)) }
}

export function mealCheckKey(meal) {
  return meal.addOn ? 'addon' : String(meal.slotIndex)
}
