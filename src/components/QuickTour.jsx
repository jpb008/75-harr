import { useState } from 'react'
import { ListChecks, Dumbbell, UtensilsCrossed, ShoppingCart, Droplets, LineChart, Target, SlidersHorizontal, X } from 'lucide-react'
import { Button } from './ui'

const SLIDES = [
  { icon: ListChecks, title: 'Your day starts on Today', body: 'Tick off your 75 Hard checklist at the top. Below it is your plan for today: workout, meals, water and sleep, habits and money moves.' },
  { icon: Dumbbell, title: 'Log workouts, get stronger', body: 'Tap Log workout on training days. Enter your sets and the app suggests next time\'s weight. Tap the timer after a set for a rest countdown, and "How to do it" for form tips.' },
  { icon: UtensilsCrossed, title: 'Meals built for you', body: 'Plan → Nutrition has your 7-day meal plan with recipes. Tap a meal, then Swap meal if you want something else. Tick meals off on Today as you eat them.' },
  { icon: ShoppingCart, title: 'A grocery list that saves money', body: 'Under your meal plan: what to buy for each shopping trip, the cheapest way to buy it, an estimated total and the cheapest stores near you. Tick items off in the store.' },
  { icon: Droplets, title: 'Water and sleep', body: 'Tap 8 oz or 16 oz as you drink. Hit a gallon and the water task ticks itself. Log your sleep each morning; after short nights your workout gets an easier option.' },
  { icon: LineChart, title: 'See your progress', body: 'The Progress tab has your monthly report, strength and weight charts, workout history (fix or add past workouts) and your personal records.' },
  { icon: Target, title: 'Set targets', body: 'In Goals, add a target like "squat 225 lb" or a goal weight. The app shows how close you are and when you\'ll get there at your current pace.' },
  { icon: SlidersHorizontal, title: 'Make it yours', body: 'Tap Customize on Today to reorder or hide cards. Settings has reminders, recovery codes, an accountability-friend link and this tour again.' },
]

export default function QuickTour({ onClose }) {
  const [i, setI] = useState(0)
  const slide = SLIDES[i]
  const Icon = slide.icon
  const last = i === SLIDES.length - 1
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="Quick tour">
      <div className="relative w-full max-w-sm rounded-3xl border border-[var(--ink-700)] bg-[var(--ink-900)] p-6 shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close tour" className="absolute right-3 top-3 h-9 w-9 rounded-full flex items-center justify-center text-[var(--ink-300)] hover:bg-[var(--ink-800)]">
          <X size={18} />
        </button>
        <div className="h-12 w-12 rounded-2xl bg-[var(--accent-a15)] text-[var(--accent-light)] flex items-center justify-center mb-4">
          <Icon size={24} />
        </div>
        <p className="text-xs text-[var(--ink-400)] tabular-nums">
          {i + 1} of {SLIDES.length}
        </p>
        <h2 className="text-xl font-semibold text-[var(--ink-50)] mt-1">{slide.title}</h2>
        <p className="text-sm text-[var(--ink-200)] mt-2 leading-relaxed min-h-[6.5rem]">{slide.body}</p>
        <div className="flex justify-center gap-1.5 my-4" aria-hidden="true">
          {SLIDES.map((_, n) => (
            <span key={n} className={`h-1.5 rounded-full transition-all ${n === i ? 'w-5 bg-[var(--accent)]' : 'w-1.5 bg-[var(--ink-700)]'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          {i > 0 ? (
            <Button variant="secondary" className="flex-1" onClick={() => setI(i - 1)}>
              Back
            </Button>
          ) : (
            <Button variant="secondary" className="flex-1" onClick={onClose}>
              Skip
            </Button>
          )}
          <Button className="flex-1" onClick={() => (last ? onClose() : setI(i + 1))}>
            {last ? "Let's go" : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}
