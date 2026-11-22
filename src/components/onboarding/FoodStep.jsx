import { Salad, ChefHat } from 'lucide-react'
import { SectionCard, Field, ChipGroup, OptionCards, Segmented } from '../ui'
import { DIET_PREFERENCES, DIET_RESTRICTIONS, COOKING_TIME } from '../../lib/plan/options'

export default function FoodStep({ answers, update }) {
  const p = answers.personal
  const set = (patch) => update('personal', patch)

  return (
    <div className="space-y-4">
      <SectionCard icon={Salad} title="What you eat" hint="We'll suggest protein sources and meals that fit your diet.">
        <Field label="Diet style">
          <ChipGroup options={DIET_PREFERENCES} value={p.dietPreference} onChange={(dietPreference) => set({ dietPreference: dietPreference ?? 'none' })} />
        </Field>
        <Field label="Restrictions or allergies" optional>
          <ChipGroup options={DIET_RESTRICTIONS} value={p.dietRestrictions} onChange={(dietRestrictions) => set({ dietRestrictions })} multi />
        </Field>
      </SectionCard>

      <SectionCard icon={ChefHat} title="Cooking & meals">
        <Field label="How much time do you have to cook?">
          <OptionCards options={COOKING_TIME} value={p.cookingTime} onChange={(cookingTime) => set({ cookingTime })} />
        </Field>
        <Field label="Meals per day (including snacks you'd call a meal)">
          <Segmented
            options={[2, 3, 4, 5].map((n) => ({ id: n, label: String(n) }))}
            value={p.mealsPerDay}
            onChange={(mealsPerDay) => set({ mealsPerDay })}
          />
        </Field>
      </SectionCard>
    </div>
  )
}
