import { useEffect, useState } from 'react'
import { apiFetch, apiConfigured } from '../lib/api'
import { generatePlan, ENGINE_VERSION } from '../lib/plan/generatePlan'
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

  // Plans built by an older version of the engine are rebuilt from the
  // user's SAME saved answers once loading settles, so existing users get
  // the full routine/library without re-entering anything. Their goals
  // and intensity are untouched — only the plan generator improved.
  useEffect(() => {
    if (loading || !plan || !answers) return
    if ((plan.engineVersion ?? 1) < ENGINE_VERSION) savePlan(answers, { source: 'engine_upgrade' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, plan, answers])

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
