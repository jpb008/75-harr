import { useMemo, useState } from 'react'
import { CalendarCheck, Share2, Check, Trophy, Dumbbell, Scale, Brain, Apple, Droplets, Moon, Flame, Target } from 'lucide-react'
import { SectionCard, Button } from './ui'
import { loadJSON } from '../lib/storage'
import { buildMonthlyReport, reportMonths, reportShareText, monthLabel } from '../lib/plan/monthlyReport'

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-950)] p-3 min-w-0">
      <p className="flex items-center gap-1.5 text-xs text-[var(--ink-300)]">
        <Icon size={13} className="text-[var(--accent-light)] shrink-0" />
        <span className="truncate">{label}</span>
      </p>
      <p className="text-lg font-semibold text-[var(--ink-50)] tabular-nums leading-tight mt-1">{value}</p>
      {sub && <p className="text-[11px] text-[var(--ink-400)] mt-0.5">{sub}</p>}
    </div>
  )
}

export default function MonthlyReport({ initialMonth, plan, workoutLogs, weighIns, mealChecks, dailyHealth, challenge, days, unit, mealsPerDay, todayStr, showWeight }) {
  const planDays = loadJSON('planDays', {})
  const months = useMemo(
    () => reportMonths({ workoutLogs, weighIns, mealChecks, dailyHealth, planDays }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [workoutLogs, weighIns, mealChecks, dailyHealth],
  )
  const [monthKey, setMonthKey] = useState(initialMonth ?? null)
  const [shared, setShared] = useState(false)
  const key = monthKey ?? months[0] ?? todayStr.slice(0, 7)
  const r = useMemo(
    () => buildMonthlyReport({ monthKey: key, todayStr, plan, planDays, workoutLogs, weighIns, mealChecks, dailyHealth, challenge, days, unit, mealsPerDay }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, todayStr, plan, workoutLogs, weighIns, mealChecks, dailyHealth, challenge, days, unit, mealsPerDay],
  )

  async function share() {
    const text = reportShareText(r)
    try {
      if (navigator.share) await navigator.share({ text })
      else {
        await navigator.clipboard.writeText(text)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      }
    } catch {
      // cancelled
    }
  }

  return (
    <div id="monthly-report" className="scroll-mt-4">
      <SectionCard icon={CalendarCheck} title="Monthly report" hint={r.complete ? 'Your month at a glance.' : 'This month so far. The full report is ready on the 1st.'}>
        {months.length > 1 && (
          <select
            value={key}
            onChange={(e) => setMonthKey(e.target.value)}
            aria-label="Month"
            className="w-full min-w-0 rounded-xl bg-[var(--ink-950)] border border-[var(--ink-700)] px-3 py-2 text-sm text-[var(--ink-50)]"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))}
          </select>
        )}
        <p className="font-display text-3xl leading-none text-[var(--ink-50)]">{r.label}</p>
        <div className="grid grid-cols-2 gap-2">
          <Stat icon={Dumbbell} label="Workouts" value={r.workouts.planned ? `${r.workouts.done} of ${r.workouts.planned}` : r.sessionsLogged || '—'} sub={r.workouts.rate != null ? `${r.workouts.rate}% · ${r.setsLogged} sets logged` : null} />
          <Stat icon={Trophy} label="Records" value={r.prCount} sub={r.strength ? `${r.strength.name}: +${Math.round(r.strength.pctGain)}%` : null} />
          {showWeight && <Stat icon={Scale} label="Weight" value={r.weight ? `${r.weight.change > 0 ? '+' : ''}${r.weight.change} ${r.weight.unit}` : '—'} sub={r.weight ? `${r.weight.from} → ${r.weight.to}` : 'Weigh in weekly'} />}
          <Stat icon={Brain} label="Daily habits" value={r.habits != null ? `${r.habits}%` : '—'} />
          <Stat icon={Apple} label="Meals on plan" value={r.meals != null ? `${r.meals}%` : '—'} sub={r.meals == null ? 'Tick meals on Today' : 'on days you ticked meals'} />
          <Stat icon={Droplets} label="Water goal" value={r.water ? `${r.water.hit} of ${r.water.days} days` : '—'} />
          <Stat icon={Moon} label="Sleep" value={r.sleepAvg != null ? `${r.sleepAvg} h` : '—'} sub={r.sleepAvg != null ? 'average a night' : 'Log it on Today'} />
          {r.challenge && <Stat icon={Flame} label="75 Hard days" value={`${r.challenge.done} of ${r.challenge.days}`} sub="fully completed" />}
        </div>
        {r.best && <p className="text-sm text-[var(--ink-100)]">{r.best}</p>}
        <div className="rounded-xl border border-[var(--accent-a40)] bg-[var(--accent-a08)] p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--accent-light)] mb-1">
            <Target size={13} /> Focus for next month
          </p>
          <p className="text-sm text-[var(--ink-100)]">{r.focus}</p>
        </div>
        <Button variant="secondary" className="w-full" onClick={share}>
          {shared ? <Check size={15} /> : <Share2 size={15} />} {shared ? 'Copied' : 'Share report'}
        </Button>
      </SectionCard>
    </div>
  )
}

// On Today for the first week of a month, until opened.
export function MonthlyReportBanner({ monthKey, onOpen, onDismiss }) {
  return (
    <div className="mb-5 rounded-2xl border border-[var(--accent-a40)] bg-[var(--accent-a10)] p-4 flex gap-3">
      <CalendarCheck size={20} className="text-[var(--accent-light)] shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--ink-50)]">Your {monthLabel(monthKey).split(' ')[0]} report is ready</p>
        <p className="text-sm text-[var(--ink-200)] mt-0.5">See your workouts, records, habits and one thing to focus on this month.</p>
        <div className="flex gap-2 mt-3">
          <Button onClick={onOpen}>See report</Button>
          <Button variant="secondary" onClick={onDismiss}>
            Later
          </Button>
        </div>
      </div>
    </div>
  )
}
