// Every exercise fills a movement "slot" (squat, hinge, horizontal push…).
// Sessions are built from slots, then each slot is filled with the best
// exercise the user can actually do: equipment they have, nothing
// contraindicated by a selected injury, and — for bodyweight moves — a
// progression level matched to their fitness-test answers.
//
// requires: ALL listed equipment needed. anyOf: at least ONE needed.
// Neither = bodyweight. bwLevel: 1 (easiest) .. 4 (hardest) bodyweight
// progression within a slot. skill: 1 simple .. 3 technical.
//
// Injury contraindications are general, non-diagnostic coaching defaults
// (shoulder-impingement, low-back-safe core, knee-loading guidance), not a
// substitute for a clinician's advice on a specific injury.

export const SLOT_LABELS = {
  squat: 'Squat',
  hinge: 'Hip hinge',
  singleLeg: 'Single-leg',
  hamstringCurl: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  horizontalPush: 'Chest press',
  verticalPush: 'Overhead press',
  chestAccessory: 'Chest',
  shoulderAccessory: 'Side delts',
  rearDelt: 'Rear delts',
  triceps: 'Triceps',
  verticalPull: 'Vertical pull',
  horizontalPull: 'Row',
  biceps: 'Biceps',
  coreAntiExtension: 'Core',
  coreLateral: 'Core stability',
  coreFlexion: 'Abs',
}

// If no exercise fits a slot (equipment/injuries), try these instead.
export const SLOT_FALLBACKS = {
  hinge: ['glutes'],
  verticalPull: ['horizontalPull'],
  verticalPush: ['shoulderAccessory'],
  hamstringCurl: ['glutes'],
  chestAccessory: ['horizontalPush'],
  calves: [],
}

export const EXERCISES = [
  // ── Squat ───────────────────────────────────────────────────────────
  { id: 'box_squat', name: 'Box squat (sit to a chair or box)', slot: 'squat', bwLevel: 1, skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Feet shoulder-width, toes slightly out', 'Sit back until you lightly touch the box', 'Drive through your whole foot to stand'], mistake: 'Plopping down onto the box instead of controlling the descent.' },
  { id: 'bodyweight_squat', name: 'Bodyweight squat', slot: 'squat', bwLevel: 2, skill: 1, pattern: 'compound', contraindications: ['knee'],
    cues: ['Chest up, brace your core', 'Knees track over your toes', 'Go as low as you can with a flat back'], mistake: 'Letting your knees cave inward.' },
  { id: 'tempo_squat', name: 'Tempo squat (3 sec down)', slot: 'squat', bwLevel: 3, skill: 1, pattern: 'compound', contraindications: ['knee'],
    cues: ['Count 3 seconds on the way down', 'Pause 1 second at the bottom', 'Stand up quickly'], mistake: 'Rushing the lowering phase.' },
  { id: 'jump_squat', name: 'Jump squat', slot: 'squat', bwLevel: 4, skill: 2, pattern: 'compound', contraindications: ['knee', 'ankle', 'low_back'],
    cues: ['Quarter-to-half squat, then jump', 'Land softly through the balls of your feet', 'Reset between reps'], mistake: 'Landing stiff-legged.' },
  { id: 'goblet_squat', name: 'Goblet squat', slot: 'squat', anyOf: ['dumbbell', 'kettlebell'], skill: 1, pattern: 'compound', contraindications: ['knee'],
    cues: ['Hold the weight at your chest, elbows down', 'Sit between your heels', 'Keep the weight close as you stand'], mistake: 'Letting the chest fall forward.' },
  { id: 'leg_press', name: 'Leg press', slot: 'squat', requires: ['machine'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Feet mid-platform, shoulder-width', 'Lower until knees are about 90°', 'Keep your lower back on the pad'], mistake: 'Locking the knees hard at the top.' },
  { id: 'barbell_squat', name: 'Barbell back squat', slot: 'squat', requires: ['barbell'], skill: 3, pattern: 'compound', contraindications: ['knee', 'low_back'],
    cues: ['Bar on upper back, grip tight', 'Big breath and brace before each rep', 'Hips and chest rise together'], mistake: 'Losing your brace at the bottom.' },
  { id: 'band_squat', name: 'Banded squat', slot: 'squat', requires: ['bands'], skill: 1, pattern: 'compound', contraindications: ['knee'],
    cues: ['Stand on the band, handles at shoulders', 'Sit down and back', 'Push the floor away'], mistake: 'Rising onto your toes.' },

  // ── Hip hinge ───────────────────────────────────────────────────────
  { id: 'hip_hinge_drill', name: 'Hip hinge drill (hands on hips)', slot: 'hinge', bwLevel: 1, skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Soft knees, push hips straight back', 'Flat back, chest proud', 'Squeeze glutes to stand'], mistake: 'Rounding the lower back.' },
  { id: 'single_leg_rdl_bw', name: 'Single-leg Romanian deadlift (bodyweight)', slot: 'hinge', bwLevel: 2, skill: 2, pattern: 'compound', unit: 'perSide', contraindications: ['ankle'],
    cues: ['Hinge on one leg, other leg reaches back', 'Hips stay square to the floor', 'Hold a wall if needed for balance'], mistake: 'Rotating the hips open.' },
  { id: 'band_pull_through', name: 'Band pull-through', slot: 'hinge', requires: ['bands'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Anchor the band low behind you', 'Hinge back, band between your legs', 'Snap hips forward and squeeze glutes'], mistake: 'Squatting instead of hinging.' },
  { id: 'cable_pull_through', name: 'Cable pull-through', slot: 'hinge', requires: ['cable'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Rope between your legs, face away from the stack', 'Hinge back with a flat back', 'Drive hips through to stand tall'], mistake: 'Pulling with the arms.' },
  { id: 'dumbbell_romanian_deadlift', name: 'Dumbbell Romanian deadlift', slot: 'hinge', anyOf: ['dumbbell', 'kettlebell'], skill: 2, pattern: 'compound', contraindications: ['low_back'],
    cues: ['Weights slide down the front of your legs', 'Stop when hamstrings are stretched', 'Squeeze glutes to stand'], mistake: 'Turning it into a squat by bending the knees a lot.' },
  { id: 'kettlebell_swing', name: 'Kettlebell swing', slot: 'hinge', requires: ['kettlebell'], skill: 3, pattern: 'compound', contraindications: ['low_back', 'shoulder'],
    cues: ['Hike the bell back like a football snap', 'Snap your hips forward — arms just guide', 'Stand tall and brace at the top'], mistake: 'Lifting the bell with your arms or squatting it.' },
  { id: 'barbell_romanian_deadlift', name: 'Barbell Romanian deadlift', slot: 'hinge', requires: ['barbell'], skill: 2, pattern: 'compound', contraindications: ['low_back'],
    cues: ['Start standing, bar against thighs', 'Push hips back, bar stays close', 'Lower to mid-shin with a flat back'], mistake: 'Letting the bar drift away from your legs.' },
  { id: 'deadlift', name: 'Deadlift', slot: 'hinge', requires: ['barbell'], skill: 3, pattern: 'compound', contraindications: ['low_back'],
    cues: ['Bar over mid-foot, shins touch the bar', 'Pull the slack out, chest up, brace', 'Push the floor away, lock out with glutes'], mistake: 'Jerking the bar off the floor with a rounded back.' },

  // ── Single-leg ──────────────────────────────────────────────────────
  { id: 'split_squat', name: 'Split squat', slot: 'singleLeg', bwLevel: 1, skill: 1, pattern: 'compound', unit: 'perSide', contraindications: ['knee'],
    cues: ['Long staggered stance', 'Drop the back knee straight down', 'Front heel stays planted'], mistake: 'Stance too short so the front heel lifts.' },
  { id: 'step_up', name: 'Step-up (low step)', slot: 'singleLeg', bwLevel: 1, skill: 1, pattern: 'compound', unit: 'perSide', contraindications: [],
    cues: ['Whole foot on the step', 'Drive through the top leg, not the bottom one', 'Lower with control'], mistake: 'Pushing off the back foot.' },
  { id: 'reverse_lunge', name: 'Reverse lunge', slot: 'singleLeg', bwLevel: 2, skill: 1, pattern: 'compound', unit: 'perSide', contraindications: ['ankle'],
    cues: ['Step back, drop the back knee', 'Torso tall', 'Push through the front heel to return'], mistake: 'Front knee collapsing inward.' },
  { id: 'bulgarian_split_squat', name: 'Bulgarian split squat (rear foot on chair)', slot: 'singleLeg', bwLevel: 3, skill: 2, pattern: 'compound', unit: 'perSide', contraindications: ['knee', 'ankle'],
    cues: ['Rear foot laces-down on a chair or bench', 'Lower straight down', 'Most weight on the front leg'], mistake: 'Standing too close to the bench.' },
  { id: 'dumbbell_reverse_lunge', name: 'Dumbbell reverse lunge', slot: 'singleLeg', anyOf: ['dumbbell', 'kettlebell'], skill: 1, pattern: 'compound', unit: 'perSide', contraindications: ['ankle'],
    cues: ['Weights at your sides', 'Step back and lower under control', 'Drive up through the front foot'], mistake: 'Leaning forward over the front knee.' },
  { id: 'dumbbell_step_up', name: 'Dumbbell step-up', slot: 'singleLeg', anyOf: ['dumbbell', 'kettlebell'], skill: 1, pattern: 'compound', unit: 'perSide', contraindications: [],
    cues: ['Knee-height step or bench', 'Stand all the way up on top', 'Lower slowly'], mistake: 'Bouncing off the bottom leg.' },
  { id: 'dumbbell_bulgarian_split_squat', name: 'Dumbbell Bulgarian split squat', slot: 'singleLeg', anyOf: ['dumbbell', 'kettlebell'], skill: 2, pattern: 'compound', unit: 'perSide', contraindications: ['knee', 'ankle'],
    cues: ['Rear foot on bench, weights at sides', 'Lower until front thigh is near parallel', 'Stay tall'], mistake: 'Rushing reps and losing balance.' },

  // ── Hamstring curl ──────────────────────────────────────────────────
  { id: 'slider_leg_curl', name: 'Slider / towel hamstring curl', slot: 'hamstringCurl', bwLevel: 2, skill: 2, pattern: 'isolation', contraindications: ['knee'],
    cues: ['Lie on your back, heels on a towel or sliders', 'Lift hips into a bridge', 'Curl heels in, then slide out slowly'], mistake: 'Letting the hips sag.' },
  { id: 'nordic_curl', name: 'Nordic curl (assisted)', slot: 'hamstringCurl', bwLevel: 4, skill: 2, pattern: 'isolation', contraindications: ['knee'],
    cues: ['Kneel with heels anchored', 'Lower forward as slowly as you can', 'Catch yourself with your hands, push back up'], mistake: 'Bending at the hips instead of the knees.' },
  { id: 'band_leg_curl', name: 'Band leg curl', slot: 'hamstringCurl', requires: ['bands'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Lie face-down, band around your ankle', 'Curl heel toward your glutes', 'Lower slowly'], mistake: 'Arching the lower back.' },
  { id: 'lying_leg_curl', name: 'Leg curl machine', slot: 'hamstringCurl', anyOf: ['machine'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Knees line up with the machine pivot', 'Curl all the way in', 'Lower over 2-3 seconds'], mistake: 'Lifting the hips off the pad.' },

  // ── Glutes ──────────────────────────────────────────────────────────
  { id: 'glute_bridge', name: 'Glute bridge', slot: 'glutes', bwLevel: 1, skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Feet flat, knees bent', 'Drive hips up by squeezing glutes', 'Pause 1 second at the top'], mistake: 'Arching the lower back instead of using glutes.' },
  { id: 'single_leg_glute_bridge', name: 'Single-leg glute bridge', slot: 'glutes', bwLevel: 2, skill: 1, pattern: 'compound', unit: 'perSide', contraindications: [],
    cues: ['One foot planted, other leg straight', 'Keep hips level', 'Squeeze at the top'], mistake: 'Hips tilting to one side.' },
  { id: 'band_lateral_walk', name: 'Band lateral walk', slot: 'glutes', requires: ['bands'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Mini-band above knees or at ankles', 'Half-squat stance', 'Step sideways, keep tension on the band'], mistake: 'Feet coming together between steps.' },
  { id: 'dumbbell_hip_thrust', name: 'Dumbbell hip thrust', slot: 'glutes', requires: ['bench'], anyOf: ['dumbbell', 'kettlebell'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Upper back on a bench, weight on hips', 'Chin tucked, ribs down', 'Drive hips to full lockout'], mistake: 'Hyperextending the lower back at the top.' },
  { id: 'barbell_hip_thrust', name: 'Barbell hip thrust', slot: 'glutes', requires: ['barbell', 'bench'], skill: 2, pattern: 'compound', contraindications: [],
    cues: ['Pad the bar over your hips', 'Shins vertical at the top', 'Squeeze glutes hard for 1 second'], mistake: 'Pushing through the toes.' },
  { id: 'hip_thrust_machine', name: 'Hip thrust machine', slot: 'glutes', requires: ['machine'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Pad across your hips', 'Push through heels', 'Pause at the top'], mistake: 'Rushing reps without the pause.' },
  { id: 'cable_kickback', name: 'Cable glute kickback', slot: 'glutes', requires: ['cable'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Ankle strap, slight forward lean', 'Kick back and slightly out', 'Control the return'], mistake: 'Swinging from the lower back.' },

  // ── Calves ──────────────────────────────────────────────────────────
  { id: 'calf_raise', name: 'Standing calf raise', slot: 'calves', bwLevel: 1, skill: 1, pattern: 'isolation', contraindications: ['ankle'],
    cues: ['Balls of feet on a step if you have one', 'Full stretch at the bottom', 'Pause at the top'], mistake: 'Bouncing through tiny reps.' },
  { id: 'single_leg_calf_raise', name: 'Single-leg calf raise', slot: 'calves', bwLevel: 3, skill: 1, pattern: 'isolation', unit: 'perSide', contraindications: ['ankle'],
    cues: ['Hold a wall for balance', 'Full range of motion', 'Slow on the way down'], mistake: 'Bending the knee to cheat.' },
  { id: 'dumbbell_calf_raise', name: 'Dumbbell calf raise', slot: 'calves', anyOf: ['dumbbell', 'kettlebell'], skill: 1, pattern: 'isolation', contraindications: ['ankle'],
    cues: ['Weight in one or both hands', 'Rise as high as possible', 'Lower to a full stretch'], mistake: 'Cutting the range short.' },
  { id: 'seated_calf_raise', name: 'Seated calf raise', slot: 'calves', requires: ['machine'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Pad just above the knees', 'Full stretch, full squeeze', 'Pause each rep'], mistake: 'Using momentum.' },

  // ── Horizontal push ─────────────────────────────────────────────────
  { id: 'wall_push_up', name: 'Wall push-up', slot: 'horizontalPush', bwLevel: 1, skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Hands on wall at chest height', 'Body in a straight line', 'Chest to the wall, push away'], mistake: 'Hips sagging toward the wall.' },
  { id: 'incline_push_up', name: 'Incline push-up (hands on a bench or counter)', slot: 'horizontalPush', bwLevel: 2, skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Hands slightly wider than shoulders', 'Squeeze glutes, straight body', 'Lower chest to the edge'], mistake: 'Elbows flaring straight out to the sides.' },
  { id: 'push_up', name: 'Push-up', slot: 'horizontalPush', bwLevel: 3, skill: 1, pattern: 'compound', contraindications: ['shoulder', 'wrist'],
    cues: ['Elbows about 45° from your body', 'Brace like a plank', 'Chest touches the floor'], mistake: 'Half reps and a sagging midsection.' },
  { id: 'decline_push_up', name: 'Decline push-up (feet elevated)', slot: 'horizontalPush', bwLevel: 4, skill: 2, pattern: 'compound', contraindications: ['shoulder', 'wrist'],
    cues: ['Feet on a step or chair', 'Keep the plank tight', 'Full range every rep'], mistake: 'Piking the hips up.' },
  { id: 'band_chest_press', name: 'Band chest press', slot: 'horizontalPush', requires: ['bands'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Anchor band behind you at chest height', 'Staggered stance', 'Press forward, control back'], mistake: 'Shrugging the shoulders up.' },
  { id: 'dumbbell_floor_press', name: 'Dumbbell floor press', slot: 'horizontalPush', anyOf: ['dumbbell', 'kettlebell'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Lie on the floor, knees bent', 'Lower until upper arms touch the floor', 'Press up and slightly in'], mistake: 'Bouncing elbows off the floor.' },
  { id: 'dumbbell_bench_press', name: 'Dumbbell bench press', slot: 'horizontalPush', requires: ['dumbbell', 'bench'], skill: 2, pattern: 'compound', contraindications: ['shoulder'],
    cues: ['Shoulder blades pinched back and down', 'Lower to chest level', 'Press up, dumbbells nearly touch'], mistake: 'Elbows flared at 90°.' },
  { id: 'machine_chest_press', name: 'Machine chest press', slot: 'horizontalPush', requires: ['machine'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Handles at mid-chest height', 'Back flat on the pad', 'Press without locking out hard'], mistake: 'Seat set too low or high.' },
  { id: 'barbell_bench_press', name: 'Barbell bench press', slot: 'horizontalPush', requires: ['barbell', 'bench'], skill: 3, pattern: 'compound', contraindications: ['shoulder'],
    cues: ['Eyes under the bar, feet planted', 'Touch lower chest, elbows tucked slightly', 'Press up and back over shoulders'], mistake: 'Bouncing the bar off your chest.' },

  // ── Vertical push ───────────────────────────────────────────────────
  { id: 'pike_push_up', name: 'Pike push-up', slot: 'verticalPush', bwLevel: 3, skill: 2, pattern: 'compound', contraindications: ['shoulder', 'wrist', 'neck'],
    cues: ['Hips high, body in an upside-down V', 'Lower the top of your head toward the floor', 'Press back up'], mistake: 'Turning it into a regular push-up.' },
  { id: 'band_overhead_press', name: 'Band overhead press', slot: 'verticalPush', requires: ['bands'], skill: 1, pattern: 'compound', contraindications: ['shoulder'],
    cues: ['Stand on the band', 'Press straight overhead', 'Ribs down, glutes tight'], mistake: 'Leaning back to finish the rep.' },
  { id: 'dumbbell_shoulder_press', name: 'Dumbbell shoulder press', slot: 'verticalPush', anyOf: ['dumbbell'], skill: 1, pattern: 'compound', contraindications: ['shoulder'],
    cues: ['Weights at shoulder height, palms forward or in', 'Press up until arms are straight', 'Lower to chin level'], mistake: 'Arching the lower back.' },
  { id: 'kettlebell_press', name: 'Kettlebell overhead press', slot: 'verticalPush', requires: ['kettlebell'], skill: 2, pattern: 'compound', contraindications: ['shoulder'],
    cues: ['Bell in the rack position', 'Press up in a slight arc', 'Squeeze glutes to stay stable'], mistake: 'Wrist bent back under the bell.' },
  { id: 'landmine_press', name: 'Landmine press', slot: 'verticalPush', requires: ['barbell'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Bar end in a corner or landmine', 'Press up and forward at an angle', 'Half-kneeling or standing'], mistake: 'Twisting the torso to press.' },
  { id: 'machine_shoulder_press', name: 'Machine shoulder press', slot: 'verticalPush', requires: ['machine'], skill: 1, pattern: 'compound', contraindications: ['shoulder'],
    cues: ['Handles at shoulder height', 'Back against the pad', 'Press up smoothly'], mistake: 'Shrugging toward the ears.' },
  { id: 'overhead_press', name: 'Barbell overhead press', slot: 'verticalPush', requires: ['barbell'], skill: 3, pattern: 'compound', contraindications: ['shoulder', 'low_back'],
    cues: ['Bar on front of shoulders', 'Head moves back as the bar passes', 'Lock out with bar over mid-foot'], mistake: 'Leaning way back to grind it up.' },

  // ── Chest accessory ─────────────────────────────────────────────────
  { id: 'dumbbell_squeeze_press', name: 'Dumbbell squeeze press', slot: 'chestAccessory', anyOf: ['dumbbell'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Press dumbbells together the whole time', 'Lower to chest', 'Press up slowly'], mistake: 'Letting the dumbbells drift apart.' },
  { id: 'band_chest_fly', name: 'Band chest fly', slot: 'chestAccessory', requires: ['bands'], skill: 1, pattern: 'isolation', contraindications: ['shoulder'],
    cues: ['Band anchored behind you', 'Slight bend in elbows', 'Hug a big tree'], mistake: 'Turning it into a press.' },
  { id: 'dumbbell_fly', name: 'Dumbbell fly', slot: 'chestAccessory', requires: ['dumbbell', 'bench'], skill: 2, pattern: 'isolation', contraindications: ['shoulder'],
    cues: ['Light weights, soft elbows', 'Open until you feel a chest stretch', 'Squeeze back together'], mistake: 'Going too heavy and too deep.' },
  { id: 'cable_fly', name: 'Cable chest fly', slot: 'chestAccessory', requires: ['cable'], skill: 1, pattern: 'isolation', contraindications: ['shoulder'],
    cues: ['Step forward from the cables', 'Arms sweep together in front', 'Slow return'], mistake: 'Bending the elbows more as you go.' },
  { id: 'pec_deck', name: 'Pec deck machine', slot: 'chestAccessory', requires: ['machine'], skill: 1, pattern: 'isolation', contraindications: ['shoulder'],
    cues: ['Handles at chest height', 'Squeeze together', 'Control the stretch'], mistake: 'Letting the weight yank your arms back.' },

  // ── Side delts ──────────────────────────────────────────────────────
  { id: 'prone_y_raise', name: 'Prone Y raise (lying face-down)', slot: 'shoulderAccessory', bwLevel: 1, skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Lie face-down, arms overhead in a Y', 'Thumbs up, lift arms off the floor', 'Hold 2 seconds'], mistake: 'Lifting with the lower back.' },
  { id: 'band_lateral_raise', name: 'Band lateral raise', slot: 'shoulderAccessory', requires: ['bands'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Stand on the band', 'Raise arms out to shoulder height', 'Lead with the elbows'], mistake: 'Shrugging the traps.' },
  { id: 'dumbbell_lateral_raise', name: 'Dumbbell lateral raise', slot: 'shoulderAccessory', anyOf: ['dumbbell'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Light weights, slight forward lean', 'Raise to shoulder height', 'Lower over 2-3 seconds'], mistake: 'Swinging the weights up.' },
  { id: 'cable_lateral_raise', name: 'Cable lateral raise', slot: 'shoulderAccessory', requires: ['cable'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Cable low, handle in the far hand', 'Raise out to the side', 'Constant tension'], mistake: 'Leaning away too much.' },

  // ── Rear delts ──────────────────────────────────────────────────────
  { id: 'prone_t_raise', name: 'Prone T raise', slot: 'rearDelt', bwLevel: 1, skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Lie face-down, arms out to the sides', 'Squeeze shoulder blades together', 'Lift and hold 2 seconds'], mistake: 'Using the neck.' },
  { id: 'band_pull_apart', name: 'Band pull-apart', slot: 'rearDelt', requires: ['bands'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Arms straight in front, band in hands', 'Pull apart to your chest', 'Control back'], mistake: 'Arching back to finish.' },
  { id: 'dumbbell_rear_delt_fly', name: 'Dumbbell rear-delt fly', slot: 'rearDelt', anyOf: ['dumbbell'], skill: 1, pattern: 'isolation', contraindications: ['low_back'],
    cues: ['Hinge forward, flat back', 'Raise arms out wide', 'Pinky leads'], mistake: 'Rowing instead of flying.' },
  { id: 'face_pull', name: 'Cable face pull', slot: 'rearDelt', requires: ['cable'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Rope at face height', 'Pull toward your forehead, elbows high', 'Rotate hands back at the end'], mistake: 'Leaning back to move more weight.' },

  // ── Triceps ─────────────────────────────────────────────────────────
  { id: 'close_grip_incline_push_up', name: 'Close-grip incline push-up', slot: 'triceps', bwLevel: 2, skill: 1, pattern: 'isolation', contraindications: ['wrist'],
    cues: ['Hands just inside shoulder width on a bench', 'Elbows brush your sides', 'Lower and press'], mistake: 'Elbows flaring out.' },
  { id: 'bench_dip', name: 'Bench dip', slot: 'triceps', bwLevel: 3, skill: 1, pattern: 'isolation', contraindications: ['shoulder', 'wrist', 'elbow'],
    cues: ['Hands on a bench behind you', 'Lower until elbows are about 90°', 'Press up through the palms'], mistake: 'Dropping too deep and straining the shoulders.' },
  { id: 'diamond_push_up', name: 'Diamond push-up', slot: 'triceps', bwLevel: 4, skill: 1, pattern: 'isolation', contraindications: ['shoulder', 'wrist', 'elbow'],
    cues: ['Hands together under your chest', 'Elbows track back', 'Full range'], mistake: 'Sagging hips.' },
  { id: 'triceps_band_extension', name: 'Band triceps pushdown', slot: 'triceps', requires: ['bands'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Anchor the band high', 'Elbows pinned at your sides', 'Push down until arms are straight'], mistake: 'Elbows drifting forward.' },
  { id: 'dumbbell_overhead_extension', name: 'Dumbbell overhead triceps extension', slot: 'triceps', anyOf: ['dumbbell'], skill: 1, pattern: 'isolation', contraindications: ['shoulder', 'elbow'],
    cues: ['Hold one dumbbell overhead with both hands', 'Lower behind your head', 'Extend up without moving the elbows'], mistake: 'Elbows flaring wide.' },
  { id: 'cable_pushdown', name: 'Cable triceps pushdown', slot: 'triceps', requires: ['cable'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Elbows locked at your sides', 'Push to full extension', 'Slow return'], mistake: 'Leaning over the bar.' },

  // ── Vertical pull ───────────────────────────────────────────────────
  { id: 'negative_pull_up', name: 'Negative pull-up (jump up, lower slowly)', slot: 'verticalPull', requires: ['pullupBar'], bwLevel: 2, skill: 1, pattern: 'compound', contraindications: ['shoulder', 'elbow'],
    cues: ['Jump or step to the top position', 'Lower over 3-5 seconds', 'Reset and repeat'], mistake: 'Dropping fast instead of controlling the descent.' },
  { id: 'band_assisted_pull_up', name: 'Band-assisted pull-up', slot: 'verticalPull', requires: ['pullupBar', 'bands'], bwLevel: 2, skill: 1, pattern: 'compound', contraindications: ['shoulder'],
    cues: ['Loop band on the bar, knee or foot in it', 'Pull chest toward the bar', 'Lower all the way'], mistake: 'Half reps at the top.' },
  { id: 'pull_up', name: 'Pull-up', slot: 'verticalPull', requires: ['pullupBar'], bwLevel: 3, skill: 2, pattern: 'compound', contraindications: ['shoulder', 'elbow'],
    cues: ['Start from a dead hang', 'Pull elbows down to your ribs', 'Chin over the bar'], mistake: 'Kicking and swinging.' },
  { id: 'chin_up', name: 'Chin-up (palms facing you)', slot: 'verticalPull', requires: ['pullupBar'], bwLevel: 3, skill: 1, pattern: 'compound', contraindications: ['shoulder', 'elbow'],
    cues: ['Shoulder-width underhand grip', 'Chest to the bar', 'Lower fully'], mistake: 'Craning the neck to clear the bar.' },
  { id: 'band_lat_pulldown', name: 'Band lat pulldown', slot: 'verticalPull', requires: ['bands'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Anchor band overhead (door or bar)', 'Kneel and pull elbows down', 'Squeeze lats at the bottom'], mistake: 'Pulling with the hands instead of elbows.' },
  { id: 'lat_pulldown_machine', name: 'Lat pulldown', slot: 'verticalPull', anyOf: ['machine', 'cable'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Thighs under the pad', 'Pull the bar to upper chest', 'Control it back up'], mistake: 'Leaning way back.' },

  // ── Horizontal pull ─────────────────────────────────────────────────
  { id: 'doorframe_row', name: 'Towel door row', slot: 'horizontalPull', bwLevel: 1, skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Towel around a sturdy closed door handle', 'Lean back, arms straight', 'Row your chest to your hands'], mistake: 'Using a door that can swing open.' },
  { id: 'bodyweight_row', name: 'Inverted row (under a sturdy table)', slot: 'horizontalPull', bwLevel: 2, skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Grip the edge, body straight', 'Pull chest to the edge', 'Lower slowly'], mistake: 'Hips sagging.' },
  { id: 'band_row', name: 'Band seated row', slot: 'horizontalPull', requires: ['bands'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Band around your feet', 'Sit tall, pull elbows back', 'Squeeze shoulder blades'], mistake: 'Rounding forward on the return.' },
  { id: 'dumbbell_row', name: 'One-arm dumbbell row', slot: 'horizontalPull', anyOf: ['dumbbell', 'kettlebell'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Hand and knee on a bench or chair', 'Pull the weight to your hip', 'Flat back'], mistake: 'Twisting the torso to lift.' },
  { id: 'chest_supported_row', name: 'Chest-supported dumbbell row', slot: 'horizontalPull', requires: ['dumbbell', 'bench'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Lie chest-down on an incline bench', 'Row both dumbbells', 'Pause at the top'], mistake: 'Shrugging instead of rowing.' },
  { id: 'seated_cable_row', name: 'Seated cable row', slot: 'horizontalPull', anyOf: ['cable', 'machine'], skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Sit tall, slight knee bend', 'Pull handle to your stomach', 'Let shoulder blades stretch forward'], mistake: 'Rocking the torso.' },
  { id: 'barbell_row', name: 'Barbell row', slot: 'horizontalPull', requires: ['barbell'], skill: 3, pattern: 'compound', contraindications: ['low_back'],
    cues: ['Hinge to about 45°', 'Pull bar to lower ribs', 'Keep the back flat'], mistake: 'Standing up as you row.' },

  // ── Biceps ──────────────────────────────────────────────────────────
  { id: 'underhand_table_row', name: 'Underhand inverted row', slot: 'biceps', bwLevel: 2, skill: 1, pattern: 'compound', contraindications: [],
    cues: ['Palms facing you under a sturdy table', 'Pull with elbows close', 'Lower slowly'], mistake: 'Short, jerky reps.' },
  { id: 'band_curl', name: 'Band biceps curl', slot: 'biceps', requires: ['bands'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Stand on the band', 'Elbows at your sides', 'Squeeze at the top'], mistake: 'Swinging the body.' },
  { id: 'dumbbell_curl', name: 'Dumbbell biceps curl', slot: 'biceps', anyOf: ['dumbbell'], skill: 1, pattern: 'isolation', contraindications: ['elbow'],
    cues: ['Palms forward', 'Elbows stay still', 'Lower over 2-3 seconds'], mistake: 'Using momentum.' },
  { id: 'hammer_curl', name: 'Hammer curl', slot: 'biceps', anyOf: ['dumbbell', 'kettlebell'], skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Palms facing each other', 'Curl to shoulder height', 'Control down'], mistake: 'Elbows drifting forward.' },
  { id: 'cable_curl', name: 'Cable curl', slot: 'biceps', requires: ['cable'], skill: 1, pattern: 'isolation', contraindications: ['elbow'],
    cues: ['Bar or rope low', 'Curl up, elbows pinned', 'Slow return'], mistake: 'Leaning back.' },

  // ── Core ────────────────────────────────────────────────────────────
  { id: 'dead_bug', name: 'Dead bug', slot: 'coreAntiExtension', bwLevel: 1, skill: 1, pattern: 'isolation', unit: 'perSide', contraindications: [],
    cues: ['Lower back pressed into the floor', 'Extend opposite arm and leg slowly', 'Exhale fully each rep'], mistake: 'Lower back lifting off the floor.' },
  { id: 'plank', name: 'Plank', slot: 'coreAntiExtension', bwLevel: 2, skill: 1, pattern: 'isolation', unit: 'seconds', contraindications: ['shoulder'],
    cues: ['Elbows under shoulders', 'Squeeze glutes and brace', 'Straight line head to heels'], mistake: 'Hips sagging or piking up.' },
  { id: 'long_lever_plank', name: 'Long-lever plank (elbows ahead of shoulders)', slot: 'coreAntiExtension', bwLevel: 3, skill: 1, pattern: 'isolation', unit: 'seconds', contraindications: ['shoulder', 'low_back'],
    cues: ['Elbows a few inches past your head', 'Ribs down, glutes tight', 'Breathe behind the brace'], mistake: 'Letting the lower back arch.' },
  { id: 'hollow_hold', name: 'Hollow hold', slot: 'coreAntiExtension', bwLevel: 4, skill: 2, pattern: 'isolation', unit: 'seconds', contraindications: ['low_back'],
    cues: ['Lower back flat on the floor', 'Arms and legs extended and lifted', 'Bend knees to make it easier'], mistake: 'Back peeling off the floor.' },
  { id: 'bird_dog', name: 'Bird dog', slot: 'coreLateral', bwLevel: 1, skill: 1, pattern: 'isolation', unit: 'perSide', contraindications: [],
    cues: ['Hands under shoulders, knees under hips', 'Reach opposite arm and leg long', 'Pause without rocking'], mistake: 'Rotating the hips.' },
  { id: 'side_plank', name: 'Side plank', slot: 'coreLateral', bwLevel: 2, skill: 1, pattern: 'isolation', unit: 'seconds', contraindications: ['shoulder'],
    cues: ['Elbow under shoulder', 'Hips high, body straight', 'Knees down to make it easier'], mistake: 'Hips dropping toward the floor.' },
  { id: 'pallof_press', name: 'Pallof press', slot: 'coreLateral', anyOf: ['bands', 'cable'], skill: 1, pattern: 'isolation', unit: 'perSide', contraindications: [],
    cues: ['Stand sideways to the anchor', 'Press hands straight out', 'Resist the twist'], mistake: 'Letting the torso rotate.' },
  { id: 'suitcase_carry', name: 'Suitcase carry', slot: 'coreLateral', anyOf: ['dumbbell', 'kettlebell'], skill: 1, pattern: 'isolation', unit: 'seconds', contraindications: [],
    cues: ['Heavy weight in one hand', 'Walk tall without leaning', 'Switch hands halfway'], mistake: 'Leaning toward the weight.' },
  { id: 'reverse_crunch', name: 'Reverse crunch', slot: 'coreFlexion', bwLevel: 1, skill: 1, pattern: 'isolation', contraindications: [],
    cues: ['Knees bent, lower back down', 'Curl hips off the floor', 'Lower slowly'], mistake: 'Swinging the legs.' },
  { id: 'sit_up', name: 'Sit-up', slot: 'coreFlexion', bwLevel: 2, skill: 1, pattern: 'isolation', contraindications: ['low_back', 'neck'],
    cues: ['Feet anchored or flat', 'Curl up one vertebra at a time', 'Control down'], mistake: 'Yanking on the neck.' },
  { id: 'hanging_knee_raise', name: 'Hanging knee raise', slot: 'coreFlexion', requires: ['pullupBar'], bwLevel: 3, skill: 2, pattern: 'isolation', contraindications: ['shoulder'],
    cues: ['Dead hang, shoulders engaged', 'Curl knees toward chest', 'No swinging'], mistake: 'Using momentum.' },
  { id: 'cable_crunch', name: 'Cable crunch', slot: 'coreFlexion', requires: ['cable'], skill: 1, pattern: 'isolation', contraindications: ['low_back'],
    cues: ['Kneel, rope by your head', 'Crunch ribs toward hips', 'Hips stay still'], mistake: 'Pulling with the arms.' },
]

// Warm-up and cool-down building blocks (dynamic before, static after,
// per ACSM flexibility guidance).
export const WARMUP_MOVES = {
  general: ['Leg swings — 10 each direction', 'Arm circles — 10 forward, 10 back', "World's greatest stretch — 3 each side"],
  lower: ['Bodyweight squats — 10 slow reps', 'Glute bridges — 10 reps', 'Walking lunges — 6 each leg'],
  upper: ['Scapular push-ups — 10 reps', 'Band pull-aparts or arm swings — 15 reps', 'Thoracic rotations — 6 each side'],
  core: ['Cat-cow — 8 reps', 'Dead bug — 5 each side'],
}

export const COOLDOWN_STRETCHES = {
  lower: ['Standing quad stretch — 30 sec each', 'Hamstring stretch — 30 sec each', 'Hip flexor lunge stretch — 30 sec each', 'Figure-4 glute stretch — 30 sec each'],
  upper: ['Doorway chest stretch — 30 sec', 'Cross-body shoulder stretch — 30 sec each', 'Overhead triceps stretch — 30 sec each', "Child's pose with lat reach — 30 sec"],
  core: ['Cobra or sphinx stretch — 30 sec', 'Supine twist — 30 sec each'],
}

export const MOBILITY_BY_AREA = {
  hips: ['90/90 hip switches — 8 each side', 'Couch stretch — 45 sec each', 'Deep squat hold — 45 sec'],
  hamstrings: ['Active straight-leg raises — 10 each', 'Seated forward fold — 45 sec', 'Hamstring floss — 10 each'],
  shoulders: ['Wall slides — 10 reps', 'Sleeper stretch — 30 sec each', 'Band dislocates (or towel) — 10 reps'],
  upperBack: ['Thoracic extensions over a foam roller or chair — 10 reps', 'Open books — 8 each side', 'Thread the needle — 6 each side'],
  lowBack: ['Cat-cow — 10 reps', "Child's pose — 45 sec", 'Knee-to-chest — 30 sec each'],
  ankles: ['Knee-to-wall ankle rocks — 10 each', 'Calf stretch against a wall — 45 sec each', 'Ankle circles — 10 each way'],
}

export function exerciseById(id) {
  return EXERCISES.find((e) => e.id === id) ?? null
}

export function isAvailable(exercise, equipmentSet) {
  const requires = exercise.requires ?? []
  if (!requires.every((item) => equipmentSet.has(item))) return false
  if (exercise.anyOf && !exercise.anyOf.some((item) => equipmentSet.has(item))) return false
  return true
}

export function isBodyweight(exercise) {
  return !(exercise.requires?.length || exercise.anyOf?.length)
}

export function isContraindicated(exercise, injuries) {
  return exercise.contraindications.some((tag) => injuries.includes(tag))
}

export function exercisesForSlot(slot) {
  return EXERCISES.filter((e) => e.slot === slot)
}

export function videoSearchUrl(name) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`how to do ${name} proper form`)}`
}
