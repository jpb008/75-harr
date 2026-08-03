// Weekly goals are grouped by the challenge's own week number (Day 1-7 =
// Week 1, Day 8-14 = Week 2, ...) rather than the calendar week, so they
// stay in step with the challenge itself.
export function weekNumberForDay(dayNumber) {
  return Math.floor((Math.max(1, dayNumber) - 1) / 7) + 1
}
