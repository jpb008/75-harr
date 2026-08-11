import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'

// Flattens any goals saved under the old week-grouped shape ({ [week]:
// [...] }) into a plain list, so nobody loses goals they already set.
function loadInitialGoals() {
  const flat = loadJSON('goals', null)
  if (flat) return flat

  const byWeek = loadJSON('weeklyGoals', null)
  if (byWeek) {
    return Object.values(byWeek).flat()
  }

  return []
}

export function useGoals() {
  const [goals, setGoals] = useState(loadInitialGoals)

  useEffect(() => saveJSON('goals', goals), [goals])

  function addGoal(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    setGoals((prev) => [...prev, { id: crypto.randomUUID(), text: trimmed, done: false }])
  }

  function toggleGoal(id) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g)))
  }

  function removeGoal(id) {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return { goals, addGoal, toggleGoal, removeGoal }
}
