import { useEffect } from 'react'
import { Gauge, ClipboardCheck, Sparkles } from 'lucide-react'
import { SectionCard, Pill } from '../ui'
import { suggestTier } from '../../lib/plan/normalizeAnswers'
import { FITNESS_GOALS, MENTAL_FOCUS_AREAS, INCOME_INTERESTS, WEEKDAYS, labelFor } from '../../lib/plan/options'

const TIERS = [
  { id: 'beginner', label: 'Beginner', detail: '2-3 full-body sessions a week, 2 sets per exercise, simple progressions.' },
  { id: 'intermediate', label: 'Intermediate', detail: '3-4 upper/lower sessions, 3 sets, planned deload weeks.' },
  { id: 'advanced', label: 'Advanced', detail: '4-6 push/pull/legs sessions, 4 sets, effort-based progression.' },
]

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[var(--ink-800)] last:border-0">
      <span className="text-sm text-[var(--ink-300)] shrink-0">{label}</span>
      <span className="text-sm text-[var(--ink-50)] text-right">{value}</span>
    </div>
  )
}

export default function ReviewStep({ answers, intensityTier, setIntensityTier }) {
  const suggested = suggestTier(answers)

  useEffect(() => {
    if (!intensityTier) setIntensityTier(suggested)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const t = answers.training
  const list = (options, ids) => (ids.length ? ids.map((id) => labelFor(options, id)).join(', ') : 'None selected')

  return (
    <div className="space-y-4">
      <SectionCard icon={Gauge} title="Choose your intensity" hint="This changes real training variables — sets, rest, weekly split and how you progress.">
        <div className="space-y-2">
          {TIERS.map((tier) => {
            const active = intensityTier === tier.id
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setIntensityTier(tier.id)}
                aria-pressed={active}
                className={`w-full text-left rounded-xl border px-4 py-3 transition-all ${
                  active ? 'border-[var(--accent)] bg-[var(--accent-a10)]' : 'border-[var(--ink-700)] bg-[var(--ink-950)] hover:border-[var(--ink-600)]'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[var(--ink-50)] font-semibold">{tier.label}</span>
                  {tier.id === suggested && (
                    <Pill tone="accent">
                      <Sparkles size={11} /> Suggested for you
                    </Pill>
                  )}
                </span>
                <span className="block text-xs text-[var(--ink-300)] mt-1">{tier.detail}</span>
              </button>
            )
          })}
        </div>
      </SectionCard>

      <SectionCard icon={ClipboardCheck} title="Your answers" hint="Go back to change anything. You can also edit your plan any time from the Plan tab.">
        <div>
          <Row label="Fitness goals" value={list(FITNESS_GOALS, answers.fitnessGoals.primary)} />
          <Row label="Training days" value={t.weeklyScheduleAvailableDays.map((d) => WEEKDAYS[d]).join(', ') || 'None'} />
          <Row label="Session length" value={`${t.sessionMinutes} min`} />
          <Row label="Mind focus" value={list(MENTAL_FOCUS_AREAS, answers.mentalGoals.focusAreas)} />
          <Row label="Money paths" value={answers.financialGoals.skip ? 'Skipped' : list(INCOME_INTERESTS, answers.financialGoals.interests)} />
        </div>
      </SectionCard>
    </div>
  )
}
