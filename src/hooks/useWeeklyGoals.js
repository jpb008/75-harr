import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { weekNumberForDay } from '../lib/weeklyGoals'

export function useWeeklyGoals(dayNumber) {
  const [goalsByWeek, setGoalsByWeek] = useState(() => loadJSON('weeklyGoals', {}))
  const currentWeek = weekNumberForDay(dayNumber)

  useEffect(() => saveJSON('weeklyGoals', goalsByWeek), [goalsByWeek])

  const currentGoals = goalsByWeek[currentWeek] || []

  function addGoal(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    setGoalsByWeek((prev) => ({
      ...prev,
      [currentWeek]: [...(prev[currentWeek] || []), { id: crypto.randomUUID(), text: trimmed, done: false }],
    }))
  }

  function toggleGoal(id) {
    setGoalsByWeek((prev) => ({
      ...prev,
      [currentWeek]: (prev[currentWeek] || []).map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
    }))
  }

  function removeGoal(id) {
    setGoalsByWeek((prev) => ({
      ...prev,
      [currentWeek]: (prev[currentWeek] || []).filter((g) => g.id !== id),
    }))
  }

  const pastWeeks = Object.keys(goalsByWeek)
    .map(Number)
    .filter((w) => w < currentWeek && goalsByWeek[w]?.length)
    .sort((a, b) => b - a)
    .map((w) => ({ week: w, goals: goalsByWeek[w] }))

  return { currentWeek, currentGoals, addGoal, toggleGoal, removeGoal, pastWeeks }
}
