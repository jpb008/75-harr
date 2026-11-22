import { Target, Crosshair, Flag, Brain, Trophy } from 'lucide-react'
import { SectionCard, Field, ChipGroup, TextInput, Segmented, DateInput } from '../ui'
import {
  FITNESS_GOALS,
  MUSCLE_FOCUS_AREAS,
  PRIORITY_LIFTS,
  ENDURANCE_EVENTS,
  SPORTS,
  SEASONS,
  TIGHT_AREAS,
  PAST_OBSTACLES,
} from '../../lib/plan/options'
import { WeightInput } from './MeasureInputs'

export default function FitnessGoalsStep({ answers, update }) {
  const f = answers.fitnessGoals
  const units = answers.personal.units
  const set = (patch) => update('fitnessGoals', patch)
  const has = (id) => f.primary.includes(id)

  function setGoals(primary) {
    const mainGoal = primary.includes(f.mainGoal) ? f.mainGoal : primary[0] ?? null
    set({ primary, mainGoal })
  }

  return (
    <div className="space-y-4">
      <SectionCard icon={Target} title="Your goals">
        <Field label="What do you want to achieve physically?" hint="Pick everything that matters to you.">
          <ChipGroup options={FITNESS_GOALS} value={f.primary} onChange={setGoals} multi />
        </Field>
        {f.primary.length > 1 && (
          <Field label="Which one matters most right now?" hint="Your plan's rep ranges and structure lean toward this one.">
            <ChipGroup
              options={FITNESS_GOALS.filter((g) => f.primary.includes(g.id))}
              value={f.mainGoal}
              onChange={(mainGoal) => set({ mainGoal: mainGoal ?? f.primary[0] })}
            />
          </Field>
        )}
        <Field label="Target date" optional hint="Leave blank if there's no deadline.">
          <DateInput value={f.targetDate} onChange={(targetDate) => set({ targetDate })} />
        </Field>
      </SectionCard>

      <SectionCard
        icon={Trophy}
        title="Your sport"
        hint="If you play a sport, your whole routine is built around it: sport-specific jumps and agility, extra work for the muscles it relies on, injury-prevention exercises, and conditioning that matches how it's played."
      >
        <Field label="Do you play a sport?">
          <ChipGroup
            options={[{ id: 'noSport', label: 'No sport' }, ...SPORTS]}
            value={f.sport ?? 'noSport'}
            onChange={(sport) => set({ sport: sport && sport !== 'noSport' ? sport : null })}
          />
        </Field>
        {f.sport && (
          <>
            <Field label="Position" optional hint="Shown on your plan so you can see it's built for you.">
              <TextInput value={f.sportPosition} onChange={(sportPosition) => set({ sportPosition })} placeholder="e.g. point guard, striker, goalie" />
            </Field>
            <Field label="Where are you in your season?" hint="In season, lifting shifts to maintaining strength so your legs stay fresh for games.">
              <ChipGroup options={SEASONS} value={f.season} onChange={(season) => set({ season: season ?? 'none' })} />
            </Field>
            <Field label="Practices and games per week">
              <Segmented
                options={[0, 1, 2, 3, 4, 5, 6].map((n) => ({ id: n, label: n === 6 ? '6+' : String(n) }))}
                value={f.practiceDaysPerWeek}
                onChange={(practiceDaysPerWeek) => set({ practiceDaysPerWeek })}
              />
            </Field>
          </>
        )}
      </SectionCard>

      {f.primary.length > 0 && (
        <SectionCard icon={Crosshair} title="Get specific" hint="These details change which exercises you get and how they're ordered.">
          {(has('fatLoss') || has('muscleGain')) && (
            <Field label="Goal weight" optional>
              <WeightInput
                valueKg={f.targetWeightKg}
                units={units}
                onChange={(targetWeightKg) =>
                  set({ targetWeightKg, fatLoss: has('fatLoss') ? { currentWeightKg: answers.personal.weightKg, targetWeightKg } : f.fatLoss })
                }
              />
            </Field>
          )}
          {(has('muscleGain') || has('strength')) && (
            <Field label="Areas you most want to build" optional hint="These get extra sets and move earlier in your workouts.">
              <ChipGroup options={MUSCLE_FOCUS_AREAS} value={f.muscleFocus} onChange={(muscleFocus) => set({ muscleFocus })} multi max={3} />
            </Field>
          )}
          {has('strength') && (
            <Field label="Lifts you want to get stronger at" optional hint="These lead your sessions with heavier, lower-rep work.">
              <ChipGroup options={PRIORITY_LIFTS} value={f.priorityLifts} onChange={(priorityLifts) => set({ priorityLifts })} multi />
            </Field>
          )}
          {has('endurance') && (
            <>
              <Field label="Training for an event?">
                <ChipGroup options={ENDURANCE_EVENTS} value={f.enduranceEvent} onChange={(enduranceEvent) => set({ enduranceEvent: enduranceEvent ?? 'none' })} />
              </Field>
              {f.enduranceEvent !== 'none' && (
                <Field label="Event date" optional>
                  <DateInput value={f.eventDate} onChange={(eventDate) => set({ eventDate })} />
                </Field>
              )}
            </>
          )}
          <Field label="Areas that feel tight or stiff" optional hint="Adds a short mobility routine targeting these.">
            <ChipGroup options={TIGHT_AREAS} value={f.tightAreas} onChange={(tightAreas) => set({ tightAreas })} multi />
          </Field>
        </SectionCard>
      )}

      <SectionCard icon={Flag} title="What's gotten in the way before?" hint="We adjust the plan and add tips for each one you pick.">
        <ChipGroup options={PAST_OBSTACLES} value={f.pastObstacles} onChange={(pastObstacles) => set({ pastObstacles })} multi />
      </SectionCard>

      <SectionCard icon={Brain} title="Your why" hint="People who connect a goal to something personal stick with it longer. We'll show this back to you.">
        <TextInput
          multiline
          rows={2}
          value={f.motivationWhy}
          onChange={(motivationWhy) => set({ motivationWhy })}
          placeholder="e.g. I want to keep up with my kids and feel confident again"
        />
      </SectionCard>
    </div>
  )
}
