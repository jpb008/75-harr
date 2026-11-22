import { Ruler, User } from 'lucide-react'
import { SectionCard, Field, NumberInput, Segmented, ChipGroup, OptionCards } from '../ui'
import { SEX_OPTIONS, ACTIVITY_LEVELS } from '../../lib/plan/options'
import { HeightInput, WeightInput } from './MeasureInputs'

export default function AboutStep({ answers, update }) {
  const p = answers.personal
  const set = (patch) => update('personal', patch)

  return (
    <div className="space-y-4">
      <SectionCard icon={User} title="You" hint="Age and sex are used for calorie and hydration estimates — nothing else.">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age">
            <NumberInput value={p.age} onChange={(age) => set({ age, isUnder18: age != null && age < 18 })} min={13} max={100} placeholder="e.g. 25" />
          </Field>
          <Field label="Units">
            <Segmented
              options={[
                { id: 'imperial', label: 'lb / ft' },
                { id: 'metric', label: 'kg / cm' },
              ]}
              value={p.units}
              onChange={(units) => set({ units })}
            />
          </Field>
        </div>
        <Field label="Sex">
          <ChipGroup options={SEX_OPTIONS} value={p.sex} onChange={(sex) => set({ sex: sex ?? 'unspecified' })} />
        </Field>
      </SectionCard>

      <SectionCard icon={Ruler} title="Body measurements" hint="Used to calculate protein and calorie ranges. Skip these and you'll get general guidance instead.">
        <Field label="Height" optional>
          <HeightInput valueCm={p.heightCm} units={p.units} onChange={(heightCm) => set({ heightCm })} />
        </Field>
        <Field label="Current weight" optional>
          <WeightInput valueKg={p.weightKg} units={p.units} onChange={(weightKg) => set({ weightKg })} />
        </Field>
        <Field label="How active are you outside of workouts?" hint="Your job and daily life — not your training.">
          <OptionCards options={ACTIVITY_LEVELS} value={p.activityLevel} onChange={(activityLevel) => set({ activityLevel })} columns={2} />
        </Field>
      </SectionCard>
    </div>
  )
}
