import { Brain, Smartphone, BookOpen, Feather } from 'lucide-react'
import { SectionCard, Field, ChipGroup, Segmented, NumberInput, Toggle, TextInput } from '../ui'
import {
  MENTAL_FOCUS_AREAS,
  DAILY_MINUTES,
  DISTRACTIONS,
  READING_FREQUENCY,
  READING_FORMATS,
  READING_TOPICS,
  MEDITATION_EXPERIENCE,
} from '../../lib/plan/options'

export default function MentalGoalsStep({ answers, update }) {
  const m = answers.mentalGoals
  const set = (patch) => update('mentalGoals', patch)

  function setFocus(focusAreas) {
    const priorityFocus = focusAreas.includes(m.priorityFocus) ? m.priorityFocus : focusAreas[0] ?? null
    set({ focusAreas, priorityFocus })
  }

  return (
    <div className="space-y-4">
      <SectionCard icon={Brain} title="What to work on" hint="Each area becomes a small, specific daily or weekly action — not a vague intention.">
        <Field label="Pick the areas you want to improve">
          <ChipGroup options={MENTAL_FOCUS_AREAS} value={m.focusAreas} onChange={setFocus} multi />
        </Field>
        {m.focusAreas.length > 1 && (
          <Field label="Your #1 priority" hint="This one always makes it into your day first.">
            <ChipGroup
              options={MENTAL_FOCUS_AREAS.filter((o) => m.focusAreas.includes(o.id))}
              value={m.priorityFocus}
              onChange={(priorityFocus) => set({ priorityFocus: priorityFocus ?? m.focusAreas[0] })}
            />
          </Field>
        )}
        <Field label="Minutes a day for personal development" hint="We fit your daily tasks into this — piling on too many at once is a common reason habits fail.">
          <Segmented options={DAILY_MINUTES.map((n) => ({ id: n, label: `${n}` }))} value={m.dailyMinutesAvailable} onChange={(dailyMinutesAvailable) => set({ dailyMinutesAvailable })} />
        </Field>
      </SectionCard>

      <SectionCard icon={Smartphone} title="Screen time & distractions" hint="Check your phone's screen-time settings for your real daily average.">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Daily screen time now" optional>
            <NumberInput value={m.currentScreenTimeHours} onChange={(currentScreenTimeHours) => set({ currentScreenTimeHours })} min={0} max={20} step={0.5} suffix="hrs" />
          </Field>
          <Field label="Your target" optional>
            <NumberInput value={m.screenTimeTargetHoursPerDay} onChange={(screenTimeTargetHoursPerDay) => set({ screenTimeTargetHoursPerDay })} min={0} max={20} step={0.5} suffix="hrs" />
          </Field>
        </div>
        <Field label="What pulls your attention most?" optional>
          <ChipGroup options={DISTRACTIONS} value={m.distractions} onChange={(distractions) => set({ distractions })} multi />
        </Field>
      </SectionCard>

      <SectionCard icon={BookOpen} title="Reading">
        <Toggle checked={m.readingInterest} onChange={(readingInterest) => set({ readingInterest })} label="Add daily reading to my plan" />
        {m.readingInterest && (
          <>
            <Field label="How often do you read now?">
              <ChipGroup options={READING_FREQUENCY} value={m.readingFrequency} onChange={(readingFrequency) => set({ readingFrequency })} />
            </Field>
            <Field label="Favorite format">
              <ChipGroup options={READING_FORMATS} value={m.readingFormat} onChange={(readingFormat) => set({ readingFormat: readingFormat ?? 'physical' })} />
            </Field>
            <Field label="Topics you'd enjoy" hint="These build your personal reading list.">
              <ChipGroup options={READING_TOPICS} value={m.readingTopics} onChange={(readingTopics) => set({ readingTopics })} multi />
            </Field>
          </>
        )}
      </SectionCard>

      <SectionCard icon={Feather} title="Reflection & calm">
        <Toggle checked={m.journalingInterest} onChange={(journalingInterest) => set({ journalingInterest })} label="Add a short daily journal" />
        <Field label="Meditation experience">
          <ChipGroup options={MEDITATION_EXPERIENCE} value={m.meditationExperience} onChange={(meditationExperience) => set({ meditationExperience: meditationExperience ?? 'never' })} />
        </Field>
        <Toggle checked={m.meditationInterest} onChange={(meditationInterest) => set({ meditationInterest })} label="Add daily meditation" hint="Starts at 5 minutes for beginners." />
        <Field label="Anything you'd like to change about yourself?" optional hint="Shown back to you as a reminder — never used to pick tasks automatically.">
          <TextInput multiline rows={2} value={m.weaknessesFreeText} onChange={(weaknessesFreeText) => set({ weaknessesFreeText })} />
        </Field>
      </SectionCard>
    </div>
  )
}
