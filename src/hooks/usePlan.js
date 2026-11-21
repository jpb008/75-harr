import { useEffect, useState } from 'react'
import { apiFetch, apiConfigured } from '../lib/api'
import { generatePlan } from '../lib/plan/generatePlan'
import { loadJSON, saveJSON } from '../lib/storage'

export function usePlan(token) {
  const [plan, setPlan] = useState(() => loadJSON('plan', null))
  const [answers, setAnswers] = useState(() => loadJSON('planAnswers', null))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !apiConfigured()) {
      setLoading(false)
      return
    }
    apiFetch('/plan', { method: 'GET', token })
      .then(({ answers: serverAnswers, plan: serverPlan }) => {
        setAnswers(serverAnswers)
        setPlan(serverPlan)
        saveJSON('plan', serverPlan)
        saveJSON('planAnswers', serverAnswers)
      })
      .catch(() => {
        // 404 (no plan yet) or offline — keep whatever's cached locally
      })
      .finally(() => setLoading(false))
  }, [token])

  async function savePlan(newAnswers, { source = 'onboarding' } = {}) {
    const newPlan = generatePlan(newAnswers)
    setAnswers(newAnswers)
    setPlan(newPlan)
    saveJSON('plan', newPlan)
    saveJSON('planAnswers', newAnswers)

    if (token && apiConfigured()) {
      try {
        await apiFetch('/plan', { method: 'POST', token, body: { answers: newAnswers, plan: newPlan, source } })
      } catch {
        // offline — local cache already has it; next load will retry the GET
      }
    }
    return newPlan
  }

  return { plan, answers, hasPlan: Boolean(plan), loading, savePlan }
}
