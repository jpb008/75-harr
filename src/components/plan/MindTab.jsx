import { Sun, CalendarCheck, Settings2, Hourglass, Sprout, Quote } from 'lucide-react'
import { SectionCard, Card } from '../ui'

function TaskList({ tasks }) {
  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li key={t.id} className="flex gap-2.5 text-sm text-[var(--ink-100)] leading-relaxed">
          <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--accent)] shrink-0" />
          {t.label}
        </li>
      ))}
    </ul>
  )
}

export default function MindTab({ plan }) {
  const m = plan.mentalDev
  const daily = m.tasks.filter((t) => t.cadence === 'daily')
  const weekly = m.tasks.filter((t) => t.cadence === 'weekly')

  return (
    <div className="space-y-4">
      {daily.length > 0 && (
        <SectionCard icon={Sun} title="Every day" hint={m.dailyMinutes ? `Fits your ${m.dailyMinutes} minutes a day. Check these off on the Today tab.` : null}>
          <TaskList tasks={daily} />
        </SectionCard>
      )}
      {weekly.length > 0 && (
        <SectionCard icon={CalendarCheck} title="Every week">
          <TaskList tasks={weekly} />
        </SectionCard>
      )}
      {m.setupSteps?.length > 0 && (
        <SectionCard icon={Settings2} title="One-time setup" hint="Small changes to your environment make the daily habits easier.">
          <TaskList tasks={m.setupSteps.map((label, i) => ({ id: `setup-${i}`, label }))} />
        </SectionCard>
      )}
      {m.deferredTasks?.length > 0 && (
        <SectionCard icon={Hourglass} title="Add these later" hint="Once your current habits feel automatic, swap one of these in — or raise your daily minutes in Edit answers.">
          <TaskList tasks={m.deferredTasks} />
        </SectionCard>
      )}
      <SectionCard icon={Sprout} title="How habits really form">
        <p className="text-sm text-[var(--ink-100)] leading-relaxed">{m.formationNote}</p>
      </SectionCard>
      {m.weaknessesNote && (
        <Card className="p-4 flex gap-3">
          <Quote size={18} className="text-[var(--accent-light)] shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--ink-100)] italic">{m.weaknessesNote}</p>
        </Card>
      )}
    </div>
  )
}
