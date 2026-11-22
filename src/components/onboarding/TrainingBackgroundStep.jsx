import { History, Gauge, Bandage } from 'lucide-react'
import { SectionCard, Field, ChipGroup, OptionCards, Segmented, Toggle, TextInput } from '../ui'
import {
  EXPERIENCE_LEVELS,
  PUSH_UP_LEVELS,
  PULL_UP_LEVELS,
  SQUAT_LEVELS,
  PLANK_LEVELS,
  CARDIO_ABILITY,
  INJURY_OPTIONS,
} from '../../lib/plan/options'

export default function TrainingBackgroundStep({ answers, update }) {
  const t = answers.training
  const set = (patch) => update('training', patch)

  return (
    <div className="space-y-4">
      <SectionCard icon={History} title="Experience">
        <Field label="How long have you trained consistently?">
          <OptionCards options={EXPERIENCE_LEVELS} value={t.experience} onChange={(experience) => set({ experience })} />
        </Field>
        <Field label="Days per week you exercise right now">
          <Segmented
            options={[0, 1, 2, 3, 4, 5, 6].map((n) => ({ id: n, label: n === 6 ? '6+' : String(n) }))}
            value={t.currentDaysPerWeek}
            onChange={(currentDaysPerWeek) => set({ currentDaysPerWeek })}
          />
        </Field>
      </SectionCard>

      <SectionCard
        icon={Gauge}
        title="Quick fitness check"
        hint="Best guesses are fine. These pick the right starting version of each exercise — for example, incline push-ups if regular ones aren't there yet."
      >
        <Field label="Push-ups in a row (good form)">
          <ChipGroup options={PUSH_UP_LEVELS} value={t.pushUps} onChange={(pushUps) => set({ pushUps })} />
        </Field>
        <Field label="Pull-ups in a row" hint="No bar? Pick your best guess or 'None yet'.">
          <ChipGroup options={PULL_UP_LEVELS} value={t.pullUps} onChange={(pullUps) => set({ pullUps })} />
        </Field>
        <Field label="Bodyweight squats in a row">
          <ChipGroup options={SQUAT_LEVELS} value={t.squats} onChange={(squats) => set({ squats })} />
        </Field>
        <Field label="Plank hold">
          <ChipGroup options={PLANK_LEVELS} value={t.plank} onChange={(plank) => set({ plank })} />
        </Field>
        <Field label="Cardio fitness">
          <OptionCards options={CARDIO_ABILITY} value={t.cardioAbility} onChange={(cardioAbility) => set({ cardioAbility })} />
        </Field>
      </SectionCard>

      <SectionCard
        icon={Bandage}
        title="Injuries & limitations"
        hint="Exercises that commonly aggravate these areas are swapped for gentler options. This is general guidance, not medical advice."
      >
        <Field label="Any areas to protect?" optional>
          <ChipGroup options={INJURY_OPTIONS} value={t.injuries} onChange={(injuries) => set({ injuries })} multi />
        </Field>
        <Toggle checked={t.painNow} onChange={(painNow) => set({ painNow })} label="I'm in pain right now" hint="We'll remind you to get it checked before training hard." />
        <Field label="Anything else about injuries or limitations?" optional hint="Shown back to you on your plan as a reminder.">
          <TextInput value={t.injuryNotes} onChange={(injuryNotes) => set({ injuryNotes })} placeholder="e.g. old ACL repair on my left knee" />
        </Field>
      </SectionCard>
    </div>
  )
}
