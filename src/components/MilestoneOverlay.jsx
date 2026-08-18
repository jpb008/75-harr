import { useEffect, useRef } from 'react'

function launchConfetti(canvas) {
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = window.innerWidth * dpr
  canvas.height = window.innerHeight * dpr
  canvas.style.width = window.innerWidth + 'px'
  canvas.style.height = window.innerHeight + 'px'
  ctx.scale(dpr, dpr)

  const styles = getComputedStyle(document.documentElement)
  const colors = [
    styles.getPropertyValue('--accent').trim() || '#8b5cf6',
    styles.getPropertyValue('--accent-light').trim() || '#a78bfa',
    styles.getPropertyValue('--success').trim() || '#34d399',
    '#ffffff',
  ]

  const count = 140
  const particles = Array.from({ length: count }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
    y: window.innerHeight * 0.35 + (Math.random() - 0.5) * 40,
    vx: (Math.random() - 0.5) * 9,
    vy: Math.random() * -9 - 4,
    size: Math.random() * 6 + 4,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.3,
    life: 0,
  }))

  let raf
  const start = performance.now()
  const duration = 2400

  function frame(now) {
    const elapsed = now - start
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    for (const p of particles) {
      p.vy += 0.22 // gravity
      p.x += p.vx
      p.y += p.vy
      p.rotation += p.vr
      p.life = elapsed / duration
      const alpha = Math.max(0, 1 - p.life)
      ctx.save()
      ctx.globalAlpha = alpha
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      ctx.restore()
    }
    if (elapsed < duration) raf = requestAnimationFrame(frame)
    else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
  }
  raf = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(raf)
}

export default function MilestoneOverlay({ label, isFinish, onDismiss }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !canvasRef.current) return
    return launchConfetti(canvasRef.current)
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      <div className="relative bg-[var(--ink-900)] border border-[var(--ink-700)] rounded-2xl px-8 py-10 max-w-sm w-full text-center shadow-2xl">
        <p className="text-4xl mb-3">{isFinish ? '🎉' : '🔥'}</p>
        <h2 className="font-display text-3xl text-[var(--ink-50)] mb-2 text-balance">{label}</h2>
        <p className="text-[var(--ink-300)] text-sm mb-6">
          {isFinish ? 'Every single day, no exceptions. That was the hard part.' : 'Keep going — the streak is still alive.'}
        </p>
        <button
          onClick={onDismiss}
          className="w-full rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white font-medium py-2.5 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}
