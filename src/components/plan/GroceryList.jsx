import { useState } from 'react'
import { ShoppingCart, Store, Copy, Check, Lightbulb, Snowflake, RotateCcw } from 'lucide-react'
import { SectionCard, Segmented, Button, Disclosure } from '../ui'
import { shoppingListText } from '../../lib/plan/shopping'

export default function GroceryList({ plan, checked, onToggle, onClear }) {
  const [tripId, setTripId] = useState(plan.trips[0].id)
  const [copied, setCopied] = useState(false)
  const trip = plan.trips.find((t) => t.id === tripId) ?? plan.trips[0]
  const keys = trip.groups.flatMap((g) => g.items.map((i) => i.key))
  const done = keys.filter((k) => checked.has(k)).length
  const money = (n) => `${plan.symbol}${n.toFixed(2)}`

  async function copy() {
    try {
      const text = shoppingListText(plan, trip)
      if (navigator.share) await navigator.share({ text })
      else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // cancelled
    }
  }

  return (
    <SectionCard icon={ShoppingCart} title="Grocery list" hint="Built from this week's meal plan, split to match how often you shop. Tick items off in the store.">
      {plan.trips.length > 1 && <Segmented options={plan.trips.map((t) => ({ id: t.id, label: `${t.label} · ${t.covers}` }))} value={trip.id} onChange={setTripId} />}

      <div className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-950)] p-3">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-[var(--ink-300)]">{trip.coversText}</p>
            {plan.source && trip.pricedCount > 0 ? (
              <p className="text-2xl font-semibold text-[var(--ink-50)] tabular-nums leading-tight">
                ~{money(trip.total)} <span className="text-sm font-medium text-[var(--ink-300)]">{plan.currency}</span>
              </p>
            ) : (
              <p className="text-lg font-semibold text-[var(--ink-50)]">{trip.itemCount} items</p>
            )}
          </div>
          <p className="text-xs text-[var(--ink-300)] tabular-nums shrink-0">
            {done} of {keys.length} in cart
          </p>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-[var(--ink-800)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--success)] transition-[width]" style={{ width: `${keys.length ? (done / keys.length) * 100 : 0}%` }} />
        </div>
        {plan.source && trip.pricedCount > 0 && (
          <p className="text-[11px] text-[var(--ink-400)] mt-2">
            Estimate for {trip.pricedCount} of {trip.itemCount} items, at national average prices. Discount stores and store brands are usually cheaper.
          </p>
        )}
      </div>

      <Disclosure title="Where to shop for less" subtitle={plan.storeAdvice.split('.')[0]} left={<Store size={18} className="text-[var(--accent-light)] shrink-0" />}>
        <div className="space-y-2 text-sm text-[var(--ink-100)]">
          <p>{plan.storeAdvice}</p>
          <p>{plan.brandTip}</p>
          <ul className="space-y-1">
            {plan.tips.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1 w-1 rounded-full bg-[var(--ink-400)] shrink-0" />
                {t}
              </li>
            ))}
          </ul>
          {plan.source && (
            <p className="text-[11px] text-[var(--ink-400)]">
              Prices: {plan.source.label}. Real prices vary by store, city and week.{' '}
              <a href={plan.source.url} target="_blank" rel="noopener noreferrer" className="underline">
                Source
              </a>
            </p>
          )}
        </div>
      </Disclosure>

      <div className="space-y-4">
        {trip.groups.map((g) => (
          <div key={g.category}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-300)] mb-1">{g.category}</p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const isChecked = checked.has(item.key)
                return (
                  <li key={item.key}>
                    <label className={`flex items-start gap-3 rounded-xl px-2.5 py-2 cursor-pointer ${isChecked ? 'bg-[var(--accent-a08)]' : 'hover:bg-[var(--ink-800)]/50'}`}>
                      <input type="checkbox" checked={isChecked} onChange={() => onToggle(item.key)} className="task-check mt-0.5" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={`text-sm font-medium ${isChecked ? 'text-[var(--ink-400)] line-through' : 'text-[var(--ink-50)]'}`}>{item.name}</span>
                          {item.cost != null && <span className="text-xs text-[var(--ink-300)] tabular-nums shrink-0">~{money(item.cost)}</span>}
                        </span>
                        <span className="block text-xs text-[var(--ink-200)]">{item.buyText ? `Buy ${item.buyText}` : `Need ${item.needText}`}</span>
                        {item.buyText && <span className="block text-[11px] text-[var(--ink-400)]">Your meals use {item.needText}</span>}
                        {!isChecked && item.tip && (
                          <span className="flex gap-1 text-[11px] text-[var(--ink-300)] mt-0.5">
                            <Lightbulb size={11} className="shrink-0 mt-0.5 text-[var(--accent-light)]" />
                            {item.tip}
                          </span>
                        )}
                        {!isChecked && item.keepNote && (
                          <span className="flex gap-1 text-[11px] text-[var(--ink-300)] mt-0.5">
                            <Snowflake size={11} className="shrink-0 mt-0.5 text-[var(--accent-light)]" />
                            {item.keepNote}
                          </span>
                        )}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={copy}>
          {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Share list'}
        </Button>
        <Button variant="secondary" onClick={() => onClear(keys)} disabled={done === 0}>
          <RotateCcw size={15} /> Untick all
        </Button>
      </div>
    </SectionCard>
  )
}
