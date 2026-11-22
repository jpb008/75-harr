import { useEffect, useMemo, useRef, useState } from 'react'
import { LineChart as LineIcon, Table2 } from 'lucide-react'
import { SectionCard, Segmented } from './ui'
import { parseDateStr } from '../lib/dates'
import { loadJSON } from '../lib/storage'
import { loggedExercises, liftSeries, weightSeries, weeklyConsistency } from '../lib/plan/trends'

const shortDate = (d) => parseDateStr(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(320)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(200, Math.round(entry.contentRect.width))))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

// Clean tick values (1, 2, 2.5, 5 × 10^n steps) covering min..max.
function niceTicks(min, max, count = 4) {
  if (min === max) {
    const pad = Math.max(1, Math.abs(min) * 0.05)
    min -= pad
    max += pad
  }
  const raw = (max - min) / (count - 1)
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  const ticks = []
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(6)))
  return ticks
}

const fmt = (v) => (Math.abs(v) >= 10000 ? `${Math.round(v / 1000)}K` : v.toLocaleString(undefined, { maximumFractionDigits: 1 }))

// Single-series line: 2px line, 10% area wash, ringed markers, value at the
// end, crosshair + tooltip that snaps to the nearest date on hover/tap.
export function LineChart({ points, unit, label }) {
  const [ref, width] = useWidth()
  const [active, setActive] = useState(null)
  const height = 180
  const pad = { top: 18, right: 46, bottom: 26, left: 40 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  const values = points.map((p) => p.value)
  const ticks = niceTicks(Math.min(...values), Math.max(...values))
  const yMin = ticks[0]
  const yMax = ticks[ticks.length - 1]
  const t0 = parseDateStr(points[0].date).getTime()
  const t1 = parseDateStr(points[points.length - 1].date).getTime()
  const x = (d) => pad.left + (t1 === t0 ? innerW / 2 : ((parseDateStr(d).getTime() - t0) / (t1 - t0)) * innerW)
  const y = (v) => pad.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH

  const line = points.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const area = `${line} L${x(points[points.length - 1].date).toFixed(1)},${pad.top + innerH} L${x(points[0].date).toFixed(1)},${pad.top + innerH} Z`
  const showMarkers = points.length <= 24
  const last = points[points.length - 1]

  function nearest(clientX, rect) {
    const px = clientX - rect.left
    let best = 0
    points.forEach((p, i) => {
      if (Math.abs(x(p.date) - px) < Math.abs(x(points[best].date) - px)) best = i
    })
    setActive(best)
  }

  const a = active != null ? points[active] : null
  const tipLeft = a ? Math.min(Math.max(x(a.date) - 70, 0), width - 140) : 0

  return (
    <div ref={ref} className="relative select-none">
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={`${label}: ${points.length} points from ${shortDate(points[0].date)} to ${shortDate(last.date)}, latest ${fmt(last.value)} ${unit}`}
        tabIndex={0}
        className="block touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg"
        onPointerMove={(e) => nearest(e.clientX, e.currentTarget.getBoundingClientRect())}
        onPointerDown={(e) => nearest(e.clientX, e.currentTarget.getBoundingClientRect())}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
        onBlur={() => setActive(null)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setActive((i) => Math.max(0, (i ?? points.length) - 1))
          if (e.key === 'ArrowRight') setActive((i) => Math.min(points.length - 1, (i ?? -1) + 1))
          if (e.key === 'Escape') setActive(null)
        }}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={pad.left + innerW} y1={y(t)} y2={y(t)} stroke="var(--ink-800)" strokeWidth="1" />
            <text x={pad.left - 6} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill="var(--ink-400)" className="tabular-nums">
              {fmt(t)}
            </text>
          </g>
        ))}
        <text x={pad.left} y={height - 6} fontSize="11" fill="var(--ink-400)">
          {shortDate(points[0].date)}
        </text>
        {points.length > 1 && (
          <text x={pad.left + innerW} y={height - 6} fontSize="11" fill="var(--ink-400)" textAnchor="end">
            {shortDate(last.date)}
          </text>
        )}
        {points.length > 1 && <path d={area} fill="var(--accent)" opacity="0.1" />}
        {points.length > 1 && <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {a && <line x1={x(a.date)} x2={x(a.date)} y1={pad.top} y2={pad.top + innerH} stroke="var(--ink-600)" strokeWidth="1" />}
        {points.map((p, i) =>
          showMarkers || i === points.length - 1 || i === active ? (
            <circle key={p.date} cx={x(p.date)} cy={y(p.value)} r={i === active ? 5 : 4} fill="var(--accent)" stroke="var(--ink-900)" strokeWidth="2" />
          ) : null,
        )}
        <text x={x(last.date) + 8} y={y(last.value)} dy="0.32em" fontSize="12" fontWeight="600" fill="var(--ink-50)" className="tabular-nums">
          {fmt(last.value)}
        </text>
      </svg>
      {a && (
        <div
          className="pointer-events-none absolute top-0 w-[140px] rounded-lg border border-[var(--ink-700)] bg-[var(--ink-950)] px-2.5 py-1.5 shadow-lg"
          style={{ left: tipLeft }}
          role="status"
        >
          <p className="text-sm font-semibold text-[var(--ink-50)] tabular-nums">
            {fmt(a.value)} {unit}
          </p>
          <p className="text-[11px] text-[var(--ink-300)]">{shortDate(a.date)}</p>
          {a.detail && <p className="text-[11px] text-[var(--ink-400)]">{a.detail}</p>}
        </div>
      )}
    </div>
  )
}

function DataTable({ rows, columns }) {
  return (
    <div className="max-h-56 overflow-y-auto rounded-lg border border-[var(--ink-800)]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-[var(--ink-900)]">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-3 py-1.5 text-xs font-medium text-[var(--ink-300)] ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-[var(--ink-800)]">
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-1.5 text-[var(--ink-100)] tabular-nums ${c.align === 'right' ? 'text-right' : ''}`}>
                  {r[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableToggle({ on, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!on)} aria-pressed={on} className="inline-flex shrink-0 whitespace-nowrap items-center gap-1 text-xs font-medium text-[var(--ink-300)] hover:text-[var(--ink-50)]">
      {on ? <LineIcon size={13} /> : <Table2 size={13} />} {on ? 'Show chart' : 'Show table'}
    </button>
  )
}

function Empty({ children }) {
  return <p className="text-sm text-[var(--ink-300)] rounded-xl border border-dashed border-[var(--ink-700)] px-3 py-6 text-center">{children}</p>
}

function StrengthPanel({ workoutLogs, unit }) {
  const exercises = useMemo(() => loggedExercises(workoutLogs), [workoutLogs])
  const [exerciseId, setExerciseId] = useState(exercises[0]?.id ?? null)
  const [table, setTable] = useState(false)
  const id = exercises.some((e) => e.id === exerciseId) ? exerciseId : exercises[0]?.id
  const series = useMemo(() => (id ? liftSeries(workoutLogs, id, unit) : null), [workoutLogs, id, unit])

  if (!exercises.length) return <Empty>Log a workout (Today → Log workout) and your lifts will show up here.</Empty>
  const first = series.points[0]
  const last = series.points[series.points.length - 1]
  const change = series.points.length > 1 ? last.value - first.value : null

  return (
    <div className="space-y-3">
      <select
        value={id}
        onChange={(e) => setExerciseId(e.target.value)}
        aria-label="Exercise"
        className="w-full min-w-0 rounded-xl bg-[var(--ink-950)] border border-[var(--ink-700)] px-3 py-2 text-sm text-[var(--ink-50)] focus:outline-none focus:border-[var(--accent)]"
      >
        {exercises.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name} ({e.sessions} session{e.sessions === 1 ? '' : 's'})
          </option>
        ))}
      </select>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[var(--ink-300)]">{series.measure}</p>
          {change != null && (
            <p className="text-sm text-[var(--ink-100)]">
              {change === 0 ? 'Holding steady' : `${change > 0 ? '+' : ''}${fmt(change)} ${series.unit}`} since {shortDate(first.date)}
            </p>
          )}
        </div>
        <TableToggle on={table} onChange={setTable} />
      </div>
      {table ? (
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'value', label: series.unit, align: 'right' },
            { key: 'detail', label: 'Best set' },
          ]}
          rows={[...series.points].reverse().map((p) => ({ date: shortDate(p.date), value: fmt(p.value), detail: p.detail }))}
        />
      ) : (
        <LineChart points={series.points} unit={series.unit} label={`${exercises.find((e) => e.id === id)?.name} ${series.measure}`} />
      )}
      {series.points.length === 1 && <p className="text-xs text-[var(--ink-400)]">Log this exercise again to see a trend line.</p>}
    </div>
  )
}

function WeightPanel({ weighIns, unit }) {
  const points = useMemo(() => weightSeries(weighIns, unit), [weighIns, unit])
  const [table, setTable] = useState(false)
  if (!points.length) return <Empty>Add a weigh-in above and your weight trend will show up here.</Empty>
  const change = points.length > 1 ? Math.round((points[points.length - 1].value - points[0].value) * 10) / 10 : null
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-[var(--ink-300)]">Body weight ({unit})</p>
          {change != null && (
            <p className="text-sm text-[var(--ink-100)]">
              {change === 0 ? 'No change' : `${change > 0 ? '+' : ''}${change} ${unit}`} since {shortDate(points[0].date)}
            </p>
          )}
        </div>
        <TableToggle on={table} onChange={setTable} />
      </div>
      {table ? (
        <DataTable
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'value', label: unit, align: 'right' },
          ]}
          rows={[...points].reverse().map((p) => ({ date: shortDate(p.date), value: p.value }))}
        />
      ) : (
        <LineChart points={points} unit={unit} label="Body weight" />
      )}
    </div>
  )
}

// Small multiples: one single-hue column row per track, so no legend or
// color-matching is needed. Tap a column for that week's value.
function ConsistencyRow({ title, weeks, field }) {
  const [active, setActive] = useState(null)
  const hasData = weeks.some((w) => w[field] != null)
  const lastWithData = [...weeks].reverse().find((w) => w[field] != null)
  const a = active != null ? weeks[active] : null
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <p className="text-sm font-medium text-[var(--ink-100)]">{title}</p>
        <p className="text-xs text-[var(--ink-300)] tabular-nums">
          {a ? `Week of ${shortDate(a.weekStart)}: ${a[field] == null ? 'not tracked' : `${a[field]}%`}` : lastWithData ? `This week: ${weeks[weeks.length - 1][field] ?? '—'}${weeks[weeks.length - 1][field] != null ? '%' : ''}` : ''}
        </p>
      </div>
      {hasData ? (
        <div className="relative h-16 flex items-end gap-[2px] border-b border-[var(--ink-800)]" onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}>
          {weeks.map((w, i) => (
            <button
              key={w.weekStart}
              type="button"
              aria-label={`${title}, week of ${shortDate(w.weekStart)}: ${w[field] == null ? 'not tracked' : `${w[field]}%`}`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              onClick={() => setActive(i)}
              className="flex-1 h-full flex items-end justify-center outline-none focus-visible:bg-[var(--ink-800)] rounded-t"
            >
              {w[field] != null ? (
                <span
                  className={`block w-full max-w-[24px] rounded-t-[4px] ${i === active ? 'bg-[var(--accent-light)]' : 'bg-[var(--accent)]'}`}
                  style={{ height: `${Math.max(2, w[field])}%` }}
                />
              ) : (
                <span className="block w-full max-w-[24px] h-[2px] bg-[var(--ink-700)]" />
              )}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-[var(--ink-400)]">Nothing tracked yet.</p>
      )}
    </div>
  )
}

function ConsistencyPanel({ plan, workoutLogs, mealChecks, mealsPerDay, todayStr }) {
  const weeks = useMemo(
    () => weeklyConsistency({ plan, planDays: loadJSON('planDays', {}), workoutLogs, mealChecks, mealsPerDay, todayStr }),
    [plan, workoutLogs, mealChecks, mealsPerDay, todayStr],
  )
  const [table, setTable] = useState(false)
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <p className="text-xs text-[var(--ink-300)] min-w-0">% of planned workouts, habits and meals done each week · last 8 weeks</p>
        <TableToggle on={table} onChange={setTable} />
      </div>
      {table ? (
        <DataTable
          columns={[
            { key: 'week', label: 'Week of' },
            { key: 'workouts', label: 'Workouts', align: 'right' },
            { key: 'habits', label: 'Habits', align: 'right' },
            { key: 'meals', label: 'Meals', align: 'right' },
          ]}
          rows={[...weeks].reverse().map((w) => ({
            week: shortDate(w.weekStart),
            workouts: w.workouts == null ? null : `${w.workouts}%`,
            habits: w.habits == null ? null : `${w.habits}%`,
            meals: w.meals == null ? null : `${w.meals}%`,
          }))}
        />
      ) : (
        <>
          <ConsistencyRow title="Workouts" weeks={weeks} field="workouts" />
          <ConsistencyRow title="Habits" weeks={weeks} field="habits" />
          <ConsistencyRow title="Meals eaten" weeks={weeks} field="meals" />
          <p className="text-[11px] text-[var(--ink-400)]">Oldest week on the left, this week on the right. Tap a bar for its number.</p>
        </>
      )}
    </div>
  )
}

export default function TrendCharts({ plan, workoutLogs, weighIns, mealChecks, answers, weightUnit, todayStr }) {
  const showWeight = answers && !answers.meta?.safeMode
  const views = [
    { id: 'strength', label: 'Strength' },
    ...(showWeight ? [{ id: 'weight', label: 'Weight' }] : []),
    { id: 'consistency', label: 'Weekly' },
  ]
  const [view, setView] = useState('strength')
  return (
    <SectionCard icon={LineIcon} title="Your trends" hint="How your training, body weight and habits are moving over time.">
      <Segmented options={views} value={view} onChange={setView} />
      {view === 'strength' && <StrengthPanel workoutLogs={workoutLogs} unit={weightUnit} />}
      {view === 'weight' && showWeight && <WeightPanel weighIns={weighIns} unit={weightUnit} />}
      {view === 'consistency' && (
        <ConsistencyPanel plan={plan} workoutLogs={workoutLogs} mealChecks={mealChecks} mealsPerDay={answers?.personal?.mealsPerDay ?? 3} todayStr={todayStr} />
      )}
    </SectionCard>
  )
}
