import { useState } from 'react'
import {
  Dumbbell,
  HeartPulse,
  BedDouble,
  Footprints,
  Flame,
  Snowflake,
  TrendingUp,
  CalendarRange,
  AlertTriangle,
  Info,
  Lightbulb,
  PlayCircle,
  Repeat,
  StretchHorizontal,
  Timer,
  Zap,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import { Card, SectionCard, Disclosure, Pill, IconBadge } from '../ui'
import { WEEKDAYS } from '../../lib/plan/options'
import { suggestNext } from '../../lib/plan/progression'

const TYPE_STYLE = {
  strength: { icon: Dumbbell, dot: 'bg-[var(--accent)]', label: 'Strength' },
  cardio: { icon: HeartPulse, dot: 'bg-[var(--success)]', label: 'Cardio' },
  recovery: { icon: Footprints, dot: 'bg-[var(--ink-300)]', label: 'Recovery' },
  rest: { icon: BedDouble, dot: 'bg-[var(--ink-700)]', label: 'Rest' },
}

const NOTE_STYLE = {
  warning: { icon: AlertTriangle, tone: 'danger' },
  info: { icon: Info, tone: 'muted' },
  tip: { icon: Lightbulb, tone: 'accent' },
}

function formatReps(ex) {
  const [lo, hi] = ex.repRange
  const range = lo === hi ? `${lo}` : `${lo}-${hi}`
  if (ex.unit === 'seconds') return `${ex.sets} × ${range} sec`
  if (ex.unit === 'perSide') return `${ex.sets} × ${range} / side`
  return `${ex.sets} × ${range} reps`
}

function formatRest(seconds) {
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return s ? `${m}:${String(s).padStart(2, '0')} rest` : `${m} min rest`
  }
  return `${seconds}s rest`
}

function MoveList({ items }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-[var(--ink-200)]">
          <span className="mt-2 h-1 w-1 rounded-full bg-[var(--ink-400)] shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function ExerciseCard({ ex, index, workoutLogs, weightUnit, injuries }) {
  const suggestion = workoutLogs ? suggestNext(ex, workoutLogs, { unit: weightUnit, injuries }) : null
  return (
    <Disclosure
      left={
        <span className="h-8 w-8 rounded-lg bg-[var(--ink-800)] text-[var(--ink-100)] text-xs font-semibold flex items-center justify-center shrink-0">
          {ex.supersetGroup ?? index + 1}
        </span>
      }
      title={ex.name}
      subtitle={`${formatReps(ex)} · ${formatRest(ex.restSeconds)}`}
      right={
        ex.isPriority ? <Pill tone="accent">Priority</Pill> : ex.isFocus ? <Pill tone="accent">Focus</Pill> : null
      }
    >
      <div className="space-y-3 pt-1">
        {suggestion && (
          <div className="rounded-lg bg-[var(--accent-a10)] border border-[var(--accent-a40)] px-3 py-2">
            <p className="text-sm text-[var(--ink-50)]">
              <span className="font-semibold">Next time: </span>
              {suggestion.text}
            </p>
            {suggestion.last && <p className="text-xs text-[var(--ink-300)] mt-0.5">Last time: {suggestion.last}</p>}
          </div>
        )}
        {ex.cues?.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-300)] mb-1.5">How to do it</p>
            <ol className="space-y-1">
              {ex.cues.map((cue, i) => (
                <li key={i} className="flex gap-2 text-sm text-[var(--ink-100)]">
                  <span className="text-[var(--accent-light)] font-semibold tabular-nums">{i + 1}.</span>
                  {cue}
                </li>
              ))}
            </ol>
          </div>
        )}
        {ex.mistake && (
          <p className="text-sm text-[var(--ink-200)]">
            <span className="text-[var(--danger)] font-medium">Avoid: </span>
            {ex.mistake}
          </p>
        )}
        {ex.alternatives?.length > 0 && (
          <p className="text-sm text-[var(--ink-300)] flex gap-1.5">
            <Repeat size={15} className="mt-0.5 shrink-0" />
            <span>Swap options: {ex.alternatives.join(' · ')}</span>
          </p>
        )}
        {ex.videoUrl && (
          <a
            href={ex.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-light)] hover:underline"
          >
            <PlayCircle size={16} /> Watch form videos
          </a>
        )}
      </div>
    </Disclosure>
  )
}

export function SessionDetail({ session, workoutLogs, weightUnit, injuries }) {
  if (!session) return null
  if (session.type === 'cardio') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--ink-100)] leading-relaxed">{session.cardio.description}</p>
        <Disclosure title="Warm-up" left={<IconBadge icon={Flame} size="sm" tone="muted" />}>
          <MoveList items={session.warmup} />
        </Disclosure>
        <Disclosure title="Cool-down" left={<IconBadge icon={Snowflake} size="sm" tone="muted" />}>
          <MoveList items={session.cooldown} />
        </Disclosure>
      </div>
    )
  }
  return (
    <div className="space-y-2.5">
      {session.format === 'superset' && (
        <p className="text-xs text-[var(--ink-300)] rounded-lg bg-[var(--ink-950)] border border-[var(--ink-800)] px-3 py-2">
          <span className="text-[var(--ink-100)] font-medium">Supersets:</span> do A1 then A2 back-to-back, rest, and repeat for all sets before moving to B. Saves time without cutting work.
        </p>
      )}
      <Disclosure title="Warm-up" subtitle="About 5-8 minutes" left={<IconBadge icon={Flame} size="sm" tone="muted" />}>
        <MoveList items={session.warmup} />
      </Disclosure>
      {session.athleticBlock && (
        <Disclosure
          title={session.athleticBlock.title}
          subtitle={`About ${session.athleticBlock.minutes} minutes, right after warm-up`}
          left={<IconBadge icon={Zap} size="sm" />}
        >
          <div className="space-y-3">
            <p className="text-xs text-[var(--ink-300)]">{session.athleticBlock.note}</p>
            {session.athleticBlock.drills.map((d) => (
              <div key={d.name}>
                <p className="text-sm font-medium text-[var(--ink-50)]">
                  {d.name} <span className="text-[var(--ink-300)] font-normal">· {d.prescription}</span>
                </p>
                <p className="text-sm text-[var(--ink-200)]">{d.cue}</p>
              </div>
            ))}
          </div>
        </Disclosure>
      )}
      {session.exercises.map((ex, i) => (
        <ExerciseCard key={ex.exerciseId} ex={ex} index={i} workoutLogs={workoutLogs} weightUnit={weightUnit} injuries={injuries} />
      ))}
      {session.finisher && (
        <Disclosure title={`Finisher: ${session.finisher.label}`} subtitle={`${session.finisher.minutes} min`} left={<IconBadge icon={HeartPulse} size="sm" tone="success" />}>
          <p className="text-sm text-[var(--ink-200)]">{session.finisher.description}</p>
        </Disclosure>
      )}
      {session.sportPrep && (
        <Disclosure
          title={session.sportPrep.title}
          subtitle={`About ${session.sportPrep.minutes} minutes, injury prevention`}
          left={<IconBadge icon={ShieldCheck} size="sm" tone="success" />}
        >
          <div className="space-y-3">
            <p className="text-xs text-[var(--ink-300)]">{session.sportPrep.note}</p>
            {session.sportPrep.drills.map((d) => (
              <div key={d.name}>
                <p className="text-sm font-medium text-[var(--ink-50)]">
                  {d.name} <span className="text-[var(--ink-300)] font-normal">· {d.prescription}</span>
                </p>
                <p className="text-sm text-[var(--ink-200)]">{d.cue}</p>
              </div>
            ))}
          </div>
        </Disclosure>
      )}
      <Disclosure title="Cool-down" subtitle="About 5 minutes" left={<IconBadge icon={Snowflake} size="sm" tone="muted" />}>
        <MoveList items={session.cooldown} />
      </Disclosure>
    </div>
  )
}

export default function WorkoutTab({ plan, answers, workoutLogs, weightUnit }) {
  const workout = plan.workout
  const todayDow = new Date().getDay()
  const [selectedDay, setSelectedDay] = useState(todayDow)
  const day = workout.weekSchedule.find((d) => d.dayOfWeek === selectedDay)
  const session = workout.sessions.find((s) => s.dayOfWeek === selectedDay)
  const style = TYPE_STYLE[day.type] ?? TYPE_STYLE.rest
  const warnings = (workout.notes ?? []).filter((n) => n.kind === 'warning')
  const otherNotes = (workout.notes ?? []).filter((n) => n.kind !== 'warning')

  const seasonLabel = { inSeason: 'In season', preSeason: 'Pre-season', build: 'Off-season build' }
  return (
    <div className="space-y-4">
      {workout.sport && (
        <Card className="p-4 border-[var(--accent-a40)]">
          <div className="flex items-start gap-3">
            <IconBadge icon={Trophy} />
            <div className="min-w-0">
              <p className="text-[var(--ink-50)] font-semibold leading-tight">
                Built for {workout.sport.label.toLowerCase()}
                {workout.sport.position ? ` (${workout.sport.position})` : ''}
              </p>
              <p className="text-xs text-[var(--accent-light)] mt-0.5">{seasonLabel[workout.sport.season]}</p>
              <p className="text-sm text-[var(--ink-200)] mt-1.5 leading-relaxed">{workout.sport.focus}</p>
            </div>
          </div>
        </Card>
      )}
      {warnings.map((note, i) => (
        <Card key={i} className="p-3 flex gap-3 border-[var(--danger-border)]">
          <IconBadge icon={AlertTriangle} tone="danger" size="sm" />
          <p className="text-sm text-[var(--ink-100)] leading-relaxed">{note.text}</p>
        </Card>
      ))}
      {otherNotes.length > 0 && (
        <Disclosure
          title={`Plan notes (${otherNotes.length})`}
          subtitle="Why your plan looks the way it does, plus tips"
          left={<IconBadge icon={Lightbulb} size="sm" />}
        >
          <div className="space-y-3">
            {otherNotes.map((note, i) => {
              const s = NOTE_STYLE[note.kind] ?? NOTE_STYLE.info
              const NoteIcon = s.icon
              return (
                <p key={i} className="flex gap-2.5 text-sm text-[var(--ink-100)] leading-relaxed">
                  <NoteIcon size={16} className="shrink-0 mt-0.5 text-[var(--ink-300)]" />
                  {note.text}
                </p>
              )
            })}
          </div>
        </Disclosure>
      )}

      <Card className="p-3">
        <div className="grid grid-cols-7 gap-1">
          {workout.weekSchedule.map((d) => {
            const active = d.dayOfWeek === selectedDay
            const dStyle = TYPE_STYLE[d.type] ?? TYPE_STYLE.rest
            return (
              <button
                key={d.dayOfWeek}
                type="button"
                onClick={() => setSelectedDay(d.dayOfWeek)}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1.5 rounded-xl py-2 transition-colors ${
                  active ? 'bg-[var(--accent-a15)] ring-1 ring-[var(--accent)]' : 'hover:bg-[var(--ink-800)]'
                }`}
              >
                <span className={`text-[11px] font-medium ${d.dayOfWeek === todayDow ? 'text-[var(--accent-light)]' : 'text-[var(--ink-300)]'}`}>
                  {WEEKDAYS[d.dayOfWeek].slice(0, 2)}
                </span>
                <span className={`h-2 w-2 rounded-full ${dStyle.dot}`} />
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-3 text-[11px] text-[var(--ink-300)]">
          {['strength', 'cardio', 'recovery', 'rest'].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${TYPE_STYLE[t].dot}`} /> {TYPE_STYLE[t].label}
            </span>
          ))}
        </div>
      </Card>

      <SectionCard
        icon={style.icon}
        title={`${day.name}${selectedDay === todayDow ? ' (today)' : ''}: ${day.title}`}
        hint={session ? `About ${session.estimatedMinutes} minutes` : day.detail}
      >
        {session ? (
          <SessionDetail session={session} workoutLogs={workoutLogs} weightUnit={weightUnit} injuries={answers?.training?.injuries ?? []} />
        ) : workout.mobility ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-300)] mb-2">Mobility routine</p>
            <MoveList items={workout.mobility.moves} />
          </div>
        ) : (
          <p className="text-sm text-[var(--ink-300)]">Enjoy the day off — rest is when your body adapts to training.</p>
        )}
      </SectionCard>

      <SectionCard icon={TrendingUp} title="How to progress">
        <div className="space-y-3 text-sm text-[var(--ink-100)] leading-relaxed">
          <p>
            <span className="font-semibold text-[var(--ink-50)]">Effort: </span>
            {workout.effort}
          </p>
          <p>
            <span className="font-semibold text-[var(--ink-50)]">Progression: </span>
            {workout.progression}
          </p>
          <p className="text-[var(--ink-300)] text-xs">Log your weights and reps each session so you know what to beat next time.</p>
        </div>
      </SectionCard>

      <SectionCard icon={CalendarRange} title="Your 75-day roadmap">
        <ol className="relative border-l border-[var(--ink-700)] ml-2 space-y-4">
          {workout.phases.map((phase) => (
            <li key={phase.title} className="pl-4">
              <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
              <p className="text-xs text-[var(--accent-light)] font-semibold">{phase.weeks}</p>
              <p className="text-sm font-semibold text-[var(--ink-50)]">{phase.title}</p>
              <p className="text-sm text-[var(--ink-300)]">{phase.focus}</p>
            </li>
          ))}
        </ol>
        {workout.event && (
          <p className="text-sm text-[var(--ink-200)] rounded-xl bg-[var(--ink-950)] border border-[var(--ink-800)] px-3.5 py-3">
            {workout.event.weeksOut != null && <span className="font-semibold text-[var(--ink-50)]">{workout.event.weeksOut} weeks to your event. </span>}
            {workout.event.taperNote}
          </p>
        )}
      </SectionCard>

      <SectionCard icon={HeartPulse} title="Cardio & daily movement">
        <div className="space-y-2 text-sm text-[var(--ink-100)] leading-relaxed">
          <p>
            <span className="font-semibold text-[var(--ink-50)]">Weekly target: </span>~{workout.cardio.weeklyMinutes} minutes, counting walks.
          </p>
          <p>{workout.cardio.intensityNote}</p>
          {workout.cardio.sequencingNote && <p>{workout.cardio.sequencingNote}</p>}
          {workout.stepsTarget && (
            <p className="flex gap-2">
              <Footprints size={16} className="mt-0.5 shrink-0 text-[var(--accent-light)]" />
              <span>
                <span className="font-semibold text-[var(--ink-50)]">Steps: {workout.stepsTarget.target} a day. </span>
                {workout.stepsTarget.note}
              </span>
            </p>
          )}
        </div>
      </SectionCard>

      {workout.mobility && (
        <SectionCard icon={StretchHorizontal} title="Mobility routine" hint={workout.mobility.frequency}>
          <MoveList items={workout.mobility.moves} />
        </SectionCard>
      )}

      {(answers?.training?.injuryNotes || answers?.fitnessGoals?.motivationWhy) && (
        <SectionCard icon={Timer} title="Your notes">
          {answers.fitnessGoals.motivationWhy && (
            <p className="text-sm text-[var(--ink-100)]">
              <span className="font-semibold text-[var(--ink-50)]">Your why: </span>
              {answers.fitnessGoals.motivationWhy}
            </p>
          )}
          {answers.training.injuryNotes && (
            <p className="text-sm text-[var(--ink-100)]">
              <span className="font-semibold text-[var(--ink-50)]">Injury notes: </span>
              {answers.training.injuryNotes}
            </p>
          )}
        </SectionCard>
      )}
    </div>
  )
}
