import { Wallet, Briefcase, TrendingUp, PiggyBank, GraduationCap } from 'lucide-react'
import { SectionCard, Field, ChipGroup, OptionCards, NumberInput, Toggle, TextInput, DateInput } from '../ui'
import {
  EMPLOYMENT_STATUS,
  INCOME_INTERESTS,
  PATH_EXPERIENCE,
  STARTUP_BUDGETS,
  SKILLS,
  EMERGENCY_FUND_LEVELS,
  SPENDING_TRACKING,
  YES_NO_UNSURE,
} from '../../lib/plan/options'

export default function FinancialGoalsStep({ answers, update }) {
  const f = answers.financialGoals
  const set = (patch) => update('financialGoals', patch)
  const needsBudget = f.interests.some((i) => ['ecommerce', 'contentCreation', 'affiliateMarketing'].includes(i))

  return (
    <div className="space-y-4">
      <SectionCard icon={Wallet} title="Include money goals?">
        <Toggle
          checked={!f.skip}
          onChange={(on) => set({ skip: !on })}
          label="Add money & career goals to my plan"
          hint="Turn off to skip this section entirely."
        />
      </SectionCard>

      {!f.skip && (
        <>
          <SectionCard icon={Briefcase} title="Where you are now" hint="All optional. Your numbers stay private and are only used to calculate the pace needed to reach your target.">
            <Field label="Work situation">
              <OptionCards options={EMPLOYMENT_STATUS} value={f.employmentStatus} onChange={(employmentStatus) => set({ employmentStatus })} columns={2} />
            </Field>
            <Field label="Your job or field" optional>
              <TextInput value={f.occupation} onChange={(occupation) => set({ occupation })} placeholder="e.g. retail, nursing, student in marketing" />
            </Field>
            <div className="grid grid-cols-2 gap-3 items-end">
              <Field label="Income now / month">
                <NumberInput value={f.currentMonthlyIncome} onChange={(currentMonthlyIncome) => set({ currentMonthlyIncome })} min={0} suffix="$" />
              </Field>
              <Field label="Target / month">
                <NumberInput value={f.targetMonthlyIncome} onChange={(targetMonthlyIncome) => set({ targetMonthlyIncome })} min={0} suffix="$" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <Field label="Target date">
                <DateInput value={f.targetDate} onChange={(targetDate) => set({ targetDate })} />
              </Field>
              <Field label="Hours / week">
                <NumberInput value={f.hoursPerWeekAvailable} onChange={(hoursPerWeekAvailable) => set({ hoursPerWeekAvailable })} min={0} max={80} suffix="hrs" />
              </Field>
            </div>
          </SectionCard>

          <SectionCard icon={TrendingUp} title="How you want to grow income">
            <Field label="Paths you're interested in">
              <ChipGroup options={INCOME_INTERESTS} value={f.interests} onChange={(interests) => set({ interests })} multi />
            </Field>
            {f.interests.length > 0 && (
              <Field label="Your experience with these">
                <ChipGroup options={PATH_EXPERIENCE} value={f.pathExperience} onChange={(pathExperience) => set({ pathExperience: pathExperience ?? 'none' })} />
              </Field>
            )}
            {needsBudget && (
              <Field label="Money you could put in to start" hint="Low budgets get a 'test demand before you spend' approach.">
                <ChipGroup options={STARTUP_BUDGETS} value={f.startupBudget} onChange={(startupBudget) => set({ startupBudget })} />
              </Field>
            )}
          </SectionCard>

          <SectionCard icon={GraduationCap} title="Skills" hint="Skills you want to learn get their own section in your learning library.">
            <Field label="Skills you already have" optional>
              <ChipGroup options={SKILLS} value={f.currentSkills} onChange={(currentSkills) => set({ currentSkills })} multi />
            </Field>
            <Field label="Skills you want to learn">
              <ChipGroup options={SKILLS} value={f.desiredSkills} onChange={(desiredSkills) => set({ desiredSkills })} multi />
            </Field>
            <Field label="Other skills not listed" optional>
              <TextInput value={f.otherSkillsText} onChange={(otherSkillsText) => set({ otherSkillsText })} placeholder="e.g. 3D modeling, welding, Spanish" />
            </Field>
          </SectionCard>

          <SectionCard icon={PiggyBank} title="Money basics" hint="These add simple weekly habits based on government consumer-finance guidance. Not financial advice.">
            <Field label="Emergency savings (months of expenses)">
              <ChipGroup
                options={EMERGENCY_FUND_LEVELS}
                value={f.emergencyFundLevel}
                onChange={(emergencyFundLevel) => set({ emergencyFundLevel, hasEmergencyFund: ['3to6', 'over6'].includes(emergencyFundLevel) })}
              />
            </Field>
            <Field label="Do you have high-interest debt (like credit cards)?">
              <ChipGroup options={YES_NO_UNSURE} value={f.hasHighInterestDebt} onChange={(hasHighInterestDebt) => set({ hasHighInterestDebt })} />
            </Field>
            <Field label="Do you track your spending?">
              <ChipGroup options={SPENDING_TRACKING} value={f.tracksSpending} onChange={(tracksSpending) => set({ tracksSpending })} />
            </Field>
            <Field label="Do you have a retirement account?">
              <ChipGroup options={YES_NO_UNSURE} value={f.hasRetirementAccount} onChange={(hasRetirementAccount) => set({ hasRetirementAccount })} />
            </Field>
          </SectionCard>
        </>
      )}
    </div>
  )
}
