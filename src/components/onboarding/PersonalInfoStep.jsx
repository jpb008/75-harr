import { useState } from 'react'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const EQUIPMENT_OPTIONS = [
  { id: 'dumbbell', label: 'Dumbbells' },
  { id: 'barbell', label: 'Barbell' },
  { id: 'machine', label: 'Gym machines' },
  { id: 'bands', label: 'Resistance bands' },
]
const INJURY_OPTIONS = [
  { id: 'low_back', label: 'Lower back' },
  { id: 'knee', label: 'Knee' },
  { id: 'shoulder', label: 'Shoulder' },
]

export default function PersonalInfoStep({ initial, onNext }) {
  const [age, setAge] = useState(initial.age ?? '')
  const [weightKg, setWeightKg] = useState(initial.weightKg ?? '')
  const [fitnessLevel, setFitnessLevel] = useState(initial.fitnessLevel ?? 'beginner')
  const [days, setDays] = useState(initial.weeklyScheduleAvailableDays ?? [1, 3, 5])
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState(initial.preferredTimeOfDay ?? 'morning')
  const [equipment, setEquipment] = useState(initial.equipment ?? [])
  const [injuries, setInjuries] = useState(initial.injuries ?? [])
  const [injuryNotes, setInjuryNotes] = useState(initial.injuryNotes ?? '')
  const [wakeTime, setWakeTime] = useState(initial.wakeTime ?? '07:00')
  const [bedTime, setBedTime] = useState(initial.bedTime ?? '22:30')
  const [isUnder18, setIsUnder18] = useState(initial.isUnder18 ?? false)
  const [isPregnant, setIsPregnant] = useState(initial.isPregnant ?? false)
  const [hasDisorderedEatingHistory, setHasDisorderedEatingHistory] = useState(initial.hasDisorderedEatingHistory ?? false)

  const inputClass =
    'w-full rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] px-3 py-2 text-[var(--ink-50)] focus:outline-none focus:border-[var(--accent)] transition-colors'
  const chipClass = (active) =>
    `rounded-full px-3 py-1.5 text-sm border transition-colors ${
      active ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-[var(--ink-900)] border-[var(--ink-700)] text-[var(--ink-300)]'
    }`

  function toggle(list, setList, value) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  function submit() {
    onNext({
      age: age === '' ? null : Number(age),
      weightKg: weightKg === '' ? null : Number(weightKg),
      fitnessLevel,
      weeklyScheduleAvailableDays: days,
      preferredTimeOfDay,
      equipment,
      injuries,
      injuryNotes,
      wakeTime,
      bedTime,
      isUnder18,
      isPregnant,
      hasDisorderedEatingHistory,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Age</label>
          <input type="number" min={13} value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Weight in kg (optional)</label>
          <input type="number" min={0} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">Current fitness level</label>
        <select value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)} className={inputClass}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">Which days can you train?</label>
        <div className="flex gap-2 flex-wrap">
          {WEEKDAYS.map((label, i) => (
            <button key={i} type="button" onClick={() => toggle(days, setDays, i)} className={chipClass(days.includes(i))}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">Preferred time of day to train</label>
        <div className="flex gap-2">
          {['morning', 'afternoon', 'evening'].map((t) => (
            <button key={t} type="button" onClick={() => setPreferredTimeOfDay(t)} className={`capitalize ${chipClass(preferredTimeOfDay === t)}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Wake-up time</label>
          <input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Bedtime</label>
          <input type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">Equipment you have access to (leave blank for bodyweight-only)</label>
        <div className="flex gap-2 flex-wrap">
          {EQUIPMENT_OPTIONS.map((opt) => (
            <button key={opt.id} type="button" onClick={() => toggle(equipment, setEquipment, opt.id)} className={chipClass(equipment.includes(opt.id))}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">Any injuries or physical limitations?</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {INJURY_OPTIONS.map((opt) => (
            <button key={opt.id} type="button" onClick={() => toggle(injuries, setInjuries, opt.id)} className={chipClass(injuries.includes(opt.id))}>
              {opt.label}
            </button>
          ))}
        </div>
        <input
          value={injuryNotes}
          onChange={(e) => setInjuryNotes(e.target.value)}
          placeholder="Anything else worth knowing (optional) — shown back to you, not used to pick exercises automatically."
          className={`text-sm placeholder:text-[var(--ink-400)] ${inputClass}`}
        />
      </div>

      <div className="rounded-lg border border-[var(--ink-700)] bg-[var(--ink-900)] p-4 space-y-2">
        <p className="text-xs text-[var(--ink-400)]">
          A couple of questions so we can give you appropriate guidance — answers are private to you.
        </p>
        <label className="flex items-center gap-2 text-sm text-[var(--ink-200)]">
          <input type="checkbox" checked={isUnder18} onChange={(e) => setIsUnder18(e.target.checked)} />
          I'm under 18
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--ink-200)]">
          <input type="checkbox" checked={isPregnant} onChange={(e) => setIsPregnant(e.target.checked)} />
          I'm currently pregnant
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--ink-200)]">
          <input type="checkbox" checked={hasDisorderedEatingHistory} onChange={(e) => setHasDisorderedEatingHistory(e.target.checked)} />
          I have a history of disordered eating
        </label>
      </div>

      <button
        onClick={submit}
        className="w-full rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white font-medium py-2.5 transition-colors"
      >
        Continue
      </button>
    </div>
  )
}
