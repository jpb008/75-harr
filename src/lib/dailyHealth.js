import { addDays } from './dates'

export const GALLON_ML = 3785.41

// The day's water goal: a gallon if the challenge has a gallon task,
// otherwise the plan's daily drinks estimate (~80% of total water).
export function waterGoalMl(challenge, plan) {
  if (challenge?.tasks?.some((t) => /gallon/i.test(t.label))) return GALLON_ML
  const liters = plan?.nutrition?.hydration?.litersPerDayRange?.[0]
  return liters ? Math.round(liters * 800 / 50) * 50 : 2500
}

export function waterTask(challenge) {
  return challenge?.tasks?.find((t) => /water|gallon/i.test(t.label)) ?? null
}

export function formatWater(ml, units) {
  if (units === 'metric') return `${(ml / 1000).toFixed(ml >= 10000 ? 0 : 1)} L`
  return `${Math.round(ml / 29.5735)} oz`
}

// Sleep logged for `dateStr` means the night before that morning.
export function sleepSummary(health, todayStr) {
  const nights = []
  for (let i = 0; i < 7; i += 1) {
    const h = health?.[addDays(todayStr, -i)]?.sleepHours
    if (h != null) nights.push({ offset: i, hours: h })
  }
  const lastThree = nights.filter((n) => n.offset < 3)
  const avg3 = lastThree.length ? lastThree.reduce((a, n) => a + n.hours, 0) / lastThree.length : null
  const avg7 = nights.length ? nights.reduce((a, n) => a + n.hours, 0) / nights.length : null
  const lastNight = health?.[todayStr]?.sleepHours ?? null
  // Short sleep blunts recovery and strength; ease off rather than push.
  const low = (lastNight != null && lastNight < 5.5) || (avg3 != null && lastThree.length >= 2 && avg3 < 6.5)
  return { lastNight, avg3, avg7, nightsLogged: nights.length, low }
}

export function lowSleepAdvice(summary) {
  if (!summary.low) return null
  const basis =
    summary.lastNight != null && summary.lastNight < 5.5
      ? `You slept ${summary.lastNight} h last night.`
      : `You've averaged ${summary.avg3.toFixed(1)} h of sleep over your last few nights.`
  return `${basis} Take it easier today: do one less set per exercise and stop 2-3 reps before failure. Sleep is when your body recovers, so aim for an earlier night.`
}
