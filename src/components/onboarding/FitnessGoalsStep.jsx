import { useState } from 'react'

const GOALS = [
  { id: 'muscleGain', label: 'Build muscle' },
  { id: 'fatLoss', label: 'Lose body fat' },
  { id: 'strength', label: 'Get stronger' },
  { id: 'endurance', label: 'Improve cardio endurance' },
  { id: 'athleticPerformance', label: 'Improve athletic performance' },
  { id: 'mobility', label: 'Improve flexibility/mobility' },
  { id: 'generalHealth', label: 'General health & consistency' },
]

export default function FitnessGoalsStep({ initial, weightKg, onNext, onBack }) {
  const [primary, setPrimary] = useState(initial.primary ?? [])
  const [currentWeightKg, setCurrentWeightKg] = useState(initial.fatLoss?.currentWeightKg ?? weightKg ?? '')
  const [targetWeightKg, setTargetWeightKg] = useState(initial.fatLoss?.targetWeightKg ?? '')

  const chipClass = (active) =>
    `rounded-full px-3 py-1.5 text-sm border transition-colors ${
      active ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-[var(--ink-900)] border-[var(--ink-700)] text-[var(--ink-300)]'
    }`
  const inputClass =
    'w-full rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] px-3 py-2 text-[var(--ink-50)] focus:outline-none focus:border-[var(--accent)] transition-colors'

  function toggle(value) {
    setPrimary((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  function submit() {
    onNext({
      primary,
      fatLoss: primary.includes('fatLoss')
        ? { currentWeightKg: currentWeightKg === '' ? null : Number(currentWeightKg), targetWeightKg: targetWeightKg === '' ? null : Number(targetWeightKg) }
        : undefined,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">What do you want to achieve physically? (pick any)</label>
        <div className="flex gap-2 flex-wrap">
          {GOALS.map((g) => (
            <button key={g.id} type="button" onClick={() => toggle(g.id)} className={chipClass(primary.includes(g.id))}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {primary.includes('fatLoss') && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[var(--ink-300)] mb-1.5">Current weight (kg)</label>
            <input type="number" value={currentWeightKg} onChange={(e) => setCurrentWeightKg(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-[var(--ink-300)] mb-1.5">Target weight (kg)</label>
            <input type="number" value={targetWeightKg} onChange={(e) => setTargetWeightKg(e.target.value)} className={inputClass} />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 rounded-lg border border-[var(--ink-700)] text-[var(--ink-300)] py-2.5 hover:text-[var(--ink-50)] transition-colors">
          Back
        </button>
        <button
          onClick={submit}
          disabled={primary.length === 0}
          className="flex-1 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-strong)] disabled:opacity-50 text-white font-medium py-2.5 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
