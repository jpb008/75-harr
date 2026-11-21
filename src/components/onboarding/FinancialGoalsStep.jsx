import { useState } from 'react'

const INTERESTS = [
  { id: 'freelancing', label: 'Freelancing' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'contentCreation', label: 'Content creation' },
  { id: 'affiliateMarketing', label: 'Affiliate marketing' },
  { id: 'investing', label: 'Investing' },
  { id: 'skillBuilding', label: 'Building a skill for a raise/new role' },
]

function parseCsv(text) {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function FinancialGoalsStep({ initial, onNext, onBack }) {
  const [employmentStatus, setEmploymentStatus] = useState(initial.employmentStatus ?? 'employed')
  const [currentMonthlyIncome, setCurrentMonthlyIncome] = useState(initial.currentMonthlyIncome ?? '')
  const [targetMonthlyIncome, setTargetMonthlyIncome] = useState(initial.targetMonthlyIncome ?? '')
  const [targetDate, setTargetDate] = useState(initial.targetDate ? initial.targetDate.slice(0, 10) : '')
  const [hoursPerWeekAvailable, setHoursPerWeekAvailable] = useState(initial.hoursPerWeekAvailable ?? '')
  const [interests, setInterests] = useState(initial.interests ?? [])
  const [currentSkills, setCurrentSkills] = useState((initial.currentSkills ?? []).join(', '))
  const [desiredSkills, setDesiredSkills] = useState((initial.desiredSkills ?? []).join(', '))
  const [hasEmergencyFund, setHasEmergencyFund] = useState(initial.hasEmergencyFund ?? false)

  const chipClass = (active) =>
    `rounded-full px-3 py-1.5 text-sm border transition-colors ${
      active ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'bg-[var(--ink-900)] border-[var(--ink-700)] text-[var(--ink-300)]'
    }`
  const inputClass =
    'w-full rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] px-3 py-2 text-[var(--ink-50)] focus:outline-none focus:border-[var(--accent)] transition-colors'

  function toggle(value) {
    setInterests((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]))
  }

  function submit() {
    onNext({
      employmentStatus,
      currentMonthlyIncome: currentMonthlyIncome === '' ? null : Number(currentMonthlyIncome),
      targetMonthlyIncome: targetMonthlyIncome === '' ? null : Number(targetMonthlyIncome),
      targetDate: targetDate || null,
      hoursPerWeekAvailable: hoursPerWeekAvailable === '' ? null : Number(hoursPerWeekAvailable),
      interests,
      currentSkills: parseCsv(currentSkills),
      desiredSkills: parseCsv(desiredSkills),
      hasEmergencyFund,
    })
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-[var(--ink-400)]">
        This section is optional — leave it blank to skip financial planning entirely.
      </p>

      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">Employment status</label>
        <select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value)} className={inputClass}>
          <option value="employed">Employed</option>
          <option value="self-employed">Self-employed / have a business</option>
          <option value="student">Student</option>
          <option value="unemployed">Not currently working</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Current monthly income (optional)</label>
          <input type="number" value={currentMonthlyIncome} onChange={(e) => setCurrentMonthlyIncome(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Target monthly income</label>
          <input type="number" value={targetMonthlyIncome} onChange={(e) => setTargetMonthlyIncome(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Target date</label>
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Hours/week available</label>
          <input type="number" value={hoursPerWeekAvailable} onChange={(e) => setHoursPerWeekAvailable(e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">What's the main way you want to grow your income? (pick any)</label>
        <div className="flex gap-2 flex-wrap">
          {INTERESTS.map((i) => (
            <button key={i.id} type="button" onClick={() => toggle(i.id)} className={chipClass(interests.includes(i.id))}>
              {i.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">Skills you already have (comma-separated, optional)</label>
        <input value={currentSkills} onChange={(e) => setCurrentSkills(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-1.5">Skills you want to learn (comma-separated, optional)</label>
        <input value={desiredSkills} onChange={(e) => setDesiredSkills(e.target.value)} className={inputClass} />
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--ink-200)]">
        <input type="checkbox" checked={hasEmergencyFund} onChange={(e) => setHasEmergencyFund(e.target.checked)} />
        I already have an emergency fund set aside
      </label>

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
