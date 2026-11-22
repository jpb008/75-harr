import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { normalizeAnswers, QUESTIONNAIRE_VERSION } from '../../lib/plan/normalizeAnswers'
import { Button } from '../ui'
import AboutStep from './AboutStep'
import HealthStep from './HealthStep'
import FoodStep from './FoodStep'
import TrainingBackgroundStep from './TrainingBackgroundStep'
import ScheduleStep from './ScheduleStep'
import FitnessGoalsStep from './FitnessGoalsStep'
import MentalGoalsStep from './MentalGoalsStep'
import FinancialGoalsStep from './FinancialGoalsStep'
import LearningStep from './LearningStep'
import ReviewStep from './ReviewStep'

const STEPS = [
  { id: 'about', title: 'About you', subtitle: 'The basics we use to size your plan.', Component: AboutStep },
  { id: 'health', title: 'Sleep, stress & health', subtitle: 'Recovery shapes how hard your plan should push.', Component: HealthStep },
  { id: 'food', title: 'Food preferences', subtitle: 'So nutrition tips fit how you actually eat.', Component: FoodStep },
  { id: 'background', title: 'Training background', subtitle: 'A quick fitness check so we start at the right level.', Component: TrainingBackgroundStep },
  { id: 'schedule', title: 'Schedule & equipment', subtitle: 'Your routine is built around the time and gear you have.', Component: ScheduleStep },
  {
    id: 'fitness',
    title: 'Fitness goals',
    subtitle: 'What you want to achieve, and what has gotten in the way before.',
    Component: FitnessGoalsStep,
    canContinue: (a) => a.fitnessGoals.primary.length > 0,
    blockedHint: 'Pick at least one fitness goal to continue.',
  },
  { id: 'mind', title: 'Mind & habits', subtitle: 'The personal-development side of your plan.', Component: MentalGoalsStep },
  { id: 'money', title: 'Money & career', subtitle: 'Optional — skip it if you only want fitness and habits.', Component: FinancialGoalsStep },
  { id: 'learning', title: 'How you like to learn', subtitle: 'We use this to pick sources for your learning library.', Component: LearningStep },
  { id: 'review', title: 'Review & intensity', subtitle: 'Check your answers and choose how hard to start.', Component: ReviewStep },
]

export default function OnboardingFlow({ onComplete, initialAnswers, title = "Let's build your plan", onCancel }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState(() => normalizeAnswers(initialAnswers))
  const [intensityTier, setIntensityTier] = useState(initialAnswers?.meta?.intensityTier ?? null)
  const [submitting, setSubmitting] = useState(false)
  const topRef = useRef(null)

  const step = STEPS[stepIndex]
  const isLast = stepIndex === STEPS.length - 1
  const canContinue = step.canContinue ? step.canContinue(answers) : true

  useEffect(() => {
    topRef.current?.scrollIntoView({ block: 'start' })
    window.scrollTo({ top: 0 })
  }, [stepIndex])

  function update(section, patch) {
    setAnswers((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }))
  }

  async function submit() {
    setSubmitting(true)
    const p = answers.personal
    const finalAnswers = {
      ...answers,
      meta: {
        intensityTier: intensityTier ?? 'beginner',
        completedAt: new Date().toISOString(),
        safeMode: Boolean(p.isUnder18 || (p.age != null && p.age < 18) || p.isPregnant || p.hasDisorderedEatingHistory),
        questionnaireVersion: QUESTIONNAIRE_VERSION,
      },
    }
    try {
      await onComplete(finalAnswers)
    } finally {
      setSubmitting(false)
    }
  }

  const progress = (stepIndex + 1) / STEPS.length
  const StepComponent = step.Component

  return (
    <div className="min-h-screen pb-32" ref={topRef}>
      <div className="sticky top-0 z-40 bg-[var(--ink-950)]/85 backdrop-blur-md border-b border-[var(--ink-800)]">
        <div className="max-w-xl mx-auto px-4 pt-3 pb-3">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="font-display text-lg text-[var(--accent-light)] tracking-wide">
              75<span className="text-[var(--ink-100)]">HARD</span>
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--ink-300)] tabular-nums">
                Step {stepIndex + 1} of {STEPS.length}
              </span>
              {onCancel && (
                <button type="button" onClick={onCancel} className="text-xs text-[var(--ink-300)] hover:text-[var(--ink-50)]">
                  Cancel
                </button>
              )}
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--ink-800)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent-light)] transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 pt-6">
        {stepIndex === 0 && (
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-a15)] text-[var(--accent-light)] text-xs font-medium px-2.5 py-1 mb-3">
              <Sparkles size={13} /> Personalized from your answers
            </div>
            <h1 className="font-display text-5xl leading-none text-[var(--ink-50)]">{title}</h1>
            <p className="text-[var(--ink-300)] text-sm mt-3 leading-relaxed">
              The more detail you give, the more tailored your workouts, nutrition, habits and learning library become. Most
              questions are optional — skip anything you'd rather not answer.
            </p>
          </div>
        )}

        <div key={step.id} className="animate-fade-in">
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--accent-light)] font-semibold">{step.title}</p>
          <p className="text-sm text-[var(--ink-300)] mt-1 mb-5">{step.subtitle}</p>
          <StepComponent answers={answers} update={update} intensityTier={intensityTier} setIntensityTier={setIntensityTier} />
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--ink-950)] backdrop-blur-md border-t border-[var(--ink-800)] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-xl mx-auto px-4 py-3">
          {!canContinue && step.blockedHint && <p className="text-xs text-[var(--danger)] mb-2 text-center">{step.blockedHint}</p>}
          <div className="flex gap-3">
            {stepIndex > 0 && (
              <Button variant="secondary" onClick={() => setStepIndex((i) => i - 1)} className="flex-1">
                <ArrowLeft size={16} /> Back
              </Button>
            )}
            {isLast ? (
              <Button onClick={submit} disabled={submitting || !intensityTier} className="flex-[2]">
                {submitting ? 'Building your plan…' : 'Build my plan'} <Sparkles size={16} />
              </Button>
            ) : (
              <Button onClick={() => setStepIndex((i) => i + 1)} disabled={!canContinue} className="flex-[2]">
                Continue <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
