import { useEffect, useRef, useState } from 'react'

// Countdown between sets. Stores the END time, not a running count, so it
// stays right even if the phone locks or the app is in the background.
export function useRestTimer() {
  const [timer, setTimer] = useState(null) // { endAt, total, label }
  const [now, setNow] = useState(() => Date.now())
  const [finished, setFinished] = useState(null) // label of the rest that just ended
  const audioRef = useRef(null)

  useEffect(() => {
    if (!timer) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [timer])

  const remaining = timer ? Math.max(0, Math.ceil((timer.endAt - now) / 1000)) : 0

  useEffect(() => {
    if (!timer || remaining > 0) return
    setFinished(timer.label)
    setTimer(null)
    beep(audioRef.current)
    try {
      navigator.vibrate?.([250, 120, 250])
    } catch {
      // not supported (iPhone) — the beep and banner still show
    }
    const id = setTimeout(() => setFinished(null), 6000)
    return () => clearTimeout(id)
  }, [timer, remaining])

  function start(seconds, label) {
    // iPhone only allows sound from an AudioContext created during a tap.
    try {
      audioRef.current ??= new (window.AudioContext || window.webkitAudioContext)()
      audioRef.current.resume?.()
    } catch {
      audioRef.current = null
    }
    setFinished(null)
    setNow(Date.now())
    setTimer({ endAt: Date.now() + seconds * 1000, total: seconds, label })
  }

  function adjust(delta) {
    setTimer((t) => (t ? { ...t, endAt: Math.max(Date.now() + 1000, t.endAt + delta * 1000), total: Math.max(1, t.total + delta) } : t))
  }

  function stop() {
    setTimer(null)
    setFinished(null)
  }

  return { active: Boolean(timer), remaining, total: timer?.total ?? 0, label: timer?.label ?? '', finished, start, adjust, stop }
}

function beep(ctx) {
  if (!ctx) return
  try {
    for (const [offset, freq] of [
      [0, 880],
      [0.25, 880],
      [0.5, 1175],
    ]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset)
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + offset + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + offset)
      osc.stop(ctx.currentTime + offset + 0.22)
    }
  } catch {
    // audio unavailable
  }
}

export function formatClock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
