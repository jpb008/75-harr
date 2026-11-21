import { TIER_CONFIG, REP_RANGES } from './tierConfig'
import { exercisesForMuscleGroup, resolveExercise } from './exerciseLibrary'

// Muscle groups are grouped into broader training regions so a session can
// be built as "cover these regions" rather than naming all ten muscle
// groups directly — keeps the split definitions readable.
const REGIONS = {
  upper_push: ['chest', 'shoulders', 'triceps'],
  upper_pull: ['back', 'biceps'],
  lower: ['quads', 'hamstrings', 'glutes', 'calves'],
  core: ['core'],
}

const SPLIT_DAYS = {
  full_body: [{ label: 'Full Body', regions: ['upper_push', 'upper_pull', 'lower', 'core'] }],
  upper_lower: [
    { label: 'Upper Body', regions: ['upper_push', 'upper_pull', 'core'] },
    { label: 'Lower Body', regions: ['lower', 'core'] },
  ],
  push_pull_legs: [
    { label: 'Push', regions: ['upper_push', 'core'] },
    { label: 'Pull', regions: ['upper_pull', 'core'] },
    { label: 'Legs', regions: ['lower', 'core'] },
  ],
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pickRepCategory(primaryGoals) {
  if (primaryGoals.includes('strength')) return 'strength'
  if (primaryGoals.includes('muscleGain')) return 'hypertrophy'
  return 'endurance'
}

function buildSessionExercises(regions, { exercisesPerMuscleGroup, equipment, injuries }) {
  const chosen = []
  const usedIds = new Set()
  for (const region of regions) {
    for (const muscleGroup of REGIONS[region]) {
      const candidates = exercisesForMuscleGroup(muscleGroup)
      let added = 0
      for (const candidate of candidates) {
        if (added >= exercisesPerMuscleGroup) break
        const resolved = resolveExercise(candidate, { equipment, injuries })
        if (usedIds.has(resolved.id)) continue
        usedIds.add(resolved.id)
        chosen.push(resolved)
        added += 1
      }
    }
  }
  return chosen
}

export function generateWorkoutProgram(answers) {
  const tier = answers.meta.intensityTier
  const config = TIER_CONFIG[tier]
  const primaryGoals = answers.fitnessGoals.primary ?? []
  const repCategory = pickRepCategory(primaryGoals)
  const repRange = REP_RANGES[repCategory]
  const restSeconds = config.restSeconds[repCategory]
  const equipment = answers.personal.equipment ?? []
  const injuries = answers.personal.injuries ?? []

  const availableDays = answers.personal.weeklyScheduleAvailableDays ?? []
  const sessionsPerWeek = clamp(
    availableDays.length || config.sessionsPerWeekRange[0],
    config.sessionsPerWeekRange[0],
    config.sessionsPerWeekRange[1]
  )

  const splitDays = SPLIT_DAYS[config.split]
  const exercisesPerMuscleGroup = tier === 'advanced' ? 2 : 1

  const sessions = []
  for (let i = 0; i < sessionsPerWeek; i += 1) {
    const day = splitDays[i % splitDays.length]
    const exercises = buildSessionExercises(day.regions, { exercisesPerMuscleGroup, equipment, injuries }).map((ex) => ({
      exerciseId: ex.id,
      name: ex.name,
      sets: config.setsPerExercise,
      repRange,
      restSeconds,
    }))
    sessions.push({
      dayOfWeek: availableDays[i] ?? null,
      label: day.label,
      exercises,
    })
  }

  const wantsEndurance = primaryGoals.includes('endurance') || primaryGoals.includes('athleticPerformance')
  const wantsGeneralHealth = primaryGoals.includes('generalHealth') || primaryGoals.length === 0
  const cardio =
    wantsEndurance || wantsGeneralHealth
      ? {
          weeklyMinutes: wantsEndurance ? 150 : 150,
          intensityNote: wantsEndurance
            ? 'Lean roughly 80% low-intensity ("zone 2", sustainable at a conversational pace) and 20% higher-intensity work.'
            : 'Moderate-intensity cardio (e.g. brisk walking) most days, or less time at a vigorous effort — either covers the general-health baseline.',
          sequencingNote:
            primaryGoals.includes('strength') || primaryGoals.includes('muscleGain')
              ? 'Do strength work before cardio in the same session, or separate them by a few hours — this protects your strength gains better than cardio first.'
              : null,
        }
      : null

  return {
    tier,
    split: config.split,
    sessionsPerWeek,
    progressionMethod: config.progressionMethod,
    deload: config.deload,
    sessions,
    cardio,
  }
}
