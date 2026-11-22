import { SKILLS } from './options'

export const QUESTIONNAIRE_VERSION = 2

const LEGACY_FITNESS_LEVEL_TO_EXPERIENCE = {
  beginner: 'under6mo',
  intermediate: '6moTo2y',
  advanced: '2to5y',
}

function arr(value) {
  return Array.isArray(value) ? value : []
}

function num(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function splitLegacySkills(list) {
  const ids = []
  const other = []
  for (const raw of arr(list)) {
    const text = String(raw).trim()
    if (!text) continue
    const match = SKILLS.find((s) => s.id === text || s.label.toLowerCase() === text.toLowerCase())
    if (match) ids.push(match.id)
    else other.push(text)
  }
  return { ids, other }
}

// Brings any saved answers (the original 5-step questionnaire or the
// current detailed one) into the current shape with safe defaults, so the
// engine and the edit form never have to special-case old accounts.
export function normalizeAnswers(raw) {
  const answers = raw ?? {}
  const p = answers.personal ?? {}
  const t = answers.training ?? {}
  const f = answers.fitnessGoals ?? {}
  const m = answers.mentalGoals ?? {}
  const fin = answers.financialGoals ?? {}
  const l = answers.learning ?? {}

  const age = num(p.age)
  const legacyEquipment = arr(p.equipment)
  const equipment = t.equipment ?? legacyEquipment
  const desired = splitLegacySkills(fin.desiredSkills)
  const current = splitLegacySkills(fin.currentSkills)

  const personal = {
    age,
    sex: p.sex ?? 'unspecified',
    heightCm: num(p.heightCm),
    weightKg: num(p.weightKg) ?? num(f.fatLoss?.currentWeightKg),
    units: p.units ?? 'imperial',
    activityLevel: p.activityLevel ?? 'light',
    wakeTime: p.wakeTime ?? '07:00',
    bedTime: p.bedTime ?? '22:30',
    sleepHours: num(p.sleepHours),
    sleepQuality: p.sleepQuality ?? 'fair',
    stressLevel: p.stressLevel ?? 'moderate',
    isUnder18: Boolean(p.isUnder18 || (age != null && age < 18)),
    isPregnant: Boolean(p.isPregnant),
    hasDisorderedEatingHistory: Boolean(p.hasDisorderedEatingHistory),
    medicalFlags: arr(p.medicalFlags),
    dietPreference: p.dietPreference ?? 'none',
    dietRestrictions: arr(p.dietRestrictions),
    cookingTime: p.cookingTime ?? 'some',
    mealsPerDay: num(p.mealsPerDay) ?? 3,
  }

  const training = {
    experience: t.experience ?? LEGACY_FITNESS_LEVEL_TO_EXPERIENCE[p.fitnessLevel] ?? 'none',
    currentDaysPerWeek: num(t.currentDaysPerWeek) ?? 0,
    pushUps: t.pushUps ?? null,
    pullUps: t.pullUps ?? null,
    squats: t.squats ?? null,
    plank: t.plank ?? null,
    cardioAbility: t.cardioAbility ?? null,
    location: t.location ?? (legacyEquipment.includes('machine') ? 'gym' : 'home'),
    equipment,
    weeklyScheduleAvailableDays: t.weeklyScheduleAvailableDays ?? p.weeklyScheduleAvailableDays ?? [1, 3, 5],
    sessionMinutes: num(t.sessionMinutes) ?? 45,
    preferredTimeOfDay: t.preferredTimeOfDay ?? p.preferredTimeOfDay ?? 'morning',
    cardioPreferences: arr(t.cardioPreferences),
    injuries: t.injuries ?? arr(p.injuries),
    injuryNotes: t.injuryNotes ?? p.injuryNotes ?? '',
    painNow: Boolean(t.painNow),
  }

  const fitnessGoals = {
    primary: arr(f.primary),
    mainGoal: f.mainGoal ?? arr(f.primary)[0] ?? null,
    targetDate: f.targetDate ?? null,
    fatLoss: f.fatLoss
      ? { currentWeightKg: num(f.fatLoss.currentWeightKg), targetWeightKg: num(f.fatLoss.targetWeightKg) }
      : undefined,
    targetWeightKg: num(f.targetWeightKg) ?? num(f.fatLoss?.targetWeightKg),
    muscleFocus: arr(f.muscleFocus),
    priorityLifts: arr(f.priorityLifts),
    enduranceEvent: f.enduranceEvent ?? 'none',
    eventDate: f.eventDate ?? null,
    sportType: f.sportType ?? null,
    sportName: f.sportName ?? '',
    tightAreas: arr(f.tightAreas),
    pastObstacles: arr(f.pastObstacles),
    motivationWhy: f.motivationWhy ?? '',
  }

  const mentalGoals = {
    focusAreas: arr(m.focusAreas),
    priorityFocus: m.priorityFocus ?? arr(m.focusAreas)[0] ?? null,
    dailyMinutesAvailable: num(m.dailyMinutesAvailable) ?? 30,
    currentScreenTimeHours: num(m.currentScreenTimeHours),
    screenTimeTargetHoursPerDay: num(m.screenTimeTargetHoursPerDay),
    distractions: arr(m.distractions),
    readingInterest: m.readingInterest ?? true,
    readingFrequency: m.readingFrequency ?? null,
    readingFormat: m.readingFormat ?? 'physical',
    readingTopics: arr(m.readingTopics),
    journalingInterest: Boolean(m.journalingInterest),
    meditationExperience: m.meditationExperience ?? 'never',
    meditationInterest: Boolean(m.meditationInterest),
    weaknessesFreeText: m.weaknessesFreeText ?? '',
  }

  const financialGoals = {
    skip: Boolean(fin.skip),
    employmentStatus: fin.employmentStatus ?? 'employed',
    occupation: fin.occupation ?? '',
    currentMonthlyIncome: num(fin.currentMonthlyIncome),
    targetMonthlyIncome: num(fin.targetMonthlyIncome),
    targetDate: fin.targetDate ?? null,
    hoursPerWeekAvailable: num(fin.hoursPerWeekAvailable),
    interests: arr(fin.interests),
    pathExperience: fin.pathExperience ?? 'none',
    startupBudget: fin.startupBudget ?? null,
    currentSkills: current.ids,
    desiredSkills: desired.ids,
    otherSkillsText: fin.otherSkillsText ?? [...desired.other, ...current.other].join(', '),
    emergencyFundLevel: fin.emergencyFundLevel ?? (fin.hasEmergencyFund ? '3to6' : null),
    hasEmergencyFund: Boolean(fin.hasEmergencyFund || ['3to6', 'over6'].includes(fin.emergencyFundLevel)),
    hasHighInterestDebt: fin.hasHighInterestDebt ?? null,
    tracksSpending: fin.tracksSpending ?? null,
    hasRetirementAccount: fin.hasRetirementAccount ?? null,
  }

  const learning = {
    styles: arr(l.styles),
    budget: l.budget ?? 'some',
    extraTopics: arr(l.extraTopics),
    topicsFreeText: l.topicsFreeText ?? '',
  }

  const safeMode = Boolean(personal.isUnder18 || personal.isPregnant || personal.hasDisorderedEatingHistory)

  return {
    personal,
    training,
    fitnessGoals,
    mentalGoals,
    financialGoals,
    learning,
    meta: {
      ...(answers.meta ?? {}),
      intensityTier: answers.meta?.intensityTier ?? 'beginner',
      safeMode,
      questionnaireVersion: answers.meta?.questionnaireVersion ?? 1,
    },
  }
}

export function needsDetailedQuestions(answers) {
  return (answers?.meta?.questionnaireVersion ?? 1) < QUESTIONNAIRE_VERSION
}

// Recommends a starting tier from experience + simple fitness tests. The
// user still chooses; this just pre-selects a sensible default. Any
// medical flag or current pain starts at beginner regardless.
export function suggestTier(rawAnswers) {
  const a = normalizeAnswers(rawAnswers)
  const { experience, currentDaysPerWeek, pushUps } = a.training
  if (a.personal.medicalFlags.length > 0 || a.training.painNow) return 'beginner'
  if (experience === 'none' || experience === 'under6mo') return 'beginner'
  if (experience === '6moTo2y') return currentDaysPerWeek >= 2 ? 'intermediate' : 'beginner'
  if (currentDaysPerWeek >= 4 && ['16-30', '30+'].includes(pushUps)) return 'advanced'
  return currentDaysPerWeek >= 2 ? 'intermediate' : 'beginner'
}
