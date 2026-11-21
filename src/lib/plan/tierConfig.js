// Intensity tier config — this is where "intensity" actually changes real
// training variables (sets, rest, progression method, weekly split), not
// just a cosmetic "more exercises" count.
//
// Sourced from: ACSM resistance-training position stand (set/rest/rep
// ranges by goal), NSCA weekly-frequency-by-experience guidelines,
// Schoenfeld/Pelland volume meta-analyses (weekly working-set targets),
// and practitioner consensus on progression method by experience level
// (linear -> double progression -> RPE/RIR autoregulation).
export const TIER_CONFIG = {
  beginner: {
    sessionsPerWeekRange: [2, 3],
    setsPerExercise: 2,
    restSeconds: { strength: 150, hypertrophy: 90, endurance: 60 },
    progressionMethod: 'linear',
    deload: null, // built-in low frequency already provides enough rest
    split: 'full_body',
    weeklySetsPerMuscleGroup: [4, 6],
  },
  intermediate: {
    sessionsPerWeekRange: [3, 4],
    setsPerExercise: 3,
    restSeconds: { strength: 165, hypertrophy: 75, endurance: 60 },
    progressionMethod: 'double_progression',
    deload: { everyWeeks: 6, durationDays: 6 },
    split: 'upper_lower',
    weeklySetsPerMuscleGroup: [8, 10],
  },
  advanced: {
    sessionsPerWeekRange: [4, 6],
    setsPerExercise: 4,
    restSeconds: { strength: 180, hypertrophy: 60, endurance: 45 },
    progressionMethod: 'rpe_autoregulation',
    deload: { everyWeeks: 5, durationDays: 7 },
    split: 'push_pull_legs',
    weeklySetsPerMuscleGroup: [12, 16],
  },
}

export const REP_RANGES = {
  strength: [1, 6],
  hypertrophy: [6, 12],
  endurance: [15, 25], // ">15 reps" per ACSM general-fitness guidance
}

export const TIERS = Object.keys(TIER_CONFIG)

export function isValidTier(tier) {
  return TIERS.includes(tier)
}
