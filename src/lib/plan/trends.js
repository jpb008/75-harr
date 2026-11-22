import { addDays, parseDateStr } from '../dates'
import { convertWeight } from './progression'
import { exerciseById, isBodyweight } from './exerciseLibrary'

// Data for the Progress charts. Pure functions over the synced logs.

// Estimated one-rep max (Epley). Only meaningful up to ~12 reps, so higher
// rep sets are capped there to avoid inflated numbers.
function e1rm(weight, reps) {
  return weight * (1 + Math.min(reps, 12) / 30)
}

// Exercises the user has logged, most-logged first.
export function loggedExercises(workoutLogs) {
  const counts = {}
  const names = {}
  for (const day of Object.values(workoutLogs ?? {})) {
    for (const [id, entry] of Object.entries(day?.entries ?? {})) {
      if (!entry?.sets?.some((s) => s.reps)) continue
      counts[id] = (counts[id] ?? 0) + 1
      names[id] = exerciseById(id)?.name ?? id
    }
  }
  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a] || names[a].localeCompare(names[b]))
    .map((id) => ({ id, name: names[id], sessions: counts[id] }))
}

// One point per logged session: best estimated 1RM for weighted lifts,
// best set's reps (or seconds) for bodyweight moves.
export function liftSeries(workoutLogs, exerciseId, unit) {
  const ex = exerciseById(exerciseId)
  const points = []
  for (const date of Object.keys(workoutLogs ?? {}).sort()) {
    const entry = workoutLogs[date]?.entries?.[exerciseId]
    const sets = (entry?.sets ?? []).filter((s) => s.reps)
    if (!sets.length) continue
    const weighted = sets.some((s) => s.weight)
    if (weighted) {
      const best = Math.max(...sets.filter((s) => s.weight).map((s) => e1rm(convertWeight(s.weight, entry.unit, unit), s.reps)))
      const top = sets.filter((s) => s.weight).reduce((a, s) => (convertWeight(s.weight, entry.unit, unit) > convertWeight(a.weight, entry.unit, unit) ? s : a))
      points.push({ date, value: Math.round(best), detail: `Top set ${Math.round(convertWeight(top.weight, entry.unit, unit) * 10) / 10} ${unit} × ${top.reps}` })
    } else {
      const best = Math.max(...sets.map((s) => s.reps))
      points.push({ date, value: best, detail: `${sets.length} set${sets.length === 1 ? '' : 's'}` })
    }
  }
  const weighted = points.length ? /Top set/.test(points[0].detail) : ex ? !isBodyweight(ex) : true
  return {
    points,
    measure: weighted ? `Estimated 1-rep max (${unit})` : ex?.unit === 'seconds' ? 'Best hold (seconds)' : 'Best set (reps)',
    unit: weighted ? unit : ex?.unit === 'seconds' ? 's' : 'reps',
  }
}

export function weightSeries(weighIns, unit) {
  return Object.entries(weighIns ?? {})
    .filter(([, w]) => w?.weight)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, w]) => ({ date, value: Math.round(convertWeight(w.weight, w.unit, unit) * 10) / 10 }))
}

function weekStart(dateStr) {
  return addDays(dateStr, -parseDateStr(dateStr).getDay())
}

// Weekly completion % for the last `weeks` weeks (Sunday-start), from the
// first day the user tracked anything — weeks before that aren't counted
// as misses.
export function weeklyConsistency({ plan, planDays = {}, workoutLogs = {}, mealChecks = {}, mealsPerDay = 3, todayStr, weeks = 8 }) {
  const tracked = [...Object.keys(planDays), ...Object.keys(workoutLogs), ...Object.keys(mealChecks)].filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort()
  const start = tracked[0] ?? todayStr
  const sessionDays = new Set((plan?.workout?.sessions ?? []).filter((s) => s.type !== 'rest').map((s) => s.dayOfWeek))
  const dailyHabits = (plan?.mentalDev?.tasks ?? []).filter((t) => t.cadence === 'daily').map((t) => t.id)

  const out = []
  const thisWeek = weekStart(todayStr)
  for (let w = weeks - 1; w >= 0; w -= 1) {
    const ws = addDays(thisWeek, -7 * w)
    const tally = { workouts: [0, 0], habits: [0, 0], meals: [0, 0] }
    for (let i = 0; i < 7; i += 1) {
      const d = addDays(ws, i)
      if (d > todayStr || d < start) continue
      const rec = planDays[d]
      if (sessionDays.has(parseDateStr(d).getDay())) {
        tally.workouts[1] += 1
        const logged = Object.values(workoutLogs[d]?.entries ?? {}).some((e) => e?.sets?.some((s) => s.reps))
        if (rec?.workout?.completed || logged) tally.workouts[0] += 1
      }
      if (dailyHabits.length) {
        tally.habits[1] += dailyHabits.length
        tally.habits[0] += dailyHabits.filter((id) => rec?.mentalDev?.[id]).length
      }
      // Only days with at least one tick count, so forgetting to tick isn't a miss.
      if (mealChecks[d]?.length) {
        tally.meals[1] += mealsPerDay
        tally.meals[0] += Math.min(mealChecks[d].length, mealsPerDay)
      }
    }
    const pct = ([done, total]) => (total ? Math.round((done / total) * 100) : null)
    out.push({ weekStart: ws, workouts: pct(tally.workouts), habits: pct(tally.habits), meals: pct(tally.meals) })
  }
  return out
}

// ── Personal records ───────────────────────────────────────────────────

// Best effort in one logged entry: estimated 1RM for weighted sets, top
// reps (or seconds) for bodyweight sets.
export function entryBest(entry, unit, exerciseId) {
  const sets = (entry?.sets ?? []).filter((s) => s.reps)
  if (!sets.length) return null
  const weighted = sets.filter((s) => s.weight)
  if (weighted.length) {
    let best = null
    for (const s of weighted) {
      const w = convertWeight(s.weight, entry.unit, unit)
      const v = e1rm(w, s.reps)
      if (!best || v > best.value) best = { value: v, weighted: true, detail: `${Math.round(w * 10) / 10} ${unit} × ${s.reps}` }
    }
    return best
  }
  const top = sets.reduce((a, s) => (s.reps > a.reps ? s : a))
  return { value: top.reps, weighted: false, detail: `${top.reps} ${repWord(exerciseId)}` }
}

function repWord(exerciseId) {
  return exerciseById(exerciseId)?.unit === 'seconds' ? 'sec' : 'reps'
}

function bestBefore(workoutLogs, exerciseId, excludeDate, unit, weighted) {
  let best = null
  for (const [date, day] of Object.entries(workoutLogs ?? {})) {
    if (date === excludeDate) continue
    const b = entryBest(day?.entries?.[exerciseId], unit, exerciseId)
    if (!b || b.weighted !== weighted) continue
    if (!best || b.value > best.value) best = { ...b, date }
  }
  return best
}

// Exercises in `entries` (being saved for `dateStr`) that beat every other
// logged day. A first-ever log isn't a record — there's nothing to beat.
export function findNewPRs(workoutLogs, dateStr, entries, unit) {
  const prs = []
  for (const [id, entry] of Object.entries(entries ?? {})) {
    const now = entryBest(entry, unit, id)
    if (!now) continue
    const prev = bestBefore(workoutLogs, id, dateStr, unit, now.weighted)
    if (!prev) continue
    const gain = now.value - prev.value
    if (now.weighted ? gain >= 0.5 : gain >= 1) {
      prs.push({
        exerciseId: id,
        name: exerciseById(id)?.name ?? id,
        weighted: now.weighted,
        value: Math.round(now.value),
        previous: Math.round(prev.value),
        detail: now.detail,
        unit: now.weighted ? unit : repWord(id),
      })
    }
  }
  return prs
}

// Best ever per exercise, for the records list.
export function personalRecords(workoutLogs, unit) {
  const best = {}
  for (const [date, day] of Object.entries(workoutLogs ?? {})) {
    for (const [id, entry] of Object.entries(day?.entries ?? {})) {
      const b = entryBest(entry, unit, id)
      if (!b) continue
      const cur = best[id]
      // Weighted records outrank bodyweight ones for the same exercise.
      if (!cur || (b.weighted && !cur.weighted) || (b.weighted === cur.weighted && b.value > cur.value)) best[id] = { ...b, date }
    }
  }
  return Object.entries(best)
    .map(([id, b]) => ({ exerciseId: id, name: exerciseById(id)?.name ?? id, value: Math.round(b.value), weighted: b.weighted, detail: b.detail, date: b.date, unit: b.weighted ? unit : repWord(id) }))
    .sort((a, b) => b.date.localeCompare(a.date))
}
