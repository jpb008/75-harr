import { Moon, HeartPulse, ShieldCheck } from 'lucide-react'
import { SectionCard, Field, NumberInput, ChipGroup, Segmented, Toggle } from '../ui'
import { SLEEP_QUALITY, STRESS_LEVELS, MEDICAL_FLAGS } from '../../lib/plan/options'
import { inputClass } from '../ui'

export default function HealthStep({ answers, update }) {
  const p = answers.personal
  const set = (patch) => update('personal', patch)

  return (
    <div className="space-y-4">
      <SectionCard icon={Moon} title="Sleep" hint="Sleep is when your body recovers and adapts. We build your evening routine around these times.">
        <div className="grid grid-cols-2 gap-3 items-end">
          <Field label="Usual wake-up time">
            <input type="time" value={p.wakeTime} onChange={(e) => set({ wakeTime: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Usual bedtime">
            <input type="time" value={p.bedTime} onChange={(e) => set({ bedTime: e.target.value })} className={inputClass} />
          </Field>
        </div>
        <Field label="Hours of sleep on a typical night" optional>
          <NumberInput value={p.sleepHours} onChange={(sleepHours) => set({ sleepHours })} min={3} max={12} step={0.5} suffix="hrs" placeholder="e.g. 7" />
        </Field>
        <Field label="How well do you usually sleep?">
          <Segmented options={SLEEP_QUALITY} value={p.sleepQuality} onChange={(sleepQuality) => set({ sleepQuality })} />
        </Field>
      </SectionCard>

      <SectionCard icon={HeartPulse} title="Stress" hint="High stress slows recovery, so your plan starts a little gentler if it's high.">
        <Field label="Your stress level lately">
          <Segmented options={STRESS_LEVELS} value={p.stressLevel} onChange={(stressLevel) => set({ stressLevel })} />
        </Field>
      </SectionCard>

      <SectionCard
        icon={ShieldCheck}
        title="Health check"
        hint="Private to you. Any of these means we'll recommend a doctor's OK first and start your plan conservatively."
      >
        <Field label="Do any of these apply to you?" hint="Based on the standard PAR-Q+ pre-exercise screening.">
          <ChipGroup options={MEDICAL_FLAGS} value={p.medicalFlags} onChange={(medicalFlags) => set({ medicalFlags })} multi />
        </Field>
        <div className="space-y-4 pt-1">
          {p.sex !== 'male' && (
            <Toggle checked={p.isPregnant} onChange={(isPregnant) => set({ isPregnant })} label="I'm currently pregnant" hint="Your plan will skip calorie and weight targets." />
          )}
          <Toggle
            checked={p.hasDisorderedEatingHistory}
            onChange={(hasDisorderedEatingHistory) => set({ hasDisorderedEatingHistory })}
            label="I have a history of disordered eating"
            hint="Your plan will focus on habits instead of numbers."
          />
        </div>
      </SectionCard>
    </div>
  )
}
