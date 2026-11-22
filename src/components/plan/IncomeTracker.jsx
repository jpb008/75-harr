import { useState } from 'react'
import { ChevronLeft, ChevronRight, BarChart3, Lightbulb } from 'lucide-react'
import { SectionCard, NumberInput } from '../ui'
import { addDays, today, formatPretty } from '../../lib/dates'
import { weekStartOf, summarizeIncome, incomeInsights } from '../../lib/plan/incomeTracking'

const money = (n) => `$${Math.round(n).toLocaleString()}`

export default function IncomeTracker({ paths, labels, incomeLogs, setIncomeLogs, milestones }) {
  const todayStr = today()
  const currentWeek = weekStartOf(todayStr)
  const [week, setWeek] = useState(currentWeek)
  const summary = summarizeIncome(incomeLogs, paths.map((p) => p.id), todayStr)
  const insights = incomeInsights(summary, labels)

  function setEntry(pathId, field, value) {
    setIncomeLogs((prev) => ({
      ...prev,
      [week]: { ...prev[week], [pathId]: { ...prev[week]?.[pathId], [field]: value } },
    }))
  }

  const weekLabel = week === currentWeek ? 'This week' : `Week of ${formatPretty(week)}`

  return (
    <SectionCard icon={BarChart3} title="Track your results" hint="Log your hours and what you made each week. Seeing the real numbers is how you decide where your time should go.">
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Previous week" onClick={() => setWeek(addDays(week, -7))} className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--ink-200)] hover:bg-[var(--ink-800)]">
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-medium text-[var(--ink-50)]">{weekLabel}</span>
        <button
          type="button"
          aria-label="Next week"
          disabled={week >= currentWeek}
          onClick={() => setWeek(addDays(week, 7))}
          className="h-8 w-8 rounded-full flex items-center justify-center text-[var(--ink-200)] hover:bg-[var(--ink-800)] disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="space-y-2.5">
        {paths.map((p) => (
          <div key={`${week}-${p.id}`} className="grid grid-cols-[1fr_5.5rem_6rem] gap-2 items-center">
            <span className="text-sm text-[var(--ink-100)] min-w-0 truncate">{labels[p.id]}</span>
            <NumberInput value={incomeLogs[week]?.[p.id]?.hours ?? null} onChange={(v) => setEntry(p.id, 'hours', v)} min={0} step={0.5} suffix="h" placeholder="0" />
            <NumberInput value={incomeLogs[week]?.[p.id]?.income ?? null} onChange={(v) => setEntry(p.id, 'income', v)} min={0} suffix="$" placeholder="0" />
          </div>
        ))}
      </div>

      {summary.weeksInWindow > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-300)] mb-2">Last 8 weeks</p>
          <div className="rounded-xl border border-[var(--ink-800)] overflow-hidden">
            <div className="grid grid-cols-[1fr_3.5rem_4.5rem_4rem] gap-2 px-3 py-2 text-[11px] text-[var(--ink-400)] bg-[var(--ink-950)]">
              <span>Path</span>
              <span className="text-right">Hours</span>
              <span className="text-right">Made</span>
              <span className="text-right">Per hr</span>
            </div>
            {summary.byPath.map((p) => (
              <div key={p.id} className="grid grid-cols-[1fr_3.5rem_4.5rem_4rem] gap-2 px-3 py-2 text-sm border-t border-[var(--ink-800)] tabular-nums">
                <span className="text-[var(--ink-100)] truncate">{labels[p.id]}</span>
                <span className="text-right text-[var(--ink-200)]">{p.hours}</span>
                <span className="text-right text-[var(--ink-50)]">{money(p.income)}</span>
                <span className="text-right text-[var(--ink-200)]">{p.perHour != null ? money(p.perHour) : '—'}</span>
              </div>
            ))}
          </div>
          {milestones?.targetMonthlyIncome != null && (
            <p className="text-xs text-[var(--ink-300)] mt-2">
              Last 4 weeks: {money(summary.last4Income)} logged, against a target of {money(milestones.targetMonthlyIncome)}/month.
            </p>
          )}
        </div>
      )}

      {insights.map((text, i) => (
        <p key={i} className="flex gap-2 text-sm text-[var(--ink-100)]">
          <Lightbulb size={16} className="shrink-0 mt-0.5 text-[var(--accent-light)]" />
          {text}
        </p>
      ))}
    </SectionCard>
  )
}
