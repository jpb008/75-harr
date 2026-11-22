import { addDays, parseDateStr } from '../dates'

// incomeLogs shape: { [weekStartSunday]: { [pathId]: { hours, income } } }
//
// The point is focus: after a fair trial (several weeks and real hours),
// a path with nothing to show is worth pausing so time goes to what's
// working. Thresholds are deliberately generous so a slow start isn't
// mistaken for failure.

export const TRACKED_EXCLUDE = new Set(['fundamentals', 'investing'])
const FAIR_TRIAL_WEEKS = 6
const FAIR_TRIAL_HOURS = 15
const WINDOW_WEEKS = 8

export function weekStartOf(dateStr) {
  return addDays(dateStr, -parseDateStr(dateStr).getDay())
}

export function trackedPaths(plan) {
  return (plan.financial?.paths ?? []).filter((p) => !TRACKED_EXCLUDE.has(p.id))
}

export function summarizeIncome(incomeLogs, pathIds, todayStr) {
  const thisWeek = weekStartOf(todayStr)
  const windowStart = addDays(thisWeek, -7 * (WINDOW_WEEKS - 1))
  const weeks = Object.keys(incomeLogs).filter((w) => w >= windowStart && w <= thisWeek)

  const byPath = pathIds.map((id) => {
    let hours = 0
    let income = 0
    let weeksLogged = 0
    for (const w of weeks) {
      const entry = incomeLogs[w]?.[id]
      if (!entry || (entry.hours == null && entry.income == null)) continue
      weeksLogged += 1
      hours += entry.hours ?? 0
      income += entry.income ?? 0
    }
    return { id, hours, income, weeksLogged, perHour: hours > 0 ? income / hours : null }
  })

  const last4Start = addDays(thisWeek, -21)
  const last4Income = Object.keys(incomeLogs)
    .filter((w) => w >= last4Start && w <= thisWeek)
    .reduce((sum, w) => sum + pathIds.reduce((acc, id) => acc + (incomeLogs[w]?.[id]?.income ?? 0), 0), 0)

  return { byPath, last4Income, weeksInWindow: weeks.length }
}

export function incomeInsights(summary, labels) {
  const insights = []
  const earning = summary.byPath.filter((p) => p.income > 0).sort((a, b) => (b.perHour ?? 0) - (a.perHour ?? 0))
  const stalled = summary.byPath.filter((p) => p.income === 0 && p.weeksLogged >= FAIR_TRIAL_WEEKS && p.hours >= FAIR_TRIAL_HOURS)

  if (earning.length > 1) {
    const best = earning[0]
    insights.push(`${labels[best.id]} is your best return so far at about $${best.perHour.toFixed(0)}/hour.`)
  }
  for (const p of stalled) {
    insights.push(
      earning.length
        ? `${labels[p.id]} has had ${p.hours} hours over ${p.weeksLogged} weeks with nothing earned yet. Consider pausing it and putting that time into ${labels[earning[0].id]}.`
        : `${labels[p.id]} has had ${p.hours} hours over ${p.weeksLogged} weeks with nothing earned yet. Consider narrowing to one path and giving it your full hours.`
    )
  }
  if (!insights.length && summary.weeksInWindow < 4) {
    insights.push('Log each week — after about a month you\'ll see which path is worth your time.')
  }
  return insights
}
