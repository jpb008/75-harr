import { useState } from 'react'
import { Scale, TrendingDown, TrendingUp, Check, Trash2 } from 'lucide-react'
import { SectionCard, NumberInput, Button, DateInput } from './ui'
import { weightTrend, calorieSuggestion, goalRate, fromKg, hasCalorieTarget } from '../lib/plan/bodyweight'

function Chart({ points, unit }) {
  if (points.length < 2) return null
  const w = 320
  const h = 110
  const pad = 8
  const values = points.map((p) => fromKg(p.kg, unit))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const spread = Math.max(max - min, 1)
  const x = (i) => pad + (i / (points.length - 1)) * (w - pad * 2)
  const y = (v) => pad + (1 - (v - min) / spread) * (h - pad * 2)
  const path = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28" role="img" aria-label="Weight trend">
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {values.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r="3.5" fill="var(--ink-950)" stroke="var(--accent-light)" strokeWidth="2" />
        ))}
      </svg>
      <div className="flex justify-between text-[11px] text-[var(--ink-400)] tabular-nums">
        <span>{points[0].date.slice(5)}</span>
        <span>
          {min.toFixed(1)}-{max.toFixed(1)} {unit}
        </span>
        <span>{points[points.length - 1].date.slice(5)}</span>
      </div>
    </div>
  )
}

export default function BodyWeightCard({ weighIns, setWeighIns, answers, unit, todayStr, onApplyAdjustment }) {
  const [weight, setWeight] = useState(null)
  const [date, setDate] = useState(todayStr)
  const [applying, setApplying] = useState(false)
  const trend = weightTrend(weighIns, todayStr)
  const suggestion = answers ? calorieSuggestion(weighIns, answers, todayStr) : null
  const goal = answers ? goalRate(answers) : null
  const recent = Object.keys(weighIns).sort().reverse().slice(0, 5)

  function log() {
    if (weight == null || weight <= 0) return
    setWeighIns((prev) => ({ ...prev, [date]: { weight, unit } }))
    setWeight(null)
  }

  return (
    <SectionCard icon={Scale} title="Body weight" hint="Weigh in once a week — same day, first thing in the morning — for a trend you can trust.">
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <NumberInput value={weight} onChange={setWeight} min={0} step={0.1} suffix={unit} placeholder="Today's weight" />
        <Button onClick={log} disabled={weight == null}>
          Log
        </Button>
      </div>
      <DateInput value={date} max={todayStr} onChange={(d) => setDate(d || todayStr)} ariaLabel="Weigh-in date" />

      <Chart points={trend.points} unit={unit} />

      {trend.points.length >= 2 && trend.kgPerWeek != null && (
        <p className="flex gap-2 text-sm text-[var(--ink-100)]">
          {trend.kgPerWeek < 0 ? <TrendingDown size={16} className="shrink-0 mt-0.5 text-[var(--accent-light)]" /> : <TrendingUp size={16} className="shrink-0 mt-0.5 text-[var(--accent-light)]" />}
          <span>
            Trend: {trend.kgPerWeek < 0 ? 'down' : 'up'} {Math.abs(fromKg(trend.kgPerWeek, unit)).toFixed(1)} {unit}/week (
            {Math.abs(trend.pctPerWeek).toFixed(2)}%). Goal: {goal.label}.
            {!trend.enough && ' Keep logging — suggestions start after 3 weigh-ins over 2+ weeks.'}
          </span>
        </p>
      )}
      {trend.points.length < 2 && <p className="text-xs text-[var(--ink-400)]">Log a few weekly weigh-ins to see your trend.</p>}

      {answers && !hasCalorieTarget(answers) && trend.points.length >= 2 && (
        <p className="text-xs text-[var(--ink-300)]">
          Add your age, height and weight in Plan → Edit to get a calorie target — then your weigh-ins can fine-tune it.
        </p>
      )}

      {suggestion && (
        <div className="rounded-xl border border-[var(--accent-a40)] bg-[var(--accent-a10)] p-3">
          <p className="text-sm text-[var(--ink-50)]">{suggestion.reason}</p>
          <Button
            className="mt-2.5 w-full"
            disabled={applying}
            onClick={async () => {
              setApplying(true)
              try {
                await onApplyAdjustment(suggestion.delta)
              } finally {
                setApplying(false)
              }
            }}
          >
            <Check size={16} /> Update my calories ({suggestion.delta > 0 ? '+' : ''}
            {suggestion.delta})
          </Button>
        </div>
      )}

      {recent.length > 0 && (
        <ul className="divide-y divide-[var(--ink-800)]">
          {recent.map((d) => (
            <li key={d} className="flex items-center justify-between py-1.5 text-sm">
              <span className="text-[var(--ink-300)]">{d}</span>
              <span className="flex items-center gap-3">
                <span className="text-[var(--ink-50)] tabular-nums">
                  {fromKg(weighIns[d].unit === 'kg' ? weighIns[d].weight : weighIns[d].weight / 2.20462, unit).toFixed(1)} {unit}
                </span>
                <button
                  type="button"
                  aria-label={`Delete weigh-in ${d}`}
                  onClick={() =>
                    setWeighIns((prev) => {
                      const next = { ...prev }
                      delete next[d]
                      return next
                    })
                  }
                  className="text-[var(--ink-400)] hover:text-[var(--danger)]"
                >
                  <Trash2 size={15} />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
