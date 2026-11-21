import { useState } from 'react'
import PersonalInfoStep from './PersonalInfoStep'
import FitnessGoalsStep from './FitnessGoalsStep'
import MentalGoalsStep from './MentalGoalsStep'
import FinancialGoalsStep from './FinancialGoalsStep'
import ReviewStep from './ReviewStep'

const STEPS = ['personal', 'fitness', 'mental', 'financial', 'review']

export default function OnboardingFlow({ onComplete }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({ personal: {}, fitnessGoals: {}, mentalGoals: {}, financialGoals: {} })
  const [submitting, setSubmitting] = useState(false)

  const step = STEPS[stepIndex]

  function next(section, data) {
    setAnswers((prev) => ({ ...prev, [section]: data }))
    setStepIndex((i) => i + 1)
  }
  function back() {
    setStepIndex((i) => Math.max(0, i - 1))
  }

  async function submit(intensityTier) {
    setSubmitting(true)
    const safeMode = Boolean(
      answers.personal.isUnder18 || answers.personal.isPregnant || answers.personal.hasDisorderedEatingHistory
    )
    const finalAnswers = {
      ...answers,
      meta: { intensityTier, completedAt: new Date().toISOString(), safeMode },
    }
    try {
      await onComplete(finalAnswers)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <p className="font-display text-lg text-[var(--accent-light)] tracking-wide">
        75<span className="text-[var(--ink-100)]">HARD</span>
      </p>
      <h1 className="font-display text-5xl leading-none text-[var(--ink-50)] mt-1 mb-2">Let's build your plan</h1>
      <p className="text-[var(--ink-300)] text-sm mb-6">
        Step {stepIndex + 1} of {STEPS.length}
      </p>

      {step === 'personal' && <PersonalInfoStep initial={answers.personal} onNext={(d) => next('personal', d)} />}
      {step === 'fitness' && (
        <FitnessGoalsStep
          initial={answers.fitnessGoals}
          weightKg={answers.personal.weightKg}
          onNext={(d) => next('fitnessGoals', d)}
          onBack={back}
        />
      )}
      {step === 'mental' && (
        <MentalGoalsStep initial={answers.mentalGoals} onNext={(d) => next('mentalGoals', d)} onBack={back} />
      )}
      {step === 'financial' && (
        <FinancialGoalsStep initial={answers.financialGoals} onNext={(d) => next('financialGoals', d)} onBack={back} />
      )}
      {step === 'review' && <ReviewStep answers={answers} onSubmit={submit} onBack={back} submitting={submitting} />}
    </div>
  )
}
