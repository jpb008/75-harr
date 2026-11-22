import { Flame, Beef, Droplets, Wheat, Scale, UtensilsCrossed, Clock, Leaf } from 'lucide-react'
import { Card, SectionCard, Chip, IconBadge } from '../ui'
import Disclaimer from '../Disclaimer'

function Stat({ icon, label, value, sub }) {
  return (
    <Card className="p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <IconBadge icon={icon} size="sm" />
        <span className="text-xs text-[var(--ink-300)] font-medium">{label}</span>
      </div>
      <p className="text-xl font-semibold text-[var(--ink-50)] tabular-nums leading-tight">{value}</p>
      {sub && <p className="text-xs text-[var(--ink-400)] mt-1">{sub}</p>}
    </Card>
  )
}

function List({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-[var(--ink-200)]">
          <span className="mt-2 h-1 w-1 rounded-full bg-[var(--ink-400)] shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default function NutritionTab({ plan }) {
  const n = plan.nutrition
  const foods = n.proteinFoods ?? []
  const meals = n.mealIdeas ?? []

  return (
    <div className="space-y-4">
      {n.safeMode ? (
        <SectionCard icon={Leaf} title="Healthy-eating habits" hint="Your plan focuses on habits rather than numbers, based on your answers.">
          <List items={n.habits} />
        </SectionCard>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {n.calories ? (
              <Stat icon={Flame} label="Daily calories" value={`${n.calories.range[0]}-${n.calories.range[1]}`} sub={n.calories.label} />
            ) : (
              <Stat icon={Flame} label="Daily calories" value="—" sub="Add age, height & weight to estimate" />
            )}
            {n.proteinTarget?.gramsPerDay ? (
              <Stat icon={Beef} label="Protein" value={`${n.proteinTarget.gramsPerDay[0]}-${n.proteinTarget.gramsPerDay[1]}g`} sub={n.proteinTarget.perMealGrams ? `~${n.proteinTarget.perMealGrams}g per meal` : null} />
            ) : (
              <Stat icon={Beef} label="Protein" value={`${n.proteinTarget.gramsPerKgRange[0]}-${n.proteinTarget.gramsPerKgRange[1]} g/kg`} sub="Add your weight for grams" />
            )}
            {n.hydration && (
              <Stat
                icon={Droplets}
                label="Water"
                value={n.hydration.litersPerDayRange[0] === n.hydration.litersPerDayRange[1] ? `${n.hydration.litersPerDayRange[0]} L` : `${n.hydration.litersPerDayRange[0]}-${n.hydration.litersPerDayRange[1]} L`}
                sub="From drinks + food"
              />
            )}
            {n.fiberGrams && <Stat icon={Wheat} label="Fiber" value={`~${n.fiberGrams}g`} sub="14g per 1,000 kcal" />}
          </div>

          {(n.calories || n.rateOfChangeGuidance || n.weightTimeline) && (
            <SectionCard icon={Scale} title="Pace">
              <div className="space-y-2 text-sm text-[var(--ink-100)] leading-relaxed">
                {n.rateOfChangeGuidance && <p>{n.rateOfChangeGuidance}</p>}
                {n.weightTimeline && <p>{n.weightTimeline}</p>}
                {n.calories && (
                  <p className="text-[var(--ink-300)] text-xs">
                    Estimated maintenance: ~{n.calories.maintenance} kcal. {n.calories.note}
                  </p>
                )}
              </div>
            </SectionCard>
          )}
        </>
      )}

      {foods.length > 0 && (
        <SectionCard icon={Beef} title="Protein foods that fit your diet">
          <div className="flex flex-wrap gap-2">
            {foods.map((food) => (
              <Chip key={food} active={false}>
                {food}
              </Chip>
            ))}
          </div>
        </SectionCard>
      )}

      {meals.length > 0 && (
        <SectionCard icon={UtensilsCrossed} title="Meal ideas for your cooking time">
          <List items={meals} />
        </SectionCard>
      )}

      {n.timing && (
        <SectionCard icon={Clock} title="Around your workouts">
          <p className="text-sm text-[var(--ink-100)]">{n.timing}</p>
          {!n.safeMode && <List items={n.habits} />}
        </SectionCard>
      )}

      <Disclaimer text={n.disclaimer} />
    </div>
  )
}
