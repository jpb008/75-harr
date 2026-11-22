import { Target, Crosshair, Flag, Brain } from 'lucide-react'
import { SectionCard, Field, ChipGroup, TextInput, inputClass } from '../ui'
import {
  FITNESS_GOALS,
  MUSCLE_FOCUS_AREAS,
  PRIORITY_LIFTS,
  ENDURANCE_EVENTS,
  SPORT_TYPES,
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
          <input type="date" value={f.targetDate ?? ''} onChange={(e) => set({ targetDate: e.target.value || null })} className={inputClass} />
        </Field>
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
                  <input type="date" value={f.eventDate ?? ''} onChange={(e) => set({ eventDate: e.target.value || null })} className={inputClass} />
                </Field>
              )}
            </>
          )}
          {has('athleticPerformance') && (
            <>
              <Field label="What kind of sport?">
                <ChipGroup options={SPORT_TYPES} value={f.sportType} onChange={(sportType) => set({ sportType })} />
              </Field>
              <Field label="Which sport or position?" optional>
                <TextInput value={f.sportName} onChange={(sportName) => set({ sportName })} placeholder="e.g. basketball, point guard" />
              </Field>
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
