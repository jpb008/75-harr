import { exerciseById, exercisesForSlot, isBodyweight } from './exerciseLibrary'

// workoutLogs shape: { [dateStr]: { sessionId, entries: { [exerciseId]: { unit: 'lb'|'kg', sets: [{ weight, reps }] } } } }
// `reps` holds seconds for timed holds. `weight` is null for bodyweight work.

const LB_PER_KG = 2.20462
const INCREMENT = { lb: 5, kg: 2.5 }

function roundToPlate(weight, unit) {
  const step = unit === 'kg' ? 0.5 : 2.5
  return Math.round(weight / step) * step
}

export function convertWeight(weight, from, to) {
  if (weight == null || from === to) return weight
  return from === 'kg' ? weight * LB_PER_KG : weight / LB_PER_KG
}

// Most recent logged entries for an exercise, newest first.
export function historyFor(workoutLogs, exerciseId, beforeDateStr) {
  return Object.keys(workoutLogs)
    .filter((date) => (!beforeDateStr || date < beforeDateStr) && workoutLogs[date]?.entries?.[exerciseId]?.sets?.length)
    .sort()
    .reverse()
    .map((date) => ({ date, ...workoutLogs[date].entries[exerciseId] }))
}

function nextHarderVariation(exerciseId, injuries) {
  const ex = exerciseById(exerciseId)
  if (!ex?.bwLevel) return null
  const harder = exercisesForSlot(ex.slot)
    .filter((e) => e.bwLevel === ex.bwLevel + 1 && (isBodyweight(e) || e.requires?.every((r) => ex.requires?.includes(r))))
    .filter((e) => !e.contraindications.some((c) => injuries.includes(c)))
  return harder[0] ?? null
}

function describeSets(entry, unit) {
  const reps = entry.sets.map((s) => s.reps).filter((r) => r != null)
  const weights = entry.sets.map((s) => s.weight).filter((w) => w != null)
  const repText = reps.length && reps.every((r) => r === reps[0]) ? `${reps.length}×${reps[0]}` : reps.join(', ')
  if (!weights.length) return repText
  const top = Math.max(...weights.map((w) => convertWeight(w, entry.unit, unit)))
  return `${repText} @ ${roundToPlate(top, unit)} ${unit}`
}

// Turns the plan's progression rule into a concrete target for next time,
// based on what was actually logged. Double progression: hit the top of
// the range on every set -> add the smallest jump; miss the bottom by 2+
// reps two sessions running -> drop ~10%; otherwise keep the weight and
// add a rep per set.
export function suggestNext(exercise, workoutLogs, { unit = 'lb', beforeDateStr, injuries = [] } = {}) {
  const history = historyFor(workoutLogs, exercise.exerciseId, beforeDateStr)
  const [lo, hi] = exercise.repRange
  const isHold = exercise.unit === 'seconds'
  const timeWord = isHold ? 'sec' : 'reps'

  if (!history.length) {
    const libEx = exerciseById(exercise.exerciseId)
    const bodyweight = libEx ? isBodyweight(libEx) || libEx.bwLevel != null : false
    return {
      kind: 'start',
      weight: null,
      text: isHold
        ? `First time: hold ${lo}-${hi} sec with good form.`
        : bodyweight
          ? `First time: aim for ${lo}-${hi} clean reps per set, stopping with 1-2 left in the tank.`
          : `First time: pick a weight you could do ${hi} times with 2-3 reps to spare.`,
      last: null,
    }
  }

  const last = history[0]
  const lastText = describeSets(last, unit)
  const reps = last.sets.map((s) => s.reps ?? 0)
  const loggedWeights = last.sets.map((s) => convertWeight(s.weight, last.unit, unit)).filter((w) => w != null)
  const weight = loggedWeights.length ? Math.max(...loggedWeights) : null
  const allTop = reps.length > 0 && reps.every((r) => r >= hi)
  const missedBadly = (sets) => sets.some((s) => (s.reps ?? 0) <= lo - 2)

  if (weight == null) {
    if (allTop) {
      const harder = isHold ? null : nextHarderVariation(exercise.exerciseId, injuries)
      if (harder) return { kind: 'variation', weight: null, text: `You own this one. Next time try ${harder.name}.`, last: lastText }
      return { kind: 'increase', weight: null, text: isHold ? `Add 5-10 sec: aim for ${hi + 5} sec.` : `Add a rep or two: aim for ${hi + 1}-${hi + 2} per set.`, last: lastText }
    }
    return { kind: 'hold', weight: null, text: `Same version. Aim for ${Math.min(hi, Math.max(...reps) + 1)} ${timeWord} on every set.`, last: lastText }
  }

  if (allTop) {
    const next = roundToPlate(weight + INCREMENT[unit], unit)
    return { kind: 'increase', weight: next, text: `Go up to ${next} ${unit} and aim for ${lo}+ reps.`, last: lastText }
  }
  if (missedBadly(last.sets) && history[1] && missedBadly(history[1].sets)) {
    const next = roundToPlate(weight * 0.9, unit)
    return { kind: 'decrease', weight: next, text: `Drop to ${next} ${unit} and rebuild — two tough sessions in a row means it's a bit heavy.`, last: lastText }
  }
  return { kind: 'hold', weight: roundToPlate(weight, unit), text: `Stay at ${roundToPlate(weight, unit)} ${unit} and add a rep to each set.`, last: lastText }
}
