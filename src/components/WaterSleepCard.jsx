import { Droplets, Moon, Minus, Plus } from 'lucide-react'
import { Card, IconBadge, Button, NumberInput } from './ui'
import { formatWater } from '../lib/dailyHealth'

export default function WaterSleepCard({ waterMl, goalMl, units, onAddWater, sleep, onSetSleep, waterTaskLabel, autoTicked }) {
  const pct = Math.min(100, Math.round(((waterMl + 1) / goalMl) * 100))
  const done = waterMl >= goalMl - 1
  // Exact ounce size so 8 × 16 oz is exactly a gallon.
  const OZ = 29.5735
  const steps = units === 'metric' ? [{ ml: 250, label: '+250 ml' }, { ml: 500, label: '+500 ml' }] : [{ ml: 8 * OZ, label: '+8 oz' }, { ml: 16 * OZ, label: '+16 oz' }]
  const undo = units === 'metric' ? 250 : 8 * OZ

  return (
    <Card className="p-4 space-y-4">
      <div>
        <div className="flex items-center gap-3 mb-2.5">
          <IconBadge icon={Droplets} tone={done ? 'success' : 'accent'} />
          <div className="min-w-0 flex-1">
            <p className="text-[var(--ink-50)] font-semibold leading-tight">Water</p>
            <p className="text-xs text-[var(--ink-300)] tabular-nums">
              {formatWater(waterMl, units)} of {formatWater(goalMl, units)}
              {done ? ' · goal reached' : ''}
            </p>
          </div>
          <span className="text-sm font-semibold text-[var(--ink-50)] tabular-nums">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--ink-800)] overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Water today">
          <div className={`h-full rounded-full transition-[width] duration-300 ${done ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="grid grid-cols-[2.75rem_1fr_1fr] gap-2 mt-3">
          <Button variant="secondary" className="!px-0" onClick={() => onAddWater(-undo)} disabled={waterMl <= 0} aria-label="Undo last glass">
            <Minus size={16} />
          </Button>
          {steps.map((s) => (
            <Button key={s.ml} variant="secondary" onClick={() => onAddWater(s.ml)}>
              <Plus size={15} /> {s.label.replace('+', '')}
            </Button>
          ))}
        </div>
        {autoTicked && waterTaskLabel && <p className="text-xs text-[var(--success)] mt-2">Ticked off "{waterTaskLabel}" for you.</p>}
      </div>

      <div className="border-t border-[var(--ink-800)] pt-4">
        <div className="flex items-center gap-3">
          <IconBadge icon={Moon} />
          <div className="min-w-0 flex-1">
            <p className="text-[var(--ink-50)] font-semibold leading-tight">Sleep last night</p>
            <p className="text-xs text-[var(--ink-300)]">
              {sleep.avg7 != null ? `${sleep.avg7.toFixed(1)} h average over ${sleep.nightsLogged} night${sleep.nightsLogged === 1 ? '' : 's'}` : 'Log it each morning'}
            </p>
          </div>
          <div className="w-28 shrink-0">
            <NumberInput value={sleep.lastNight} onChange={onSetSleep} min={0} max={16} step={0.5} suffix="h" placeholder="Hours" />
          </div>
        </div>
        {sleep.low && (
          <p className="mt-3 rounded-xl border border-[var(--accent-a40)] bg-[var(--accent-a08)] px-3 py-2 text-xs text-[var(--ink-100)]">
            Short on sleep — your workout card has an easier option for today.
          </p>
        )}
      </div>
    </Card>
  )
}
