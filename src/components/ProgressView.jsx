import { addDays, formatPretty, today } from '../lib/dates'
import { isDayComplete } from '../lib/challenge'
import { computeStats, computeHeatmapCells } from '../lib/stats'
import StatsSection from './StatsSection'
import HeatmapView from './HeatmapView'
import PhotoTimeline from './PhotoTimeline'
import BodyWeightCard from './BodyWeightCard'
import TrendCharts from './TrendCharts'
import WorkoutHistory from './WorkoutHistory'
import MonthlyReport from './MonthlyReport'

export default function ProgressView({ challenge, days, history, photoUrls, weighIns, setWeighIns, answers, weightUnit, onApplyCalorieAdjustment, plan, workoutLogs, mealChecks, injuries, onSaveWorkout, onDeleteWorkout, dailyHealth, reportMonth }) {
  const todayStr = today()
  const cells = Array.from({ length: challenge.lengthDays }, (_, i) => {
    const dateStr = addDays(challenge.startDate, i)
    const record = days[dateStr]
    let status = 'upcoming'
    if (dateStr < todayStr) status = isDayComplete(record, challenge.tasks) ? 'done' : 'missed'
    else if (dateStr === todayStr) status = isDayComplete(record, challenge.tasks) ? 'done' : 'today'
    return { day: i + 1, dateStr, status }
  })

  const styles = {
    done: 'bg-[var(--success-strong)] text-[var(--success-on-strong)]',
    missed: 'bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger-border)]',
    today: 'bg-[var(--accent-a15)] text-[var(--accent-light)] border border-[var(--accent-a60)] shadow-[0_0_0_3px_var(--accent-a15)]',
    upcoming: 'bg-[var(--ink-900)] text-[var(--ink-400)] border border-[var(--ink-800)]',
  }

  const stats = computeStats(challenge, days, history)
  const heatmapCells = computeHeatmapCells(challenge, days)

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-4">
      <h1 className="font-display text-5xl leading-none text-[var(--ink-50)] mb-2">Progress</h1>
      <p className="text-[var(--ink-300)] text-sm mb-6">
        Started {formatPretty(challenge.startDate)} · {challenge.lengthDays} day challenge
      </p>

      {/* Weight tracking is left out entirely in safe mode (under 18, pregnant, or a history of disordered eating). */}
      {answers && !answers.meta?.safeMode && setWeighIns && (
        <div className="mb-8">
          <BodyWeightCard
            weighIns={weighIns}
            setWeighIns={setWeighIns}
            answers={answers}
            unit={weightUnit}
            todayStr={todayStr}
            onApplyAdjustment={onApplyCalorieAdjustment}
          />
        </div>
      )}

      {plan && (
        <div className="mb-8">
          <MonthlyReport
            key={reportMonth ?? 'current'}
            initialMonth={reportMonth}
            plan={plan}
            workoutLogs={workoutLogs}
            weighIns={weighIns}
            mealChecks={mealChecks}
            dailyHealth={dailyHealth}
            challenge={challenge}
            days={days}
            unit={weightUnit}
            mealsPerDay={answers?.personal?.mealsPerDay ?? 3}
            todayStr={todayStr}
            showWeight={Boolean(answers && !answers.meta?.safeMode)}
          />
        </div>
      )}

      {plan && (
        <div className="mb-8">
          <TrendCharts plan={plan} workoutLogs={workoutLogs} weighIns={weighIns} mealChecks={mealChecks} answers={answers} weightUnit={weightUnit} todayStr={todayStr} />
        </div>
      )}

      {plan && onSaveWorkout && (
        <div className="mb-8">
          <WorkoutHistory plan={plan} workoutLogs={workoutLogs} unit={weightUnit} injuries={injuries} todayStr={todayStr} onSave={onSaveWorkout} onDelete={onDeleteWorkout} />
        </div>
      )}

      <div className="grid grid-cols-8 gap-2 mb-8">
        {cells.map((c) => (
          <div
            key={c.dateStr}
            title={`Day ${c.day} · ${formatPretty(c.dateStr)} · ${c.status}`}
            className={`aspect-square rounded-md flex items-center justify-center text-[11px] font-medium tabular-nums ${styles[c.status]}`}
          >
            {c.day}
          </div>
        ))}
      </div>

      <div className="flex gap-4 text-xs text-[var(--ink-300)] mb-10 flex-wrap">
        <Legend swatch="bg-[var(--success-strong)]" label="Complete" />
        <Legend swatch="bg-[var(--danger-soft)] border border-[var(--danger-border)]" label="Missed" />
        <Legend swatch="bg-[var(--accent-a15)] border border-[var(--accent-a60)]" label="Today" />
        <Legend swatch="bg-[var(--ink-900)] border border-[var(--ink-800)]" label="Upcoming" />
      </div>

      <StatsSection stats={stats} />
      <HeatmapView cells={heatmapCells} />
      <PhotoTimeline urls={photoUrls} />

      <h3 className="font-display text-xl text-[var(--ink-50)] mb-3 tracking-wide">Past attempts</h3>
      {history.length === 0 && <p className="text-[var(--ink-400)] text-sm">No past attempts yet — this is your first run.</p>}
      <ul className="space-y-2">
        {[...history].reverse().map((h, idx) => (
          <li
            key={`${h.id}-${idx}`}
            className="flex items-center justify-between rounded-lg bg-[var(--ink-900)] border border-[var(--ink-800)] px-4 py-3 text-sm"
          >
            <div>
              <p className="text-[var(--ink-100)]">{h.name}</p>
              <p className="text-[var(--ink-400)] text-xs">
                {formatPretty(h.startDate)} → {formatPretty(h.endDate)}
              </p>
            </div>
            <div className="text-right">
              <p className={h.reason === 'finished' ? 'text-[var(--success)] font-medium' : 'text-[var(--danger)] font-medium'}>
                {h.reason === 'finished' ? 'Finished 🎉' : 'Reset'}
              </p>
              <p className="text-[var(--ink-400)] text-xs tabular-nums">
                {h.daysCompleted}/{h.lengthDays} days
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Legend({ swatch, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm ${swatch}`} />
      {label}
    </span>
  )
}
