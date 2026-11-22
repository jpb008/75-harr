import { useState } from 'react'
import { UtensilsCrossed, ShoppingCart, ChefHat, Info, Dumbbell, Shuffle, Undo2 } from 'lucide-react'
import { SectionCard, Disclosure, Pill, IconBadge, Button } from '../ui'

const DAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function Bar({ label, value, target, unit }) {
  if (!target) return null
  const [lo, hi] = Array.isArray(target) ? target : [target * 0.95, target * 1.05]
  const pct = Math.min(100, Math.round((value / hi) * 100))
  const onTarget = value >= lo * 0.95 && value <= hi * 1.1
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-[var(--ink-300)]">{label}</span>
        <span className={onTarget ? 'text-[var(--success)] font-medium' : 'text-[var(--ink-200)]'}>
          {value} / {Array.isArray(target) ? `${lo}-${hi}` : target} {unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--ink-800)] overflow-hidden">
        <div className={`h-full rounded-full ${onTarget ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function servingsText(servings) {
  return servings === 1 ? '1 serving' : `${servings} servings`
}

export function MealCard({ meal, showNumbers, onSwap, onUndoSwap }) {
  const subtitle = showNumbers ? `${servingsText(meal.servings)} · ${meal.kcal} kcal · ${meal.p} g protein` : meal.slotLabel
  return (
    <Disclosure
      left={<span className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-300)]">{meal.slotLabel}</span>}
      title={meal.name}
      subtitle={subtitle}
      right={
        meal.postWorkout ? (
          <Pill tone="accent">
            <Dumbbell size={11} /> Post-workout
          </Pill>
        ) : meal.swapped ? (
          <Pill>
            <Shuffle size={11} /> Swapped
          </Pill>
        ) : null
      }
    >
      <div className="space-y-3 pt-1">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-300)] mb-1.5">Ingredients</p>
          <ul className="space-y-1">
            {meal.ingredients.map((ing) => (
              <li key={ing.id} className="flex gap-2 text-sm text-[var(--ink-100)]">
                <span className="mt-2 h-1 w-1 rounded-full bg-[var(--ink-400)] shrink-0" />
                {showNumbers ? ing.display : ing.name}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-300)] mb-1.5">How to make it</p>
          <ol className="space-y-1">
            {meal.steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-[var(--ink-100)]">
                <span className="text-[var(--accent-light)] font-semibold tabular-nums">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        {showNumbers && (
          <p className="text-xs text-[var(--ink-400)]">
            {meal.c} g carbs · {meal.f} g fat
            {meal.addOn ? ' · added to reach your protein target' : meal.swappedForProtein ? ' · picked to reach your protein target' : ''}
          </p>
        )}
        {(onSwap || (meal.swapped && onUndoSwap)) && (
          <div className="flex gap-2 pt-1">
            {onSwap && (
              <Button variant="secondary" className="flex-1" onClick={onSwap}>
                <Shuffle size={15} /> Swap meal
              </Button>
            )}
            {meal.swapped && onUndoSwap && (
              <Button variant="secondary" className="flex-1" onClick={onUndoSwap}>
                <Undo2 size={15} /> Original
              </Button>
            )}
          </div>
        )}
      </div>
    </Disclosure>
  )
}

export default function MealPlanView({ mealPlan, meals }) {
  const todayDow = new Date().getDay()
  const [selected, setSelected] = useState(todayDow)
  const day = mealPlan.days.find((d) => d.dayOfWeek === selected) ?? mealPlan.days[0]
  const { showNumbers, targets } = mealPlan

  return (
    <div className="space-y-4">
      <SectionCard
        icon={UtensilsCrossed}
        title="Your meal plan"
        hint={
          showNumbers && targets?.kcal
            ? `Built around ${targets.kcal} kcal and ${targets.protein[0]}-${targets.protein[1]} g of protein a day. Tap a meal for ingredients, steps, or to swap it.`
            : 'Balanced meals built around your food answers. Tap a meal for ingredients, steps, or to swap it.'
        }
      >
        <div className="grid grid-cols-7 gap-1">
          {mealPlan.days
            .slice()
            .sort((x, y) => ((x.dayOfWeek + 6) % 7) - ((y.dayOfWeek + 6) % 7))
            .map((d) => {
              const active = d.dayOfWeek === day.dayOfWeek
              return (
                <button
                  key={d.dayOfWeek}
                  type="button"
                  onClick={() => setSelected(d.dayOfWeek)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1 rounded-xl py-2 transition-colors ${active ? 'bg-[var(--accent-a15)] ring-1 ring-[var(--accent)]' : 'hover:bg-[var(--ink-800)]'}`}
                >
                  <span className={`text-[11px] font-medium ${d.dayOfWeek === todayDow ? 'text-[var(--accent-light)]' : 'text-[var(--ink-300)]'}`}>{DAY_SHORT[d.dayOfWeek]}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${d.isTraining ? 'bg-[var(--accent)]' : 'bg-[var(--ink-700)]'}`} />
                </button>
              )
            })}
        </div>

        {showNumbers && targets?.kcal && (
          <div className="space-y-2.5">
            <Bar label="Calories" value={day.totals.kcal} target={targets.kcal} unit="kcal" />
            {targets.protein && <Bar label="Protein" value={day.totals.p} target={targets.protein} unit="g" />}
          </div>
        )}

        <div className="space-y-2">
          {day.meals.map((meal, i) => (
            <MealCard
              key={`${day.dayOfWeek}-${i}`}
              meal={meal}
              showNumbers={showNumbers}
              onSwap={meals && !meal.addOn && meals.canSwap(day.dayOfWeek, meal.slotIndex) ? () => meals.swap(day.dayOfWeek, meal.slotIndex) : null}
              onUndoSwap={meals && meal.swapped ? () => meals.resetSwap(day.dayOfWeek, meal.slotIndex) : null}
            />
          ))}
        </div>
      </SectionCard>

      {mealPlan.prepTips.length > 0 && (
        <SectionCard icon={ChefHat} title="Prep tips">
          <ul className="space-y-1.5">
            {mealPlan.prepTips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-[var(--ink-100)]">
                <span className="mt-2 h-1 w-1 rounded-full bg-[var(--ink-400)] shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <div>
        <Disclosure title="Grocery list for the week" subtitle="Everything for all 7 days, grouped by store section" left={<IconBadge icon={ShoppingCart} size="sm" />}>
          <div className="space-y-3">
            {mealPlan.groceryList.map((group) => (
              <div key={group.category}>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-300)] mb-1">{group.category}</p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => (
                    <li key={item.id} className="text-sm text-[var(--ink-100)]">
                      {showNumbers ? item.display : item.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Disclosure>
      </div>

      {mealPlan.notes.map((note, i) => (
        <p key={i} className="flex gap-2 text-sm text-[var(--ink-200)] px-1">
          <Info size={16} className="shrink-0 mt-0.5 text-[var(--ink-300)]" />
          {note}
        </p>
      ))}
      <p className="text-xs text-[var(--ink-400)] px-1">{mealPlan.disclaimer}</p>
    </div>
  )
}
