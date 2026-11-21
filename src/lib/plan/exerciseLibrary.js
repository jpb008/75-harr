// Injury adaptation is a lookup against this table's contraindications/
// substitutes — never free-text parsing of what a user typed about their
// injury. `equipment` is the minimal gear an exercise needs; `none` means
// bodyweight-only.
//
// Contraindication guidance sourced from general clinical/coaching
// consensus (Vanderbilt Sports Medicine & HSS shoulder-impingement
// handouts, NASM "Big 3" low-back-safe core work, squat-depth/knee-loading
// reviews) — general, non-diagnostic defaults, not a substitute for a
// clinician's advice on a specific injury.
export const EXERCISES = [
  // Chest
  { id: 'push_up', name: 'Push-up', muscleGroup: 'chest', equipment: 'none', pattern: 'compound', contraindications: ['shoulder'], substitutes: ['incline_push_up'] },
  { id: 'incline_push_up', name: 'Incline push-up (hands elevated)', muscleGroup: 'chest', equipment: 'none', pattern: 'compound', contraindications: [], substitutes: [] },
  { id: 'dumbbell_bench_press', name: 'Dumbbell bench press', muscleGroup: 'chest', equipment: 'dumbbell', pattern: 'compound', contraindications: ['shoulder'], substitutes: ['dumbbell_floor_press'] },
  { id: 'dumbbell_floor_press', name: 'Dumbbell floor press', muscleGroup: 'chest', equipment: 'dumbbell', pattern: 'compound', contraindications: [], substitutes: ['push_up'] },
  { id: 'barbell_bench_press', name: 'Barbell bench press', muscleGroup: 'chest', equipment: 'barbell', pattern: 'compound', contraindications: ['shoulder'], substitutes: ['dumbbell_floor_press'] },
  { id: 'cable_fly', name: 'Cable chest fly', muscleGroup: 'chest', equipment: 'machine', pattern: 'isolation', contraindications: ['shoulder'], substitutes: ['push_up'] },

  // Back
  { id: 'bodyweight_row', name: 'Table/band row', muscleGroup: 'back', equipment: 'none', pattern: 'compound', contraindications: [], substitutes: [] },
  { id: 'band_pulldown', name: 'Band lat pulldown', muscleGroup: 'back', equipment: 'bands', pattern: 'compound', contraindications: [], substitutes: ['bodyweight_row'] },
  { id: 'dumbbell_row', name: 'Dumbbell row', muscleGroup: 'back', equipment: 'dumbbell', pattern: 'compound', contraindications: [], substitutes: ['bodyweight_row'] },
  { id: 'lat_pulldown_machine', name: 'Lat pulldown (machine)', muscleGroup: 'back', equipment: 'machine', pattern: 'compound', contraindications: [], substitutes: ['dumbbell_row'] },
  { id: 'barbell_row', name: 'Barbell row', muscleGroup: 'back', equipment: 'barbell', pattern: 'compound', contraindications: ['low_back'], substitutes: ['dumbbell_row'] },
  { id: 'deadlift', name: 'Deadlift', muscleGroup: 'back', equipment: 'barbell', pattern: 'compound', contraindications: ['low_back'], substitutes: ['dumbbell_row'] },

  // Shoulders
  { id: 'pike_push_up', name: 'Pike push-up', muscleGroup: 'shoulders', equipment: 'none', pattern: 'compound', contraindications: ['shoulder'], substitutes: ['band_lateral_raise'] },
  { id: 'band_lateral_raise', name: 'Band lateral raise', muscleGroup: 'shoulders', equipment: 'bands', pattern: 'isolation', contraindications: [], substitutes: [] },
  { id: 'dumbbell_shoulder_press', name: 'Dumbbell shoulder press', muscleGroup: 'shoulders', equipment: 'dumbbell', pattern: 'compound', contraindications: ['shoulder'], substitutes: ['landmine_press', 'band_lateral_raise'] },
  { id: 'landmine_press', name: 'Landmine press (neutral angle)', muscleGroup: 'shoulders', equipment: 'barbell', pattern: 'compound', contraindications: [], substitutes: ['band_lateral_raise'] },
  { id: 'overhead_press', name: 'Barbell overhead press', muscleGroup: 'shoulders', equipment: 'barbell', pattern: 'compound', contraindications: ['shoulder'], substitutes: ['landmine_press'] },

  // Quads / lower body (squat pattern)
  { id: 'bodyweight_squat', name: 'Bodyweight squat', muscleGroup: 'quads', equipment: 'none', pattern: 'compound', contraindications: [], substitutes: ['box_squat'] },
  { id: 'box_squat', name: 'Box squat (depth-limited)', muscleGroup: 'quads', equipment: 'none', pattern: 'compound', contraindications: [], substitutes: [] },
  { id: 'goblet_squat', name: 'Goblet squat', muscleGroup: 'quads', equipment: 'dumbbell', pattern: 'compound', contraindications: ['knee'], substitutes: ['box_squat'] },
  { id: 'leg_press', name: 'Leg press (machine)', muscleGroup: 'quads', equipment: 'machine', pattern: 'compound', contraindications: [], substitutes: ['goblet_squat'] },
  { id: 'barbell_squat', name: 'Barbell back squat', muscleGroup: 'quads', equipment: 'barbell', pattern: 'compound', contraindications: ['knee', 'low_back'], substitutes: ['box_squat', 'leg_press'] },

  // Hamstrings / glutes (hinge pattern)
  { id: 'glute_bridge', name: 'Glute bridge', muscleGroup: 'glutes', equipment: 'none', pattern: 'compound', contraindications: [], substitutes: [] },
  { id: 'single_leg_glute_bridge', name: 'Single-leg glute bridge', muscleGroup: 'glutes', equipment: 'none', pattern: 'compound', contraindications: [], substitutes: ['glute_bridge'] },
  { id: 'dumbbell_romanian_deadlift', name: 'Dumbbell Romanian deadlift', muscleGroup: 'hamstrings', equipment: 'dumbbell', pattern: 'compound', contraindications: ['low_back'], substitutes: ['glute_bridge'] },
  { id: 'hip_thrust_machine', name: 'Hip thrust (machine)', muscleGroup: 'glutes', equipment: 'machine', pattern: 'compound', contraindications: [], substitutes: ['glute_bridge'] },
  { id: 'barbell_romanian_deadlift', name: 'Barbell Romanian deadlift', muscleGroup: 'hamstrings', equipment: 'barbell', pattern: 'compound', contraindications: ['low_back'], substitutes: ['dumbbell_romanian_deadlift', 'glute_bridge'] },

  // Core (low-back-safe options per NASM "Big 3": bird dog, dead bug, side plank)
  { id: 'dead_bug', name: 'Dead bug', muscleGroup: 'core', equipment: 'none', pattern: 'isolation', contraindications: [], substitutes: [] },
  { id: 'bird_dog', name: 'Bird dog', muscleGroup: 'core', equipment: 'none', pattern: 'isolation', contraindications: [], substitutes: [] },
  { id: 'side_plank', name: 'Side plank', muscleGroup: 'core', equipment: 'none', pattern: 'isolation', contraindications: [], substitutes: [] },
  { id: 'plank', name: 'Plank', muscleGroup: 'core', equipment: 'none', pattern: 'isolation', contraindications: [], substitutes: ['dead_bug'] },
  { id: 'sit_up', name: 'Sit-up', muscleGroup: 'core', equipment: 'none', pattern: 'isolation', contraindications: ['low_back'], substitutes: ['dead_bug', 'bird_dog'] },
  { id: 'weighted_russian_twist', name: 'Weighted Russian twist', muscleGroup: 'core', equipment: 'dumbbell', pattern: 'isolation', contraindications: ['low_back'], substitutes: ['side_plank'] },

  // Arms
  { id: 'bodyweight_dip', name: 'Bench dip', muscleGroup: 'triceps', equipment: 'none', pattern: 'isolation', contraindications: ['shoulder'], substitutes: ['triceps_band_extension'] },
  { id: 'triceps_band_extension', name: 'Band triceps extension', muscleGroup: 'triceps', equipment: 'bands', pattern: 'isolation', contraindications: [], substitutes: [] },
  { id: 'dumbbell_curl', name: 'Dumbbell biceps curl', muscleGroup: 'biceps', equipment: 'dumbbell', pattern: 'isolation', contraindications: [], substitutes: ['band_curl'] },
  { id: 'band_curl', name: 'Band biceps curl', muscleGroup: 'biceps', equipment: 'bands', pattern: 'isolation', contraindications: [], substitutes: [] },

  // Calves
  { id: 'calf_raise', name: 'Standing calf raise', muscleGroup: 'calves', equipment: 'none', pattern: 'isolation', contraindications: [], substitutes: [] },
]

export const MUSCLE_GROUPS = [
  'chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'core', 'biceps', 'triceps', 'calves',
]

const EQUIPMENT_RANK = { none: 0, bands: 1, dumbbell: 2, machine: 3, barbell: 3 }

function equipmentAvailable(exerciseEquipment, userEquipment) {
  if (exerciseEquipment === 'none') return true
  return userEquipment.includes(exerciseEquipment)
}

// Resolves an exercise choice to one the user can actually do: skips it (and
// walks its substitute chain) if it's contraindicated for a stated injury or
// needs equipment the user doesn't have. Falls back to the first bodyweight
// exercise for that muscle group if the whole chain comes up empty.
export function resolveExercise(exercise, { equipment, injuries }) {
  const seen = new Set()
  let candidate = exercise
  while (candidate && !seen.has(candidate.id)) {
    seen.add(candidate.id)
    const blockedByInjury = candidate.contraindications.some((tag) => injuries.includes(tag))
    const blockedByEquipment = !equipmentAvailable(candidate.equipment, equipment)
    if (!blockedByInjury && !blockedByEquipment) return candidate
    const nextId = candidate.substitutes.find((id) => !seen.has(id))
    candidate = EXERCISES.find((e) => e.id === nextId) ?? null
  }
  return (
    EXERCISES.find(
      (e) => e.muscleGroup === exercise.muscleGroup && e.equipment === 'none' && !e.contraindications.some((tag) => injuries.includes(tag))
    ) ?? exercise
  )
}

export function exercisesForMuscleGroup(muscleGroup) {
  return EXERCISES.filter((e) => e.muscleGroup === muscleGroup).sort((a, b) =>
    EQUIPMENT_RANK[a.equipment] - EQUIPMENT_RANK[b.equipment]
  )
}
