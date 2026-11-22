import { useState } from 'react'
import { Pencil, Sparkles, Dumbbell, Apple, Brain, Wallet, Library, Clock } from 'lucide-react'
import { Button, Card, Pill } from '../ui'
import { needsDetailedQuestions, normalizeAnswers } from '../../lib/plan/normalizeAnswers'
import OnboardingFlow from '../onboarding/OnboardingFlow'
import WorkoutTab from './WorkoutTab'
import NutritionTab from './NutritionTab'
import MindTab from './MindTab'
import MoneyTab from './MoneyTab'
import LearnTab from './LearnTab'
import DayTab from './DayTab'

const SECTIONS = [
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
  { id: 'nutrition', label: 'Nutrition', icon: Apple },
  { id: 'mind', label: 'Mind', icon: Brain },
  { id: 'money', label: 'Money', icon: Wallet },
  { id: 'learn', label: 'Learn', icon: Library },
  { id: 'day', label: 'My day', icon: Clock },
]

const TIER_LABELS = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' }

export default function PlanView({ plan: planApi, initialSection = 'workouts', workoutLogs = {}, weightUnit = 'lb', incomeLogs, setIncomeLogs }) {
  const [section, setSection] = useState(initialSection)
  const [editing, setEditing] = useState(false)
  const { plan, answers } = planApi

  if (!plan || !answers) {
    return <div className="max-w-xl mx-auto px-4 py-10 text-center text-[var(--ink-300)] text-sm">No plan yet — complete onboarding first.</div>
  }

  if (editing) {
    return (
      <OnboardingFlow
        initialAnswers={answers}
        title="Edit your plan"
        onCancel={() => setEditing(false)}
        onComplete={async (nextAnswers) => {
          await planApi.savePlan(nextAnswers, { source: 'manual_edit' })
          setEditing(false)
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  const normalized = normalizeAnswers(answers)
  const outdatedQuestions = needsDetailedQuestions(answers)

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-4">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <p className="text-[var(--ink-300)] text-xs uppercase tracking-[0.15em]">Your plan</p>
          <h1 className="font-display text-5xl leading-none text-[var(--ink-50)] mt-1">The Blueprint</h1>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {plan.intensityTier && <Pill tone="accent">{TIER_LABELS[plan.intensityTier]}</Pill>}
            <Pill>{plan.workout.sessionsPerWeek} strength days</Pill>
            {plan.workout.sessionMinutes && <Pill>{plan.workout.sessionMinutes} min sessions</Pill>}
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)} className="shrink-0 !px-3">
          <Pencil size={15} /> Edit
        </Button>
      </div>

      {outdatedQuestions && (
        <Card className="p-4 mb-5 border-[var(--accent-a40)] bg-[var(--accent-a10)]">
          <div className="flex gap-3">
            <Sparkles size={20} className="text-[var(--accent-light)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[var(--ink-50)]">Get a more personalized plan</p>
              <p className="text-sm text-[var(--ink-200)] mt-1">
                {(answers?.meta?.questionnaireVersion ?? 1) >= 2
                  ? 'New: a 7-day meal plan with recipes and a grocery list. Answer a few food questions (kitchen, budget, foods you avoid, cuisines) to build it around you.'
                  : 'We now ask much more detailed questions — fitness check, schedule, equipment, sleep, food, learning style and more.'}{' '}
                Your current answers are pre-filled; just fill in the new ones.
              </p>
              <Button className="mt-3" onClick={() => setEditing(true)}>
                Answer the new questions
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="-mx-4 px-4 overflow-x-auto mb-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 w-max">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              aria-pressed={section === id}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium border whitespace-nowrap transition-colors ${
                section === id
                  ? 'bg-[var(--ink-50)] text-[var(--ink-950)] border-[var(--ink-50)]'
                  : 'border-[var(--ink-700)] text-[var(--ink-200)] hover:text-[var(--ink-50)]'
              }`}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div key={section} className="animate-fade-in">
        {section === 'workouts' && <WorkoutTab plan={plan} answers={normalized} workoutLogs={workoutLogs} weightUnit={weightUnit} />}
        {section === 'nutrition' && <NutritionTab plan={plan} answers={normalized} />}
        {section === 'mind' && <MindTab plan={plan} />}
        {section === 'money' && <MoneyTab plan={plan} incomeLogs={incomeLogs} setIncomeLogs={setIncomeLogs} />}
        {section === 'learn' && <LearnTab answers={normalized} />}
        {section === 'day' && <DayTab plan={plan} />}
      </div>
    </div>
  )
}
