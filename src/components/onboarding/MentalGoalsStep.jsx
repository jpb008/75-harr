import { useState } from 'react'

const FOCUS_AREAS = [
  { id: 'discipline', label: 'Discipline' },
  { id: 'confidence', label: 'Confidence' },
  { id: 'consistency', label: 'Consistency' },
  { id: 'mentalResilience', label: 'Mental resilience' },
  { id: 'reducingProcrastination', label: 'Reducing procrastination' },
  { id: 'improvingFocus', label: 'Improving focus' },
  { id: 'timeManagement', label: 'Time management' },
  { id: 'buildingHabits', label: 'Building better habits' },
  { id: 'reducingScreenTime', label: 'Reducing screen time' },
]

export default function MentalGoalsStep({ initial, onNext, onBack }) {
  const [focusAreas, setFocusAreas] = useState(initial.focusAreas ?? [])
  const [readingInterest, setReadingInterest] = useState(initial.readingInterest ?? true)
  const [journalingInterest, setJournalingInterest] = useState(initial.journalingInterest ?? false)
  const [screenTimeTargetHoursPerDay, setScreenTimeTargetHoursPerDay] = useState(initial.screenTimeTargetHoursPerDay ?? '')
  const [weaknessesFreeText, setWeaknessesFreeText] = useState(initial.weaknessesFreeText ?? '')

  const chipClass = (active) =>
    `rounded-full px-3 py-1.5 text-sm border transition-colors ${
      active ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-[var(--ink-900)] border-[var(--ink-700)] text-[var(--ink-300)]'
    }`
  const inputClass =
    'w-full rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] px-3 py-2 text-[var(--ink-50)] focus:outline-none focus:border-[var(--accent)] transition-colors'

  function toggle(value) {
    setFocusAreas((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  function submit() {
    onNext({
      focusAreas,
      readingInterest,
      journalingInterest,
      screenTimeTargetHoursPerDay: screenTimeTargetHoursPerDay === '' ? null : Number(screenTimeTargetHoursPerDay),
      weaknessesFreeText,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">What do you want to work on outside of fitness? (pick any)</label>
        <div className="flex gap-2 flex-wrap">
          {FOCUS_AREAS.map((f) => (
            <button key={f.id} type="button" onClick={() => toggle(f.id)} className={chipClass(focusAreas.includes(f.id))}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--ink-200)]">
          <input type="checkbox" checked={readingInterest} onChange={(e) => setReadingInterest(e.target.checked)} />
          Daily reading
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--ink-200)]">
          <input type="checkbox" checked={journalingInterest} onChange={(e) => setJournalingInterest(e.target.checked)} />
          Daily journaling
        </label>
      </div>

      {focusAreas.includes('reducingScreenTime') && (
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Target screen time per day (hours)</label>
          <input
            type="number"
            min={0}
            step={0.5}
            value={screenTimeTargetHoursPerDay}
            onChange={(e) => setScreenTimeTargetHoursPerDay(e.target.value)}
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">
          Anything you'd like to change about yourself? (optional — shown back to you, never used to pick tasks automatically)
        </label>
        <textarea
          value={weaknessesFreeText}
          onChange={(e) => setWeaknessesFreeText(e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 rounded-lg border border-[var(--ink-700)] text-[var(--ink-300)] py-2.5 hover:text-[var(--ink-50)] transition-colors">
          Back
        </button>
        <button onClick={submit} className="flex-1 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white font-medium py-2.5 transition-colors">
          Continue
        </button>
      </div>
    </div>
  )
}
