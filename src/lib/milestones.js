// Classic 75 Hard has two well-known checkpoints, Day 25 and Day 50,
// alongside the finish. Custom-length challenges don't have that shared
// vocabulary, so they get evenly spaced thirds instead.
export function milestoneDays(lengthDays) {
  if (lengthDays === 75) return [25, 50, 75]
  if (lengthDays <= 3) return [lengthDays]
  const days = [Math.round(lengthDays / 3), Math.round((2 * lengthDays) / 3), lengthDays]
  return [...new Set(days)].sort((a, b) => a - b)
}

export function milestoneLabel(day, lengthDays) {
  if (day === lengthDays) return "Challenge complete!"
  return `Day ${day} down.`
}
