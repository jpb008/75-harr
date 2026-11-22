import { useState } from 'react'
import { Salad, ChefHat, ShoppingCart, UtensilsCrossed, X, Plus } from 'lucide-react'
import { SectionCard, Field, ChipGroup, OptionCards, Segmented, Button, inputClass } from '../ui'
import {
  DIET_PREFERENCES,
  DIET_RESTRICTIONS,
  COOKING_TIME,
  KITCHEN_ACCESS,
  GROCERY_BUDGETS,
  SHOPPING_FREQUENCY,
  SHOPPING_STYLES,
  BREAKFAST_HABITS,
  MEAL_PREP_STYLES,
  MEAL_VARIETY,
} from '../../lib/plan/options'
import { FOOD_DISLIKES, CUISINES } from '../../lib/plan/foodLibrary'
import { describeCustomFood } from '../../lib/plan/mealPlan'

const DISLIKE_SECTIONS = [
  ['Protein', ['chicken', 'beef', 'turkey', 'fish', 'shrimp', 'eggs', 'beans', 'tofu', 'proteinPowder']],
  ['Dairy', ['milk', 'cheese', 'yogurt']],
  ['Carbs', ['rice', 'pasta', 'bread', 'tortillas', 'oats', 'potatoes', 'sweetPotatoes', 'quinoa']],
  ['Vegetables', ['broccoli', 'spinach', 'salad', 'peppers', 'onions', 'tomatoes', 'mixedVeg', 'avocado']],
  ['Fruit', ['bananas', 'berries', 'apples']],
  ['Other', ['peanutButter', 'nuts', 'seeds', 'salsa', 'soySauce', 'sweeteners']],
].map(([title, ids]) => [title, ids.map((id) => FOOD_DISLIKES.find((d) => d.id === id))])

function OtherFoods({ value, onChange }) {
  const [draft, setDraft] = useState('')
  function add() {
    const items = draft
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
    const next = [...value]
    for (const item of items) if (!next.some((x) => x.toLowerCase() === item.toLowerCase())) next.push(item.slice(0, 40))
    onChange(next.slice(0, 25))
    setDraft('')
  }
  return (
    <div className="space-y-2.5">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          add()
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. mushrooms, lemon, strawberries"
          aria-label="Another food you won't eat"
          enterKeyHint="done"
          className={`${inputClass} min-w-0 flex-1`}
        />
        <Button type="submit" variant="secondary" disabled={!draft.trim()} className="shrink-0 !px-3">
          <Plus size={16} /> Add
        </Button>
      </form>
      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((item) => {
            const info = describeCustomFood(item)
            return (
              <li key={item} className="flex items-start gap-2 rounded-xl border border-[var(--ink-800)] bg-[var(--ink-950)] px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--ink-50)] break-words">{item}</p>
                  <p className="text-xs text-[var(--ink-300)] mt-0.5">
                    {info.matched
                      ? `Leaves out: ${info.names.join(', ')}`
                      : info.mentioned > 0
                        ? `Skips ${info.mentioned} recipe${info.mentioned === 1 ? '' : 's'} that use it`
                        : "Not in any of our recipes, so it won't come up"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((x) => x !== item))}
                  aria-label={`Remove ${item}`}
                  className="shrink-0 -mr-1 p-1 rounded-lg text-[var(--ink-300)] hover:text-[var(--ink-50)] hover:bg-[var(--ink-800)]"
                >
                  <X size={16} />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function FoodStep({ answers, update }) {
  const p = answers.personal
  const set = (patch) => update('personal', patch)

  return (
    <div className="space-y-4">
      <SectionCard icon={Salad} title="What you eat" hint="Your weekly meal plan is built from these — every meal fits your diet and leaves out what you don't eat.">
        <Field label="Diet style">
          <ChipGroup options={DIET_PREFERENCES} value={p.dietPreference} onChange={(dietPreference) => set({ dietPreference: dietPreference ?? 'none' })} />
        </Field>
        <Field label="Restrictions or allergies" optional hint="Swapped automatically where possible (e.g. soy milk for milk, gluten-free pasta).">
          <ChipGroup options={DIET_RESTRICTIONS} value={p.dietRestrictions} onChange={(dietRestrictions) => set({ dietRestrictions })} multi />
        </Field>
        <Field label="Foods you won't eat" optional hint="Tap everything you don't eat. Where we can, it's swapped for something similar (no rice → quinoa or potato) instead of dropping the meal.">
          <div className="space-y-3">
            {DISLIKE_SECTIONS.map(([title, options]) => (
              <div key={title}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-400)] mb-1.5">{title}</p>
                <ChipGroup options={options} value={p.foodDislikes} onChange={(foodDislikes) => set({ foodDislikes })} multi />
              </div>
            ))}
          </div>
        </Field>
        <Field label="Anything else you won't eat?" optional hint="Type a food and tap Add. Separate several with commas.">
          <OtherFoods value={p.foodDislikesOther ?? []} onChange={(foodDislikesOther) => set({ foodDislikesOther })} />
        </Field>
        <Field label="Cuisines you love" optional hint="Meals from these come up more often.">
          <ChipGroup options={CUISINES} value={p.cuisines} onChange={(cuisines) => set({ cuisines })} multi />
        </Field>
      </SectionCard>

      <SectionCard icon={ChefHat} title="Your kitchen & time">
        <Field label="What kitchen do you have?">
          <OptionCards options={KITCHEN_ACCESS} value={p.kitchenAccess} onChange={(kitchenAccess) => set({ kitchenAccess })} />
        </Field>
        <Field label="How much time do you have to cook?">
          <OptionCards options={COOKING_TIME} value={p.cookingTime} onChange={(cookingTime) => set({ cookingTime })} />
        </Field>
        <Field label="How do you like to cook?">
          <OptionCards options={MEAL_PREP_STYLES} value={p.mealPrepStyle} onChange={(mealPrepStyle) => set({ mealPrepStyle })} columns={2} />
        </Field>
      </SectionCard>

      <SectionCard icon={UtensilsCrossed} title="Your eating pattern">
        <Field label="Meals per day (counting snacks you'd call a meal)">
          <Segmented options={[2, 3, 4, 5].map((n) => ({ id: n, label: String(n) }))} value={p.mealsPerDay} onChange={(mealsPerDay) => set({ mealsPerDay })} />
        </Field>
        <Field label="Do you eat breakfast?">
          <Segmented options={BREAKFAST_HABITS} value={p.eatsBreakfast} onChange={(eatsBreakfast) => set({ eatsBreakfast })} />
        </Field>
        <Field label="Are protein shakes okay?" hint="Shakes make high protein targets much easier, but whole food works too.">
          <Segmented
            options={[
              { id: 'yes', label: 'Yes' },
              { id: 'no', label: 'Whole food only' },
            ]}
            value={p.proteinShakes}
            onChange={(proteinShakes) => set({ proteinShakes })}
          />
        </Field>
        <Field label="How much variety do you want?">
          <OptionCards options={MEAL_VARIETY} value={p.mealVariety} onChange={(mealVariety) => set({ mealVariety })} />
        </Field>
      </SectionCard>

      <SectionCard icon={ShoppingCart} title="Groceries">
        <Field label="Grocery budget">
          <OptionCards options={GROCERY_BUDGETS} value={p.groceryBudget} onChange={(groceryBudget) => set({ groceryBudget })} />
        </Field>
        <Field label="How often do you shop for groceries?" hint="Your grocery list is split into trips to match.">
          <OptionCards options={SHOPPING_FREQUENCY} value={p.shoppingFrequency ?? 'weekly'} onChange={(shoppingFrequency) => set({ shoppingFrequency })} />
        </Field>
        <Field label="Where do you like to shop?">
          <OptionCards options={SHOPPING_STYLES} value={p.shoppingStyle ?? 'cheapest'} onChange={(shoppingStyle) => set({ shoppingStyle })} />
        </Field>
      </SectionCard>
    </div>
  )
}
