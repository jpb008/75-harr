import { ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'
import { Card, Button, Toggle } from './ui'

export const DEFAULT_ORDER = ['workout', 'meals', 'water', 'habits', 'money', 'photo', 'quote']

const LABELS = {
  workout: 'Workout',
  meals: "Today's meals",
  water: 'Water & sleep',
  habits: 'Mind & habits',
  money: 'Money moves',
  photo: 'Progress photo',
  quote: 'Your why',
}

export default function TodayCustomizer({ order, hidden, foldDone, available, onChange, onClose }) {
  const list = order.filter((id) => available.includes(id))
  function save(next) {
    onChange({ order: next.order ?? list, hidden: [...(next.hidden ?? hidden)], foldDone: next.foldDone ?? foldDone })
  }
  function move(i, dir) {
    const next = [...list]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    save({ order: next })
  }
  function toggleHidden(id) {
    const next = new Set(hidden)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    save({ hidden: next })
  }
  return (
    <Card className="p-4 space-y-3 border-[var(--accent-a40)]">
      <p className="text-sm font-semibold text-[var(--ink-50)]">Customize your Today screen</p>
      <p className="text-xs text-[var(--ink-300)]">Move cards up or down, or hide ones you don't use. Your 75 Hard checklist always stays at the top.</p>
      <ul className="divide-y divide-[var(--ink-800)]">
        {list.map((id, i) => {
          const isHidden = hidden.has(id)
          return (
            <li key={id} className="flex items-center gap-2 py-1.5">
              <span className={`flex-1 min-w-0 text-sm ${isHidden ? 'text-[var(--ink-400)] line-through' : 'text-[var(--ink-100)]'}`}>{LABELS[id] ?? id}</span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${LABELS[id]} up`} className="h-9 w-9 rounded-lg flex items-center justify-center text-[var(--ink-300)] hover:bg-[var(--ink-800)] disabled:opacity-30">
                <ArrowUp size={16} />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label={`Move ${LABELS[id]} down`} className="h-9 w-9 rounded-lg flex items-center justify-center text-[var(--ink-300)] hover:bg-[var(--ink-800)] disabled:opacity-30">
                <ArrowDown size={16} />
              </button>
              <button type="button" onClick={() => toggleHidden(id)} aria-label={isHidden ? `Show ${LABELS[id]}` : `Hide ${LABELS[id]}`} aria-pressed={!isHidden} className="h-9 w-9 rounded-lg flex items-center justify-center text-[var(--ink-300)] hover:bg-[var(--ink-800)]">
                {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </li>
          )
        })}
      </ul>
      <Toggle checked={foldDone} onChange={(on) => save({ foldDone: on })} label="Fold finished cards" hint="Done cards shrink to one line so what's left stands out." />
      <Button className="w-full" onClick={onClose}>
        Done
      </Button>
    </Card>
  )
}
