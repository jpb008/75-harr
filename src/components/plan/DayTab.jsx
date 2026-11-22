import { Dumbbell, Brain, Wallet, Coffee } from 'lucide-react'
import { Card } from '../ui'

const CATEGORY = {
  workout: { icon: Dumbbell, color: 'text-[var(--accent-light)] bg-[var(--accent-a15)]' },
  mentalDev: { icon: Brain, color: 'text-[var(--success)] bg-[var(--success-soft)]' },
  financial: { icon: Wallet, color: 'text-amber-300 bg-amber-400/10' },
  routine: { icon: Coffee, color: 'text-[var(--ink-200)] bg-[var(--ink-800)]' },
}

function to12h(time) {
  const [h, m] = time.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`
}

export default function DayTab({ plan }) {
  const blocks = plan.schedule?.blocks ?? []
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--ink-300)] px-1">A suggested shape for a training day. Treat it as a template, not a rulebook.</p>
      <Card className="p-4">
        <ol className="space-y-1">
          {blocks.map((block, i) => {
            const c = CATEGORY[block.category] ?? CATEGORY.routine
            const Icon = c.icon
            return (
              <li key={i} className="flex items-center gap-3 py-1.5">
                <span className="w-16 shrink-0 text-xs text-[var(--ink-300)] tabular-nums text-right">{to12h(block.time)}</span>
                <span className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${c.color}`}>
                  <Icon size={15} />
                </span>
                <span className="text-sm text-[var(--ink-100)]">{block.label}</span>
              </li>
            )
          })}
        </ol>
      </Card>
    </div>
  )
}
