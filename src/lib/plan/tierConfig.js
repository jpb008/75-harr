// Intensity tier config — this is where "intensity" actually changes real
// training variables (sets, rest, progression method, weekly split), not
// just a cosmetic "more exercises" count.
//
// Sourced from: ACSM resistance-training position stand (set/rest/rep
// ranges by goal and training status), NSCA weekly-frequency-by-experience
// guidelines, Schoenfeld/Pelland volume meta-analyses (weekly working-set
// targets), Helms et al. RIR-based RPE (effort targets), and practitioner
// consensus on progression method by experience level
// (linear -> double progression -> RPE/RIR autoregulation).
export const TIER_CONFIG = {
  beginner: {
    sessionsPerWeekRange: [2, 3],
    setsPerExercise: 2,
    restSeconds: { strength: 150, hypertrophy: 90, general: 75, endurance: 60 },
    isolationRestSeconds: 60,
    progressionMethod: 'linear',
    deload: null, // built-in low frequency already provides enough rest
    split: 'full_body',
    weeklySetsPerMuscleGroup: [4, 6],
    maxExercises: 6,
  },
  intermediate: {
    sessionsPerWeekRange: [3, 4],
    setsPerExercise: 3,
    restSeconds: { strength: 165, hypertrophy: 90, general: 75, endurance: 60 },
    isolationRestSeconds: 60,
    progressionMethod: 'double_progression',
    deload: { everyWeeks: 6, durationDays: 6 },
    split: 'upper_lower',
    weeklySetsPerMuscleGroup: [8, 10],
    maxExercises: 7,
  },
  advanced: {
    sessionsPerWeekRange: [4, 6],
    setsPerExercise: 4,
    restSeconds: { strength: 180, hypertrophy: 90, general: 75, endurance: 45 },
    isolationRestSeconds: 60,
    progressionMethod: 'rpe_autoregulation',
    deload: { everyWeeks: 5, durationDays: 7 },
    split: 'push_pull_legs',
    weeklySetsPerMuscleGroup: [12, 16],
    maxExercises: 8,
  },
}

// ACSM: novices train strength in the 8-12 RM zone before moving to
// heavier 1-6 RM work; hypertrophy spans ~6-12 for compounds with higher
// reps for isolation; muscular endurance >12-15.
export const REP_SCHEMES = {
  strength: {
    compound: { beginner: [6, 10], intermediate: [4, 6], advanced: [3, 5] },
    isolation: [8, 12],
  },
  hypertrophy: {
    compound: { beginner: [8, 12], intermediate: [6, 10], advanced: [6, 10] },
    isolation: [10, 15],
  },
  general: {
    compound: { beginner: [8, 12], intermediate: [8, 12], advanced: [8, 12] },
    isolation: [12, 15],
  },
  endurance: {
    compound: { beginner: [12, 15], intermediate: [12, 20], advanced: [15, 20] },
    isolation: [15, 20],
  },
}

export const HOLD_SECONDS = { beginner: [20, 30], intermediate: [30, 45], advanced: [40, 60] }

export const EFFORT_TARGETS = {
  beginner: 'Stop each set with 2-3 good reps still in the tank.',
  intermediate: 'Finish each set with 1-3 reps left in the tank.',
  advanced: 'Main lifts: 1-2 reps in reserve. Accessories can go close to failure on the last set.',
}

export const PROGRESSION_RULES = {
  linear:
    'When you complete every set at the top of the rep range with good form, add weight next session — about 5 lb (2.5 kg) for lower-body lifts and 2.5-5 lb (1-2 kg) for upper-body lifts. For bodyweight moves, add 1-2 reps, then move to the next harder variation once you reach the top of the range.',
  double_progression:
    'Work within the rep range. Once you hit the top of the range on every set, increase the load by the smallest jump available and build back up from the bottom of the range.',
  rpe_autoregulation:
    'Choose loads by effort: most sets at RPE 7-8 (2-3 reps left), the last set of your main lifts at RPE 8-9. If a set feels easier than planned, add weight next time; if it feels harder, hold the weight.',
}

export const TIERS = Object.keys(TIER_CONFIG)

export function isValidTier(tier) {
  return TIERS.includes(tier)
}
