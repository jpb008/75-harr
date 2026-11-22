import { Library, Compass } from 'lucide-react'
import { SectionCard, Field, ChipGroup, OptionCards, TextInput } from '../ui'
import { LEARNING_STYLES, LEARNING_BUDGETS, SKILLS } from '../../lib/plan/options'

export default function LearningStep({ answers, update }) {
  const l = answers.learning
  const set = (patch) => update('learning', patch)
  const alreadyChosen = new Set(answers.financialGoals.desiredSkills)
  const topicOptions = SKILLS.filter((s) => !alreadyChosen.has(s.id))

  return (
    <div className="space-y-4">
      <SectionCard
        icon={Library}
        title="Your learning library"
        hint="Your plan includes a library of hand-picked, link-checked sources — official guidelines, respected books, free courses and channels — matched to your answers."
      >
        <Field label="How do you like to learn?" hint="Matching formats are ranked higher.">
          <ChipGroup options={LEARNING_STYLES} value={l.styles} onChange={(styles) => set({ styles })} multi />
        </Field>
        <Field label="Budget for learning">
          <OptionCards options={LEARNING_BUDGETS} value={l.budget} onChange={(budget) => set({ budget })} />
        </Field>
      </SectionCard>

      <SectionCard icon={Compass} title="Anything else you want to learn?">
        <Field label="More topics" optional>
          <ChipGroup options={topicOptions} value={l.extraTopics} onChange={(extraTopics) => set({ extraTopics })} multi />
        </Field>
        <Field label="Or type your own" optional hint="Separate topics with commas. We'll find the closest sources, and give you a search link for anything we don't cover yet.">
          <TextInput value={l.topicsFreeText} onChange={(topicsFreeText) => set({ topicsFreeText })} placeholder="e.g. stoicism, negotiation, guitar" />
        </Field>
      </SectionCard>
    </div>
  )
}
