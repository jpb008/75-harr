import { CalendarDays, Dumbbell, HeartPulse } from 'lucide-react'
import { SectionCard, Field, ChipGroup, OptionCards, Segmented } from '../ui'
import { WEEKDAYS, SESSION_LENGTHS, TRAINING_LOCATIONS, EQUIPMENT_OPTIONS, CARDIO_PREFERENCES } from '../../lib/plan/options'

export default function ScheduleStep({ answers, update }) {
  const t = answers.training
  const set = (patch) => update('training', patch)
  const dayOptions = WEEKDAYS.map((label, i) => ({ id: i, label }))

  return (
    <div className="space-y-4">
      <SectionCard icon={CalendarDays} title="When you can train" hint="Strength days are spread out; any extra days become cardio or active recovery.">
        <Field label="Which days can you train?">
          <ChipGroup
            options={dayOptions}
            value={t.weeklyScheduleAvailableDays}
            onChange={(days) => set({ weeklyScheduleAvailableDays: [...days].sort((a, b) => a - b) })}
            multi
          />
        </Field>
        <Field label="How long can each session be?">
          <Segmented
            options={SESSION_LENGTHS.map((m) => ({ id: m, label: `${m}` }))}
            value={t.sessionMinutes}
            onChange={(sessionMinutes) => set({ sessionMinutes })}
          />
          <p className="text-xs text-[var(--ink-400)] mt-1.5">Minutes, including warm-up and cool-down.</p>
        </Field>
        <Field label="Preferred time of day">
          <Segmented
            options={[
              { id: 'morning', label: 'Morning' },
              { id: 'afternoon', label: 'Afternoon' },
              { id: 'evening', label: 'Evening' },
            ]}
            value={t.preferredTimeOfDay}
            onChange={(preferredTimeOfDay) => set({ preferredTimeOfDay })}
          />
        </Field>
      </SectionCard>

      <SectionCard icon={Dumbbell} title="Where & with what">
        <Field label="Where will you train most?">
          <OptionCards options={TRAINING_LOCATIONS} value={t.location} onChange={(location) => set({ location })} columns={2} />
        </Field>
        {t.location === 'gym' ? (
          <p className="text-sm text-[var(--ink-300)] rounded-xl bg-[var(--ink-950)] border border-[var(--ink-800)] px-3.5 py-3">
            We'll assume a standard gym: barbells, dumbbells, machines, cables and cardio equipment.
          </p>
        ) : (
          <Field label="Equipment you have" hint="Leave everything unselected for a bodyweight-only plan.">
            <ChipGroup options={EQUIPMENT_OPTIONS} value={t.equipment} onChange={(equipment) => set({ equipment })} multi />
          </Field>
        )}
      </SectionCard>

      <SectionCard icon={HeartPulse} title="Cardio you enjoy" hint="Enjoyment is one of the best predictors of sticking with exercise, so we use what you like.">
        <Field label="Pick any" optional>
          <ChipGroup options={CARDIO_PREFERENCES} value={t.cardioPreferences} onChange={(cardioPreferences) => set({ cardioPreferences })} multi />
        </Field>
      </SectionCard>
    </div>
  )
}
