import { useEffect, useRef } from 'react'
import { Trophy } from 'lucide-react'
import { Button } from './ui'
import { launchConfetti } from './MilestoneOverlay'

export default function PrCelebration({ prs, onDismiss }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!canvasRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    return launchConfetti(canvasRef.current)
  }, [])
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="New personal record">
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0" />
      <div className="relative w-full max-w-sm rounded-3xl border border-[var(--accent-a40)] bg-[var(--ink-900)] p-6 text-center shadow-2xl">
        <div className="mx-auto mb-3 h-14 w-14 rounded-2xl bg-[var(--accent-a15)] flex items-center justify-center">
          <Trophy size={28} className="text-[var(--accent-light)]" />
        </div>
        <h2 className="font-display text-4xl leading-none text-[var(--ink-50)]">{prs.length === 1 ? 'New record!' : `${prs.length} new records!`}</h2>
        <ul className="mt-4 space-y-2 text-left">
          {prs.map((pr) => (
            <li key={pr.exerciseId} className="rounded-xl bg-[var(--ink-950)] border border-[var(--ink-800)] px-3 py-2">
              <p className="text-sm font-semibold text-[var(--ink-50)]">{pr.name}</p>
              <p className="text-xs text-[var(--ink-300)] tabular-nums">
                {pr.weighted
                  ? `${pr.detail} · est. max ${pr.value} ${pr.unit} (was ${pr.previous})`
                  : `${pr.value} ${pr.unit} (was ${pr.previous})`}
              </p>
            </li>
          ))}
        </ul>
        <Button className="w-full mt-5" onClick={onDismiss}>
          Let's go
        </Button>
      </div>
    </div>
  )
}
