import { TIER_CONFIG, REP_SCHEMES, HOLD_SECONDS, EFFORT_TARGETS, PROGRESSION_RULES } from './tierConfig'
import {
  SLOT_LABELS,
  SLOT_FALLBACKS,
  WARMUP_MOVES,
  COOLDOWN_STRETCHES,
  MOBILITY_BY_AREA,
  exercisesForSlot,
  isAvailable,
  isBodyweight,
  isContraindicated,
  videoSearchUrl,
} from './exerciseLibrary'
import { EQUIPMENT_OPTIONS, WEEKDAY_NAMES, MEDICAL_FLAGS, INJURY_OPTIONS, labelFor } from './options'
import { normalizeAnswers } from './normalizeAnswers'

const LOWER_SLOTS = new Set(['squat', 'hinge', 'singleLeg', 'hamstringCurl', 'glutes', 'calves'])
const CORE_SLOTS = new Set(['coreAntiExtension', 'coreLateral', 'coreFlexion'])
const MAIN_SLOTS = new Set(['squat', 'hinge', 'horizontalPush', 'verticalPush', 'verticalPull', 'horizontalPull'])

const DAY_TEMPLATES = {
  full_body: [
    { key: 'fullA', label: 'Full Body A', slots: ['squat', 'horizontalPush', 'verticalPull', 'hinge', 'verticalPush', 'horizontalPull', 'singleLeg', 'coreAntiExtension', 'biceps', 'triceps', 'calves', 'coreLateral'] },
    { key: 'fullB', label: 'Full Body B', slots: ['hinge', 'verticalPush', 'horizontalPull', 'singleLeg', 'horizontalPush', 'verticalPull', 'glutes', 'coreLateral', 'triceps', 'biceps', 'rearDelt', 'coreFlexion'] },
  ],
  upper_lower: [
    { key: 'upperA', label: 'Upper Body A', slots: ['horizontalPush', 'horizontalPull', 'verticalPush', 'verticalPull', 'shoulderAccessory', 'biceps', 'triceps', 'coreAntiExtension'] },
    { key: 'lowerA', label: 'Lower Body A', slots: ['squat', 'hinge', 'singleLeg', 'hamstringCurl', 'calves', 'coreLateral', 'glutes'] },
    { key: 'upperB', label: 'Upper Body B', slots: ['verticalPull', 'verticalPush', 'horizontalPull', 'horizontalPush', 'rearDelt', 'triceps', 'biceps', 'chestAccessory', 'coreFlexion'] },
    { key: 'lowerB', label: 'Lower Body B', slots: ['hinge', 'singleLeg', 'squat', 'glutes', 'hamstringCurl', 'calves', 'coreAntiExtension'] },
  ],
  push_pull_legs: [
    { key: 'push', label: 'Push', slots: ['horizontalPush', 'verticalPush', 'chestAccessory', 'shoulderAccessory', 'triceps', 'coreAntiExtension'] },
    { key: 'pull', label: 'Pull', slots: ['verticalPull', 'horizontalPull', 'rearDelt', 'biceps', 'coreFlexion', 'coreLateral'] },
    { key: 'legs', label: 'Legs', slots: ['squat', 'hinge', 'singleLeg', 'hamstringCurl', 'glutes', 'calves', 'coreAntiExtension'] },
  ],
}

const FOCUS_SLOTS = {
  chest: ['horizontalPush', 'chestAccessory'],
  back: ['verticalPull', 'horizontalPull'],
  shoulders: ['verticalPush', 'shoulderAccessory', 'rearDelt'],
  arms: ['biceps', 'triceps'],
  legs: ['squat', 'singleLeg', 'hamstringCurl'],
  glutes: ['glutes', 'hinge', 'singleLeg'],
  core: ['coreAntiExtension', 'coreLateral', 'coreFlexion'],
}

const PRIORITY_LIFTS = {
  squat: { slot: 'squat', prefer: ['barbell_squat', 'goblet_squat', 'leg_press', 'bodyweight_squat'] },
  bench: { slot: 'horizontalPush', prefer: ['barbell_bench_press', 'dumbbell_bench_press', 'machine_chest_press', 'dumbbell_floor_press'] },
  deadlift: { slot: 'hinge', prefer: ['deadlift', 'barbell_romanian_deadlift', 'dumbbell_romanian_deadlift', 'kettlebell_swing'] },
  overheadPress: { slot: 'verticalPush', prefer: ['overhead_press', 'dumbbell_shoulder_press', 'kettlebell_press', 'landmine_press'] },
  pullUp: { slot: 'verticalPull', prefer: null }, // bodyweight progression chosen by level
  pushUp: { slot: 'horizontalPush', prefer: null },
}

const EQUIPMENT_QUALITY = { barbell: 4, dumbbell: 3, kettlebell: 3, machine: 3, cable: 3, bands: 1 }

const WORK_SECONDS = { compound: 40, isolation: 30 }
const SETUP_SECONDS = 60

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function equipmentSetFor(training) {
  if (training.location === 'gym') return new Set(EQUIPMENT_OPTIONS.map((o) => o.id))
  return new Set(training.equipment)
}

function levelFrom(map, value, fallback) {
  return value != null && map[value] != null ? map[value] : fallback
}

// Maps the simple fitness-test answers to a 1-4 bodyweight progression
// level per movement family, so a person who can't do a push-up yet gets
// incline push-ups and someone with 30+ gets decline push-ups.
function bodyweightLevels(training, tier) {
  const tierDefault = { beginner: 2, intermediate: 3, advanced: 3 }[tier]
  const push = levelFrom({ 0: 1, '1-5': 2, '6-15': 3, '16-30': 3, '30+': 4 }, training.pushUps, tierDefault)
  const pull = levelFrom({ 0: 2, '1-3': 2, '4-8': 3, '9+': 4 }, training.pullUps, tierDefault - 1)
  const legs = levelFrom({ under10: 1, '10-25': 2, '25-50': 3, '50+': 4 }, training.squats, tierDefault)
  const core = levelFrom({ under20: 1, '20-60': 2, '1-2min': 3, '2min+': 4 }, training.plank, tierDefault - 1)
  return {
    horizontalPush: push, verticalPush: push, triceps: push, chestAccessory: push,
    verticalPull: pull, horizontalPull: Math.min(pull, 2), biceps: Math.min(pull, 2),
    squat: legs, hinge: legs, singleLeg: legs, hamstringCurl: legs, glutes: legs, calves: legs,
    coreAntiExtension: core, coreLateral: core, coreFlexion: core,
    shoulderAccessory: 1, rearDelt: 1,
  }
}

function scoreExercise(ex, { tier, levels, priorityBwSlots }) {
  if (isBodyweight(ex) || ex.bwLevel != null) {
    const userLevel = levels[ex.slot] ?? 2
    const level = ex.bwLevel ?? 1
    let score = level <= userLevel ? 10 - (userLevel - level) * 3 : -10 * (level - userLevel)
    if (score >= 0 && priorityBwSlots.has(ex.slot)) score += 30
    return score
  }
  const gear = [...(ex.requires ?? []), ...(ex.anyOf ?? [])]
  const quality = Math.max(0, ...gear.map((g) => EQUIPMENT_QUALITY[g] ?? 0))
  let score = 10 + quality
  if (ex.skill === 3) score += tier === 'beginner' ? -8 : tier === 'advanced' ? 2 : 0
  if (tier === 'beginner' && gear.includes('machine')) score += 1
  return score
}

function candidatesForSlot(slot, ctx) {
  return exercisesForSlot(slot)
    .filter((ex) => isAvailable(ex, ctx.equipment) && !isContraindicated(ex, ctx.injuries))
    .filter((ex) => ex.id !== 'jump_squat' || ctx.goals.includes('athleticPerformance'))
    .filter((ex) => ex.id !== 'nordic_curl' || ctx.tier !== 'beginner')
    .map((ex) => ({ ex, score: scoreExercise(ex, ctx) }))
    // A negative score means a bodyweight progression that's too hard for
    // this person right now — better to fall back than prescribe it.
    .filter((c) => c.score >= 0)
    .sort((a, b) => b.score - a.score)
}

function isEasierProgression(alt, best) {
  return alt.ex.bwLevel != null && best.ex.bwLevel != null && alt.ex.bwLevel < best.ex.bwLevel
}

function pickForSlot(slot, variantIndex, ctx, usedIds) {
  const slotsToTry = [slot, ...(SLOT_FALLBACKS[slot] ?? [])]
  for (const s of slotsToTry) {
    const ranked = candidatesForSlot(s, ctx).filter((c) => !usedIds.has(c.ex.id))
    if (ranked.length === 0) continue
    const best = ranked[0]
    const alt = ranked[1]
    const useAlt = variantIndex % 2 === 1 && alt && alt.score >= best.score - 6 && !isEasierProgression(alt, best)
    const chosen = useAlt ? alt : best
    return { ex: chosen.ex, alternatives: ranked.filter((c) => c !== chosen).slice(0, 2).map((c) => c.ex.name) }
  }
  return null
}

function pickPriorityLift(liftId, ctx, usedIds) {
  const config = PRIORITY_LIFTS[liftId]
  if (!config.prefer) return pickForSlot(config.slot, 0, { ...ctx, priorityBwSlots: new Set([config.slot]) }, usedIds)
  const ranked = candidatesForSlot(config.slot, ctx)
  for (const id of config.prefer) {
    const hit = ranked.find((c) => c.ex.id === id && !usedIds.has(id))
    if (hit) return { ex: hit.ex, alternatives: ranked.filter((c) => c !== hit).slice(0, 2).map((c) => c.ex.name) }
  }
  return pickForSlot(config.slot, 0, ctx, usedIds)
}

function goalCategory(goals, mainGoal) {
  const lead = mainGoal ?? goals[0]
  if (lead === 'strength') return 'strength'
  if (lead === 'muscleGain') return 'hypertrophy'
  if (lead === 'endurance') return 'endurance'
  if (goals.includes('strength')) return 'strength'
  if (goals.includes('muscleGain')) return 'hypertrophy'
  return 'general'
}

// Heavy low-rep strength work is reserved for the big lifts; single-leg,
// glute and row variations stay in a moderate range even for strength goals.
const HEAVY_SLOTS = new Set(['squat', 'hinge', 'horizontalPush', 'verticalPush', 'verticalPull'])

function prescribe(ex, { tier, category, isPriority, isFocus, recoveryLimited, levels }) {
  const config = TIER_CONFIG[tier]
  let cat = isPriority ? 'strength' : category
  if (cat === 'strength' && !isPriority && !HEAVY_SLOTS.has(ex.slot)) cat = 'hypertrophy'
  let sets = config.setsPerExercise
  if (isFocus && !recoveryLimited) sets += 1
  if (ex.pattern === 'isolation' && tier === 'beginner') sets = Math.min(sets, 2)

  const unit = ex.unit ?? 'reps'
  const bodyweight = isBodyweight(ex) || ex.bwLevel != null
  let repRange
  if (unit === 'seconds') {
    repRange = HOLD_SECONDS[tier]
  } else if (unit === 'perSide') {
    repRange = bodyweight ? [8, 12] : [6, 10]
  } else if (bodyweight) {
    if (ex.slot === 'verticalPull') repRange = levels.verticalPull >= 3 ? [4, 8] : [3, 6]
    else repRange = category === 'endurance' ? [12, 25] : [8, 15]
  } else {
    const scheme = REP_SCHEMES[cat]
    repRange = ex.pattern === 'compound' ? scheme.compound[tier] : scheme.isolation
  }

  const restCat = bodyweight && ex.slot !== 'verticalPull' ? 'general' : cat
  const restSeconds = ex.pattern === 'compound' ? config.restSeconds[restCat] : config.isolationRestSeconds
  return { sets, repRange, unit, restSeconds }
}

function estimateSeconds(item) {
  const work = item.unit === 'seconds' ? item.repRange[1] : WORK_SECONDS[item.pattern] * (item.unit === 'perSide' ? 1.5 : 1)
  return item.sets * (work + item.restSeconds) + SETUP_SECONDS
}

function buildWarmup(slots, sessionMinutes, firstExerciseName) {
  const hasLower = slots.some((s) => LOWER_SLOTS.has(s))
  const hasUpper = slots.some((s) => !LOWER_SLOTS.has(s) && !CORE_SLOTS.has(s))
  const moves = [`${sessionMinutes <= 30 ? 3 : 5} min easy cardio (brisk walk, bike, or jumping jacks) to raise your temperature`]
  moves.push(...WARMUP_MOVES.general.slice(0, 2))
  if (hasLower) moves.push(...WARMUP_MOVES.lower.slice(0, 2))
  if (hasUpper) moves.push(...WARMUP_MOVES.upper.slice(0, 2))
  if (firstExerciseName) moves.push(`1-2 lighter ramp-up sets of ${firstExerciseName}`)
  return moves
}

function buildCooldown(slots, tightAreas) {
  const hasLower = slots.some((s) => LOWER_SLOTS.has(s))
  const hasUpper = slots.some((s) => !LOWER_SLOTS.has(s) && !CORE_SLOTS.has(s))
  const moves = ['2-3 min easy walking to bring your heart rate down']
  if (hasLower) moves.push(...COOLDOWN_STRETCHES.lower.slice(0, 3))
  if (hasUpper) moves.push(...COOLDOWN_STRETCHES.upper.slice(0, 3))
  const extra = tightAreas.map((a) => MOBILITY_BY_AREA[a]?.[0]).filter(Boolean)
  return [...moves, ...extra.slice(0, 2)]
}

function buildStrengthSession(template, occurrence, dayOfWeek, ctx) {
  const usedIds = new Set()
  const focusSlots = new Set(ctx.muscleFocus.flatMap((f) => FOCUS_SLOTS[f] ?? []))
  const templateSlots = template.slots

  // Priority lifts lead the session on days that train their slot.
  const priorityItems = []
  for (const liftId of ctx.priorityLifts) {
    const config = PRIORITY_LIFTS[liftId]
    if (!config || !templateSlots.includes(config.slot)) continue
    if (priorityItems.some((p) => p.slot === config.slot)) continue
    const picked = pickPriorityLift(liftId, ctx, usedIds)
    if (!picked) continue
    usedIds.add(picked.ex.id)
    priorityItems.push({ slot: config.slot, picked, isPriority: true })
  }

  // Order: main compound slots first, focus slots pulled forward, then the rest.
  const remaining = templateSlots.filter((s) => !priorityItems.some((p) => p.slot === s))
  const mains = remaining.filter((s) => MAIN_SLOTS.has(s)).slice(0, 2)
  const focused = remaining.filter((s) => !mains.includes(s) && focusSlots.has(s))
  const rest = remaining.filter((s) => !mains.includes(s) && !focused.includes(s))
  const orderedSlots = [...mains, ...focused, ...rest]

  const items = []
  for (const p of priorityItems) items.push(p)
  for (const slot of orderedSlots) {
    const picked = pickForSlot(slot, occurrence, ctx, usedIds)
    if (!picked) continue
    usedIds.add(picked.ex.id)
    items.push({ slot, picked, isPriority: false })
  }

  const exercises = items.map(({ slot, picked, isPriority }) => {
    const ex = picked.ex
    const rx = prescribe(ex, { ...ctx, isPriority, isFocus: focusSlots.has(slot) })
    return {
      exerciseId: ex.id,
      name: ex.name,
      slot,
      slotLabel: SLOT_LABELS[ex.slot] ?? SLOT_LABELS[slot],
      pattern: ex.pattern,
      ...rx,
      cues: ex.cues,
      mistake: ex.mistake,
      videoUrl: videoSearchUrl(ex.name),
      alternatives: picked.alternatives,
      isPriority,
      isFocus: focusSlots.has(slot),
    }
  })

  // Fit the session into the user's time: straight sets if at least 4
  // exercises fit, otherwise pair exercises into supersets to save rest.
  const config = TIER_CONFIG[ctx.tier]
  const warmupSec = (ctx.sessionMinutes <= 30 ? 5 : 8) * 60
  const cooldownSec = (ctx.sessionMinutes <= 30 ? 3 : 5) * 60
  const reservedSec = (ctx.reservedMinutes ?? 0) * 60
  const budget = ctx.sessionMinutes * 60 - warmupSec - cooldownSec - reservedSec
  const capped = exercises.slice(0, config.maxExercises)

  const straight = []
  let used = 0
  for (const item of capped) {
    const cost = estimateSeconds(item)
    if (used + cost > budget && straight.length >= 3) break
    straight.push(item)
    used += cost
  }

  let format = 'straight'
  let chosen = straight
  let workSeconds = used
  if ((straight.length < 4 && capped.length >= 4) || ctx.preferSupersets) {
    const paired = []
    let pairUsed = 0
    for (let i = 0; i < capped.length; i += 2) {
      const a = capped[i]
      const b = capped[i + 1]
      const pairCost = b
        ? Math.max(a.sets, b.sets) * (WORK_SECONDS[a.pattern] + WORK_SECONDS[b.pattern] + Math.max(a.restSeconds, b.restSeconds)) + SETUP_SECONDS
        : estimateSeconds(a)
      if (pairUsed + pairCost > budget && paired.length >= 4) break
      const group = String.fromCharCode(65 + paired.length / 2)
      paired.push({ ...a, supersetGroup: b ? `${group}1` : null })
      if (b) paired.push({ ...b, supersetGroup: `${group}2` })
      pairUsed += pairCost
    }
    if (paired.length > straight.length) {
      format = 'superset'
      chosen = paired
      workSeconds = pairUsed
    }
  }

  const slotsInSession = chosen.map((e) => e.slot)
  return {
    id: `strength-${dayOfWeek}`,
    dayOfWeek,
    type: 'strength',
    label: template.label,
    format,
    estimatedMinutes: Math.round((warmupSec + cooldownSec + reservedSec + workSeconds) / 60),
    warmup: buildWarmup(slotsInSession, ctx.sessionMinutes, chosen[0]?.name),
    exercises: chosen,
    cooldown: buildCooldown(slotsInSession, ctx.tightAreas),
  }
}

// Spreads N sessions across the user's available days as evenly as
// possible, so strength days aren't stacked back-to-back when avoidable.
function spreadDays(availableDays, count) {
  const sorted = [...availableDays].sort((a, b) => a - b)
  if (count >= sorted.length) return sorted
  const picked = []
  for (let i = 0; i < count; i += 1) picked.push(sorted[Math.round((i * sorted.length) / count)])
  return [...new Set(picked)].sort((a, b) => a - b)
}

const CARDIO_UNSAFE = {
  knee: ['running', 'jumpRope', 'hiit', 'sports', 'dance'],
  ankle: ['running', 'jumpRope', 'hiit', 'sports', 'dance', 'hiking'],
  hip: ['running', 'jumpRope'],
  low_back: ['rowing'],
}

const EVENT_MODALITY = { '5k': 'running', '10k': 'running', half: 'running', marathon: 'running', cycling: 'cycling', triathlon: 'mixed' }
const EVENT_WEEKLY_MINUTES = { '5k': 120, '10k': 150, half: 200, marathon: 260, cycling: 240, triathlon: 300 }
const MODALITY_LABELS = {
  walking: 'Brisk walk', running: 'Run', cycling: 'Bike ride', swimming: 'Swim', rowing: 'Row', hiit: 'Interval circuit',
  hiking: 'Hike', sports: 'Pick-up sport', jumpRope: 'Jump rope', dance: 'Dance cardio', mixed: 'Swim / bike / run',
}

function pickModalities(a) {
  const blocked = new Set(a.training.injuries.flatMap((i) => CARDIO_UNSAFE[i] ?? []))
  const event = a.fitnessGoals.enduranceEvent
  if (event && event !== 'none') return [EVENT_MODALITY[event]]
  let prefs = a.training.cardioPreferences.filter((p) => !blocked.has(p))
  if (prefs.length === 0) {
    prefs = ['walking']
    const canRun = ['jog10', 'run30', 'trained'].includes(a.training.cardioAbility)
    if (canRun && !blocked.has('running')) prefs.push('running')
    else if (a.training.equipment.includes('cardioMachine') || a.training.location === 'gym') prefs.push('cycling')
  }
  return prefs
}

function cardioDescription(kind, modality, ability, minutes) {
  const label = MODALITY_LABELS[modality] ?? 'Cardio'
  if (kind === 'intervals') {
    if (ability === 'walk') return `${minutes} min: alternate 1 min brisk effort with 2 min easy. Repeat.`
    return `${minutes} min total: 10 min easy, then 6-8 rounds of 1 min hard / 2 min easy, then cool down. Hard = breathing heavily, can only say a few words.`
  }
  if (kind === 'long') return `${minutes} min at an easy, conversational pace — this is your longest session of the week. Add about 10% each week.`
  if (modality === 'running' && ability === 'walk') return `${minutes} min walk-jog: 1 min easy jog, 2 min walk. Repeat. Add 30 sec of jogging each week.`
  return `${minutes} min ${label.toLowerCase()} at an easy pace — you should be able to hold a conversation (zone 2).`
}

function buildCardioPlan(a, cardioDayCount, allowFinishers) {
  const goals = a.fitnessGoals.primary
  const event = a.fitnessGoals.enduranceEvent
  const ability = a.training.cardioAbility ?? 'jog10'
  const modalities = pickModalities(a)
  const wantsEndurance = goals.includes('endurance') || (event && event !== 'none')

  let weeklyMinutes = 150
  if (wantsEndurance) weeklyMinutes = EVENT_WEEKLY_MINUTES[event] ?? 180
  else if (goals.includes('fatLoss')) weeklyMinutes = 200
  if (ability === 'walk') weeklyMinutes = Math.min(weeklyMinutes, 150)

  const sessions = []
  const sessionCount = wantsEndurance ? 4 : goals.includes('fatLoss') || goals.includes('athleticPerformance') ? 3 : 2
  const perSession = Math.min(Math.round(weeklyMinutes / Math.max(sessionCount, 1) / 5) * 5, wantsEndurance ? 90 : 45)
  for (let i = 0; i < sessionCount; i += 1) {
    let kind = 'easy'
    if (wantsEndurance && i === 0) kind = 'long'
    else if (i === sessionCount - 1 && ability !== 'walk' && (wantsEndurance || goals.includes('athleticPerformance') || goals.includes('fatLoss')))
      kind = 'intervals'
    const modality = modalities[i % modalities.length]
    const minutes = kind === 'long' ? Math.round((perSession * 1.4) / 5) * 5 : kind === 'intervals' ? Math.max(20, perSession - 10) : perSession
    sessions.push({ kind, modality, minutes, label: `${kind === 'long' ? 'Long' : kind === 'intervals' ? 'Interval' : 'Easy'} ${MODALITY_LABELS[modality]?.toLowerCase() ?? 'cardio'}`, description: cardioDescription(kind, modality, ability, minutes) })
  }

  // Athletes get sport-style conditioning first in line for its own day.
  if (goals.includes('athleticPerformance') && !wantsEndurance) {
    const sport = sportConditioning(a)
    if (sport) {
      const idx = sessions.findIndex((x) => x.kind === 'intervals')
      if (idx >= 0) sessions.splice(idx, 1)
      else sessions.pop()
      sessions.unshift(sport)
    }
  }

  // Sessions that don't get their own day become short finishers after
  // lifting — unless sessions are already short, where daily walking
  // (see the steps target) covers it instead of stretching the workout.
  const ownDay = sessions.slice(0, cardioDayCount)
  const finishers = allowFinishers
    ? sessions.slice(cardioDayCount).map((s) => {
        const kind = s.kind === 'long' ? 'easy' : s.kind
        const minutes = Math.min(s.minutes, 20)
        return {
          ...s,
          kind,
          minutes,
          label: `${kind === 'intervals' ? 'Interval' : 'Easy'} ${MODALITY_LABELS[s.modality]?.toLowerCase() ?? 'cardio'}`,
          description: cardioDescription(kind, s.modality, ability, minutes),
        }
      })
    : []

  return {
    weeklyMinutes,
    modalities,
    ownDay,
    finishers,
    intensityNote: wantsEndurance
      ? 'Keep about 80% of your cardio easy (conversational pace, "zone 2") and about 20% hard. This polarized split is what most endurance research supports.'
      : 'Aim for at least 150 minutes of moderate activity a week (CDC guideline). Easy sessions should feel conversational; interval days are short and hard.',
    sequencingNote:
      goals.includes('strength') || goals.includes('muscleGain')
        ? 'On days with both, lift first and do cardio after — or split them by a few hours. That protects your strength gains better than cardio first.'
        : null,
  }
}


// ── Sport-specific speed & power ─────────────────────────────────────────
// Plyometric volume is counted in foot contacts (landings). Caps sit
// below common coaching guidance (NSCA: ~80-100 contacts for beginners)
// on purpose, because these come on top of lifting. Placed right after
// the warm-up, while fresh, twice a week on non-consecutive days.
const CONTACT_BUDGET = { beginner: 40, intermediate: 60, advanced: 80 }
const JUMP_UNSAFE = new Set(['knee', 'ankle', 'hip', 'low_back'])
const CUTTING_UNSAFE = new Set(['knee', 'ankle'])

const DRILLS = {
  pogo: { name: 'Pogo hops', reps: 10, contactsPerRep: 1, cue: 'Stiff ankles, bounce quickly off the balls of your feet, small height.' },
  boxJump: { name: 'Jump onto a box or sturdy step', reps: 4, contactsPerRep: 1, cue: 'Land softly in a quarter squat. Step down — never jump down.' },
  broadJump: { name: 'Broad jump', reps: 3, contactsPerRep: 1, cue: 'Swing your arms, jump forward, and stick the landing for 2 seconds.' },
  lateralBound: { name: 'Lateral bound (skater jump)', reps: 3, contactsPerRep: 2, perSide: true, cue: 'Push off the outside leg, land on one foot, and hold balance.' },
  approachJump: { name: 'Approach jump (two-step into a vertical jump)', reps: 3, contactsPerRep: 1, cue: 'Make the last two steps quick, drive your arms up, land on both feet.' },
  lateralShuffle: { name: 'Lateral shuffle', prescription: '4 × 10 m each way', cue: "Stay low and don't cross your feet." },
  defensiveSlides: { name: 'Defensive slides', prescription: '4 × 15 sec', cue: 'Low stance, active hands, push off the trailing foot.' },
  closeouts: { name: 'Closeouts', prescription: '3 × 5', cue: 'Sprint 3-4 steps, chop your feet, arrive balanced with hands up.' },
  proShuttle: { name: '5-10-5 shuttle', prescription: '4 reps, full rest between', cue: 'Touch the line and drop your hips to change direction.' },
  splitStep: { name: 'Split-step + first-step reaction', prescription: '4 × 6', cue: 'Small hop as the imaginary ball is hit, then explode to one side.' },
  shadowFootwork: { name: 'Shadow footwork patterns', prescription: '4 × 30 sec', cue: 'Move to each corner as if covering the court, recover to center.' },
  shadowbox: { name: 'Shadowboxing with footwork', prescription: '3 × 2 min', cue: 'Stay on the balls of your feet; move after every combination.' },
  strides: { name: 'Strides', prescription: '6 × 80 m at about 85% effort', cue: 'Smooth and fast, not all-out. Walk back to recover.' },
}

const SPORT_TEMPLATES = {
  basketball: { jumps: ['pogo', 'approachJump', 'lateralBound'], agility: ['defensiveSlides', 'closeouts'] },
  team: { jumps: ['pogo', 'boxJump', 'lateralBound'], agility: ['proShuttle', 'lateralShuffle'] },
  racket: { jumps: ['pogo', 'lateralBound'], agility: ['splitStep', 'shadowFootwork'] },
  combat: { jumps: ['pogo', 'broadJump'], agility: ['shadowbox'] },
  running: { jumps: ['pogo', 'broadJump'], agility: ['strides'] },
  other: { jumps: ['pogo', 'boxJump', 'broadJump'], agility: ['proShuttle', 'lateralShuffle'] },
}

function sportKey(a) {
  if (/basket/i.test(a.fitnessGoals.sportName ?? '')) return 'basketball'
  return SPORT_TEMPLATES[a.fitnessGoals.sportType] ? a.fitnessGoals.sportType : 'other'
}

function buildAthleticBlock(a, tier) {
  const template = SPORT_TEMPLATES[sportKey(a)]
  const injuries = a.training.injuries
  const noJumps = injuries.some((i) => JUMP_UNSAFE.has(i)) || a.training.painNow
  const noCutting = injuries.some((i) => CUTTING_UNSAFE.has(i)) || a.training.painNow
  const sets = tier === 'beginner' ? 2 : 3
  let budget = CONTACT_BUDGET[tier]
  const drills = []

  if (!noJumps) {
    for (const key of template.jumps) {
      const d = DRILLS[key]
      const contacts = sets * d.reps * d.contactsPerRep
      if (contacts > budget) continue
      budget -= contacts
      drills.push({ name: d.name, prescription: `${sets} × ${d.reps}${d.perSide ? ' each side' : ''}`, cue: d.cue })
    }
  }
  if (!noCutting) {
    for (const key of template.agility.slice(0, tier === 'beginner' ? 1 : 2)) {
      const d = DRILLS[key]
      drills.push({ name: d.name, prescription: d.prescription, cue: d.cue })
    }
  }
  if (!drills.length) return null
  return {
    title: 'Speed & power',
    minutes: tier === 'beginner' ? 8 : 12,
    note: `Do this right after your warm-up, while you're fresh. Rest 60-90 sec between sets and stop if your landings get sloppy${noJumps ? '' : ` — max ${CONTACT_BUDGET[tier] - budget} jumps today`}.`,
    drills,
  }
}

const SPORT_CONDITIONING = {
  basketball: { label: 'Court conditioning', minutes: 25, description: '8-12 sprints of 15-20 sec (baseline to baseline and back), walking 45-60 sec between. Finish with 10 free throws while you\'re tired — that\'s the game.' },
  team: { label: 'Repeated-sprint conditioning', minutes: 25, description: '8-10 sprints of 15 sec hard, 45 sec easy jog or walk between. This builds the repeat-sprint fitness field sports demand.' },
  racket: { label: 'Footwork intervals', minutes: 20, description: '10 rounds of 30 sec fast footwork patterns, 30 sec rest. Stay light on your feet.' },
  combat: { label: 'Round conditioning', minutes: 25, description: '5-6 rounds of 3 min hard work (shadowboxing, bag, or skipping rope), 1 min rest between — the same rhythm as a fight.' },
}

function sportConditioning(a) {
  const key = sportKey(a)
  const session = SPORT_CONDITIONING[key] ?? (key === 'other' ? SPORT_CONDITIONING.team : null)
  if (!session) return null
  const lowImpact = a.training.injuries.some((i) => CUTTING_UNSAFE.has(i))
  if (lowImpact) {
    return { kind: 'intervals', modality: 'cycling', minutes: 20, label: 'Low-impact intervals', description: '8-10 × 20 sec hard on a bike, 40 sec easy. Same conditioning benefit without the impact on your joints.' }
  }
  return { kind: 'intervals', modality: 'sports', ...session }
}

function buildPhases(tier, event, eventDate) {
  const deload = TIER_CONFIG[tier].deload
  const deloadWeeks = deload ? Array.from({ length: Math.floor(11 / deload.everyWeeks) }, (_, i) => (i + 1) * deload.everyWeeks) : []
  const phases = [
    { weeks: 'Weeks 1-2', title: 'Foundation', focus: 'Learn every movement. Pick weights you could lift 3-4 more times. Write down what you lift.' },
    { weeks: 'Weeks 3-10', title: 'Build', focus: 'Follow your progression rule each session. Most progress happens here.' },
    { weeks: 'Week 11', title: 'Test', focus: 'Redo your starting fitness tests (push-ups, plank, squats, cardio) and compare.' },
  ]
  if (deloadWeeks.length) {
    phases.splice(2, 0, {
      weeks: `Week ${deloadWeeks.join(' & ')}`,
      title: 'Deload',
      focus: `Recovery week: same exercises, about half the sets, lighter weights. You come back stronger.`,
    })
  }
  let eventInfo = null
  if (event && event !== 'none') {
    const weeksOut = eventDate ? Math.max(0, Math.round((new Date(eventDate).getTime() - Date.now()) / (7 * 86400000))) : null
    eventInfo = {
      event,
      weeksOut,
      taperNote: 'In the final 1-2 weeks before your event, cut training volume by roughly 40-60% while keeping a little intensity. Research on tapering shows this improves race-day performance.',
    }
  }
  return { phases, eventInfo }
}

function buildNotes(a, ctx) {
  const notes = []
  const flags = a.personal.medicalFlags
  if (flags.length) {
    notes.push({
      kind: 'warning',
      text: `You mentioned: ${flags.map((f) => labelFor(MEDICAL_FLAGS, f).toLowerCase()).join(', ')}. Standard pre-exercise screening (PAR-Q+) recommends talking to a doctor before starting a new program. Your plan starts at a conservative level.`,
    })
  }
  if (a.training.painNow) {
    notes.push({ kind: 'warning', text: "You're currently in pain. Skip anything that hurts, and get it checked by a physical therapist or doctor before pushing hard." })
  }
  if (a.training.injuries.length) {
    notes.push({
      kind: 'info',
      text: `Exercises that commonly aggravate your ${a.training.injuries.map((i) => labelFor(INJURY_OPTIONS, i).toLowerCase()).join(', ')} were swapped for gentler options. These are general defaults, not medical advice.`,
    })
  }
  if (ctx.recoveryLimited) {
    notes.push({ kind: 'info', text: 'Your sleep or stress answers suggest recovery may be limited. Start at the low end of the sets and keep a few reps in reserve. Sleep is where the progress happens.' })
  }
  if (a.personal.age != null && a.personal.age >= 65) {
    notes.push({ kind: 'info', text: 'Add balance practice most days — for example, stand on one foot for 30 seconds per side, holding a counter if needed (CDC guidance for older adults).' })
  }
  if (a.fitnessGoals.primary.includes('athleticPerformance')) {
    const blocked = a.training.injuries.some((i) => JUMP_UNSAFE.has(i)) || a.training.painNow
    notes.push({
      kind: 'info',
      text: blocked
        ? 'Jump training was left out because of the injuries you listed. Get cleared by a physical therapist before adding jumps back in.'
        : 'Two strength days start with a short speed & power block for your sport. Jumps are capped per session so they add to your lifting instead of wearing you down.',
    })
  }
  const obstacleNotes = {
    time: `Short on time? Sessions are built to fit ${a.training.sessionMinutes} minutes. On a crazy day, do just the first three exercises — that still counts.`,
    motivation: 'Lost motivation before? Put your sessions in your calendar like appointments. "If it\'s Monday at 6 pm, then I train" plans make follow-through far more likely.',
    knowledge: 'Every exercise has form cues and a video link — tap it in the Plan tab. The Learn section has beginner-friendly guides too.',
    boredom: 'Your week rotates between A and B workouts, and each exercise lists alternatives you can swap in.',
    schedule: "If you miss a day, just do the next workout in order. Don't try to double up.",
    results: 'Log your weights and reps each session. Strength numbers move weeks before the mirror does.',
    soreness: 'Some soreness in the first two weeks is normal and fades fast. Start light — the plan builds gradually on purpose.',
  }
  for (const o of a.fitnessGoals.pastObstacles) if (obstacleNotes[o]) notes.push({ kind: 'tip', text: obstacleNotes[o] })
  return notes
}

function buildMobility(a) {
  const wants = a.fitnessGoals.primary.includes('mobility')
  const areas = a.fitnessGoals.tightAreas.length ? a.fitnessGoals.tightAreas : wants ? ['hips', 'hamstrings', 'upperBack'] : []
  if (!areas.length) return null
  return {
    areas,
    moves: areas.flatMap((area) => MOBILITY_BY_AREA[area] ?? []),
    frequency: 'About 10 minutes, at least 3 days a week — on rest days or after training. Hold stretches 30-60 seconds and never force into pain.',
  }
}

export function generateWorkoutProgram(rawAnswers) {
  const a = normalizeAnswers(rawAnswers)
  const tier = a.meta.intensityTier
  const config = TIER_CONFIG[tier]
  const goals = a.fitnessGoals.primary
  const recoveryLimited =
    a.personal.sleepQuality === 'poor' || a.personal.stressLevel === 'high' || (a.personal.sleepHours != null && a.personal.sleepHours < 6)

  const availableDays = a.training.weeklyScheduleAvailableDays.length ? a.training.weeklyScheduleAvailableDays : [1, 3, 5]
  const wantsEndurance = goals.includes('endurance') || a.fitnessGoals.enduranceEvent !== 'none'
  let strengthCount = clamp(availableDays.length, config.sessionsPerWeekRange[0], config.sessionsPerWeekRange[1])
  // Endurance goals need dedicated cardio days, so keep two free when possible.
  if (wantsEndurance) strengthCount = Math.max(Math.min(strengthCount, availableDays.length - 2), Math.min(2, availableDays.length))
  const strengthDays = spreadDays(availableDays, strengthCount)
  const cardioDays = availableDays.filter((d) => !strengthDays.includes(d)).sort((x, y) => x - y)

  const ctx = {
    tier,
    goals,
    category: goalCategory(goals, a.fitnessGoals.mainGoal),
    equipment: equipmentSetFor(a.training),
    injuries: a.training.injuries,
    levels: bodyweightLevels(a.training, tier),
    muscleFocus: a.fitnessGoals.muscleFocus,
    priorityLifts: a.fitnessGoals.priorityLifts,
    priorityBwSlots: new Set(
      a.fitnessGoals.priorityLifts.filter((l) => l === 'pushUp' || l === 'pullUp').map((l) => PRIORITY_LIFTS[l].slot)
    ),
    tightAreas: a.fitnessGoals.tightAreas,
    sessionMinutes: a.training.sessionMinutes,
    preferSupersets: a.fitnessGoals.pastObstacles.includes('time') && a.training.sessionMinutes <= 45,
    recoveryLimited,
  }

  const templates = DAY_TEMPLATES[config.split]
  const occurrences = {}
  const athleticBlock = goals.includes('athleticPerformance') ? buildAthleticBlock(a, tier) : null
  const athleticIndexes = new Set(athleticBlock ? [0, Math.floor(strengthDays.length / 2)].filter((i) => i < strengthDays.length) : [])
  const sessions = strengthDays.map((day, i) => {
    const template = templates[i % templates.length]
    occurrences[template.key] = (occurrences[template.key] ?? -1) + 1
    const withBlock = athleticIndexes.has(i)
    const session = buildStrengthSession(template, occurrences[template.key], day, { ...ctx, reservedMinutes: withBlock ? athleticBlock.minutes : 0 })
    return withBlock ? { ...session, athleticBlock } : session
  })

  const cardio = buildCardioPlan(a, cardioDays.length, a.training.sessionMinutes >= 45)
  cardio.ownDay.forEach((c, i) => {
    const day = cardioDays[i]
    sessions.push({
      id: `cardio-${day}`,
      dayOfWeek: day,
      type: 'cardio',
      label: c.label,
      estimatedMinutes: c.minutes + 10,
      warmup: ['5 min at a very easy pace', ...WARMUP_MOVES.general.slice(0, 2)],
      cardio: c,
      exercises: [],
      cooldown: ['3-5 min easy', ...COOLDOWN_STRETCHES.lower.slice(0, 2)],
    })
  })
  const strengthSessions = sessions.filter((s) => s.type === 'strength')
  cardio.finishers.forEach((f, i) => {
    const target = strengthSessions[strengthSessions.length - 1 - (i % Math.max(strengthSessions.length, 1))]
    if (target && !target.finisher) target.finisher = f
  })
  sessions.sort((x, y) => x.dayOfWeek - y.dayOfWeek)

  const mobility = buildMobility(a)
  const weekSchedule = WEEKDAY_NAMES.map((name, dayOfWeek) => {
    const session = sessions.find((s) => s.dayOfWeek === dayOfWeek)
    if (session) return { dayOfWeek, name, type: session.type, title: session.label, sessionId: session.id, minutes: session.estimatedMinutes }
    if (availableDays.includes(dayOfWeek)) {
      return { dayOfWeek, name, type: 'recovery', title: 'Active recovery', detail: '20-30 min easy walk plus 10 min of mobility. Light movement helps you recover.' }
    }
    return {
      dayOfWeek,
      name,
      type: 'rest',
      title: mobility ? 'Rest + mobility' : 'Rest day',
      detail: mobility ? '10 min mobility routine, plus an easy walk if you feel like it.' : 'Rest, or an easy walk. Recovery is part of the plan.',
    }
  })

  const ageForSteps = a.personal.age ?? 30
  const stepsTarget =
    a.personal.activityLevel === 'sedentary' || a.personal.activityLevel === 'light'
      ? {
          target: ageForSteps >= 60 ? '6,000-8,000' : '8,000-10,000',
          note: 'Build up gradually — add about 1,000 steps a day each week. Large studies link this range to lower health risks, with benefits leveling off above it.',
        }
      : null

  const { phases, eventInfo } = buildPhases(tier, a.fitnessGoals.enduranceEvent, a.fitnessGoals.eventDate)

  return {
    tier,
    split: config.split,
    sessionsPerWeek: strengthDays.length,
    sessionMinutes: a.training.sessionMinutes,
    progressionMethod: config.progressionMethod,
    progression: PROGRESSION_RULES[config.progressionMethod],
    effort: EFFORT_TARGETS[tier],
    deload: config.deload,
    sessions,
    weekSchedule,
    cardio: {
      weeklyMinutes: cardio.weeklyMinutes,
      modalities: cardio.modalities,
      intensityNote: cardio.intensityNote,
      sequencingNote: cardio.sequencingNote,
    },
    stepsTarget,
    mobility,
    phases,
    event: eventInfo,
    notes: buildNotes(a, ctx),
  }
}
