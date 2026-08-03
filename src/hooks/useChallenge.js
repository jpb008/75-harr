import { useEffect, useMemo, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { newChallenge, reconcile, currentDayNumber, currentStreak, isDayComplete } from '../lib/challenge'
import { today } from '../lib/dates'

export function useChallenge() {
  const [challenge, setChallenge] = useState(() => loadJSON('challenge', null))
  const [days, setDays] = useState(() => loadJSON('days', {}))
  const [history, setHistory] = useState(() => loadJSON('history', []))
  const [justFinished, setJustFinished] = useState(false)

  // Reconcile once on mount (and whenever the challenge identity changes,
  // e.g. after starting a new one) to catch missed days and auto-reset.
  useEffect(() => {
    if (!challenge) return
    const result = reconcile(challenge, days, history)
    if (result.challenge?.id !== challenge.id || result.history.length !== history.length) {
      setChallenge(result.challenge)
      setHistory(result.history)
      if (result.justFinished) setJustFinished(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge?.id])

  useEffect(() => saveJSON('challenge', challenge), [challenge])
  useEffect(() => saveJSON('days', days), [days])
  useEffect(() => saveJSON('history', history), [history])

  const dayNumber = challenge ? currentDayNumber(challenge) : 0
  const streak = challenge ? currentStreak(challenge, days) : 0
  const todayStr = today()
  const todayRecord = days[todayStr] || { completedTaskIds: [] }
  const todayComplete = challenge ? isDayComplete(todayRecord, challenge.tasks) : false

  function toggleTask(taskId) {
    setDays((prev) => {
      const record = prev[todayStr] || { completedTaskIds: [] }
      const has = record.completedTaskIds.includes(taskId)
      const completedTaskIds = has
        ? record.completedTaskIds.filter((id) => id !== taskId)
        : [...record.completedTaskIds, taskId]
      return { ...prev, [todayStr]: { completedTaskIds } }
    })
  }

  function startNewChallenge(opts) {
    setJustFinished(false)
    setChallenge(newChallenge(opts))
  }

  function updateSettings({ name, lengthDays, tasks }) {
    setChallenge((prev) => (prev ? { ...prev, name, lengthDays, tasks } : prev))
  }

  function abandonAndRestart() {
    if (!challenge) return
    const attemptedDays = Math.max(0, currentDayNumber(challenge) - 1)
    setHistory((prev) => [
      ...prev,
      {
        id: challenge.id,
        name: challenge.name,
        startDate: challenge.startDate,
        endDate: todayStr,
        lengthDays: challenge.lengthDays,
        daysCompleted: attemptedDays,
        reason: 'reset',
      },
    ])
    setChallenge(newChallenge({ name: challenge.name, lengthDays: challenge.lengthDays, tasks: challenge.tasks }))
  }

  const dayNumberDisplay = useMemo(() => Math.min(dayNumber, challenge?.lengthDays ?? dayNumber), [dayNumber, challenge])

  return {
    challenge,
    days,
    history,
    justFinished,
    dismissFinished: () => setJustFinished(false),
    dayNumber: dayNumberDisplay,
    streak,
    todayRecord,
    todayComplete,
    toggleTask,
    startNewChallenge,
    updateSettings,
    abandonAndRestart,
  }
}
