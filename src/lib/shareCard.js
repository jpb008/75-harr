const SIZE = 1080

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

export function renderShareCard(canvas, { name, dayNumber, lengthDays, streak, isFinished }) {
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')

  const bg = cssVar('--ink-950', '#120a1f')
  const accent = cssVar('--accent', '#8b5cf6')
  const accentLight = cssVar('--accent-light', '#a78bfa')
  const text = cssVar('--ink-50', '#f4eeff')
  const muted = cssVar('--ink-300', '#8977a8')

  // Ground + ambient glow, echoing the app's own background treatment.
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, SIZE, SIZE)
  const glow = ctx.createRadialGradient(SIZE * 0.5, SIZE * 0.28, 0, SIZE * 0.5, SIZE * 0.28, SIZE * 0.65)
  glow.addColorStop(0, hexToRgba(accent, 0.28))
  glow.addColorStop(1, hexToRgba(accent, 0))
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, SIZE, SIZE)

  ctx.textAlign = 'center'

  // Wordmark
  ctx.font = '600 40px "Bebas Neue", sans-serif'
  ctx.fillStyle = accentLight
  ctx.letterSpacing = '4px'
  ctx.fillText('75 HARD', SIZE / 2, 190)
  ctx.letterSpacing = '0px'

  // Big day count
  ctx.font = '700 260px "Bebas Neue", sans-serif'
  ctx.fillStyle = text
  ctx.fillText(isFinished ? 'DONE' : `DAY ${dayNumber}`, SIZE / 2, 520)

  if (!isFinished) {
    ctx.font = '500 44px system-ui, sans-serif'
    ctx.fillStyle = muted
    ctx.fillText(`of ${lengthDays}`, SIZE / 2, 590)
  }

  // Streak
  ctx.font = '600 56px system-ui, sans-serif'
  ctx.fillStyle = text
  const streakLabel = isFinished ? `${lengthDays} days, zero misses` : `🔥 ${streak} day streak`
  ctx.fillText(streakLabel, SIZE / 2, 730)

  // Challenge name footer
  ctx.font = '500 32px system-ui, sans-serif'
  ctx.fillStyle = muted
  ctx.fillText(name, SIZE / 2, SIZE - 90)
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const int = parseInt(full, 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}
