import OnboardingFlow from './onboarding/OnboardingFlow'

// Reuses the same onboarding steps, pre-filled with the current answers —
// editing and generating a plan both go through the exact same
// deterministic engine, so there's only one code path to trust.
export default function PlanSettingsView({ plan, onDone }) {
  if (!plan.answers) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center text-[var(--ink-300)] text-sm">
        No plan yet — complete onboarding first.
      </div>
    )
  }

  return (
    <OnboardingFlow
      initialAnswers={plan.answers}
      title="Edit your plan"
      onComplete={async (answers) => {
        await plan.savePlan(answers, { source: 'manual_edit' })
        onDone()
      }}
    />
  )
}
