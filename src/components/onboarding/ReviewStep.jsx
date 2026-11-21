import { useState } from 'react'

const TIERS = [
  { id: 'beginner', label: 'Beginner / Moderate' },
  { id: 'intermediate', label: 'Intermediate / Challenging' },
  { id: 'advanced', label: 'Advanced / High Intensity' },
]

export default function ReviewStep({ answers, onSubmit, onBack, submitting }) {
  const [intensityTier, setIntensityTier] = useState('beginner')

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">Choose your training intensity</label>
        <div className="space-y-2">
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setIntensityTier(t.id)}
              className={`w-full text-left rounded-lg border px-4 py-3 transition-colors ${
                intensityTier === t.id ? 'border-[var(--accent)] bg-[var(--accent-a10)]' : 'border-[var(--ink-700)] bg-[var(--ink-900)]'
              }`}
            >
              <span className="text-[var(--ink-50)] font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-[var(--ink-700)] bg-[var(--ink-900)] p-4 text-sm text-[var(--ink-300)] space-y-1">
        <p>Fitness goals: {answers.fitnessGoals.primary?.join(', ') || 'none selected'}</p>
        <p>Mental focus: {answers.mentalGoals.focusAreas?.join(', ') || 'none selected'}</p>
        <p>Financial interests: {answers.financialGoals.interests?.join(', ') || 'none selected'}</p>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 rounded-lg border border-[var(--ink-700)] text-[var(--ink-300)] py-2.5 hover:text-[var(--ink-50)] transition-colors">
          Back
        </button>
        <button
          onClick={() => onSubmit(intensityTier)}
          disabled={submitting}
          className="flex-1 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-strong)] disabled:opacity-60 text-white font-medium py-2.5 transition-colors"
        >
          {submitting ? 'Building your plan…' : 'Build my plan'}
        </button>
      </div>
    </div>
  )
}
