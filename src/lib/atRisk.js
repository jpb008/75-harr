// null = no warning, 'warning' = getting late, 'urgent' = less than an hour left.
export function atRiskLevel(hour, todayComplete) {
  if (todayComplete) return null
  if (hour >= 23) return 'urgent'
  if (hour >= 21) return 'warning'
  return null
}
