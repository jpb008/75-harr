import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { milestoneDays, milestoneLabel } from '../lib/milestones'

export function useMilestoneCelebration(challenge, dayNumber, todayComplete) {
  const [visibleDay, setVisibleDay] = useState(null)

  useEffect(() => {
    if (!challenge || !todayComplete) return
    const milestones = milestoneDays(challenge.lengthDays)
    if (!milestones.includes(dayNumber)) return

    const celebrated = loadJSON('celebratedMilestones', {})
    const already = celebrated[challenge.id] || []
    if (already.includes(dayNumber)) return

    setVisibleDay(dayNumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge?.id, dayNumber, todayComplete])

  function dismiss() {
    if (!challenge || visibleDay === null) return
    const celebrated = loadJSON('celebratedMilestones', {})
    const already = celebrated[challenge.id] || []
    saveJSON('celebratedMilestones', { ...celebrated, [challenge.id]: [...already, visibleDay] })
    setVisibleDay(null)
  }

  return {
    visible: visibleDay !== null,
    label: visibleDay !== null && challenge ? milestoneLabel(visibleDay, challenge.lengthDays) : '',
    isFinish: visibleDay !== null && challenge && visibleDay === challenge.lengthDays,
    dismiss,
  }
}
