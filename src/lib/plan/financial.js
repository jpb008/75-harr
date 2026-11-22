import { normalizeAnswers } from './normalizeAnswers'
import { SKILLS, labelFor } from './options'

// Every financial goal is structured as target -> milestones -> controllable
// weekly actions, modeled on CFPB's goal-setting worksheets (divide the
// total by time remaining to get a periodic "pace needed", never an
// earnings promise). Per-path guidance follows FTC rules on income-claim
// overpromising (no promises, no implied earnings), SBA general new-
// business guidance, and FTC Endorsement Guides (affiliate/sponsored
// disclosure is required regardless of audience size). The "money basics"
// track follows CFPB/FDIC consumer education: track spending, build a
// starter emergency fund, prioritize high-interest debt.
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function minutesPerDay(hoursPerWeek) {
  if (!hoursPerWeek) return 30
  return Math.max(15, Math.round(((hoursPerWeek * 60) / 7) / 15) * 15)
}

function freelancingActions(f) {
  const outreachCount = Math.max(2, Math.round((f.hoursPerWeekAvailable ?? 5) / 3))
  const starting = f.pathExperience === 'none'
  return {
    weeklyActions: starting
      ? [
          'Pick one specific service you can deliver with the skills you have now.',
          'Create one portfolio sample (a real or practice project) for that service.',
          `Reach out to ${outreachCount} people or businesses who might need it.`,
          'Write down what each person said so you can refine your offer.',
        ]
      : [
          'Refine your service description around the results clients care about.',
          'Add one new piece of work or testimonial to your portfolio.',
          `Reach out to ${outreachCount} potential clients, including past ones.`,
          'Review your pricing against what you hear back.',
        ],
    note: 'Set aside part of every payment for taxes — freelancers usually pay quarterly estimated taxes in the U.S.',
    requiresDisclosureReminder: false,
  }
}

function ecommerceActions(f) {
  const lowBudget = ['0', 'under100'].includes(f.startupBudget)
  return {
    weeklyActions: [
      'Research one product idea: who buys it, what competitors charge, and your real costs.',
      lowBudget ? 'Test demand cheaply before buying inventory (pre-orders, a small batch, or made-to-order).' : 'Order samples before committing to inventory.',
      'Set up or improve one part of your storefront or listings.',
    ],
    note: 'New e-commerce businesses commonly take a few years (often cited around 3-4) to reach consistent profitability — pace your expectations and spending accordingly.',
    requiresDisclosureReminder: false,
  }
}

function contentAffiliateActions() {
  return {
    weeklyActions: [
      'Publish at least one piece of content on a schedule you can keep.',
      'Check last week\'s numbers and do more of what people engaged with.',
      'Spend 20 minutes studying one creator you admire in your niche.',
    ],
    note: 'Always clearly disclose affiliate or sponsored links — required by FTC rules regardless of audience size.',
    requiresDisclosureReminder: true,
  }
}

function skillBuildingActions(f) {
  const skills = f.desiredSkills.map((id) => labelFor(SKILLS, id))
  const other = f.otherSkillsText ? f.otherSkillsText.split(',').map((s) => s.trim()).filter(Boolean) : []
  const skill = [...skills, ...other][0] ?? 'your target skill'
  return {
    weeklyActions: [
      `Do focused learning on ${skill} — about ${minutesPerDay(f.hoursPerWeekAvailable)} min a day (see the Learn section for where to start).`,
      'Apply what you learned to one real task or small project this week.',
      'Share or save your work so you build proof of the skill.',
    ],
    note: "Skill-building strengthens your case for a raise or new role, but no one can promise a timeline — it improves your odds, it doesn't decide the outcome.",
    requiresDisclosureReminder: false,
  }
}

function investingActions(f) {
  const actions = [
    'Learn one investing basic this week (for example: what an index fund is, or how fees affect returns).',
    'If you invest, consider a fixed amount on a regular schedule regardless of price (dollar-cost averaging) rather than trying to time the market.',
  ]
  if (f.hasRetirementAccount !== 'yes' && ['employed', 'partTime'].includes(f.employmentStatus)) {
    actions.push('Ask HR whether your employer offers a retirement plan and a matching contribution.')
  }
  return {
    weeklyActions: actions,
    note: 'Investing can lose money. Nothing here is a specific recommendation, and past performance never predicts future results.',
    requiresDisclosureReminder: false,
  }
}

function fundamentalsActions(f) {
  const actions = []
  if (f.hasHighInterestDebt === 'yes') {
    actions.push('Put any extra payment toward your highest-interest debt (avalanche) or smallest balance (snowball) — and keep paying the minimum on the rest.')
  }
  if (['none', 'under1', null].includes(f.emergencyFundLevel) && !f.hasEmergencyFund) {
    actions.push('Move a small fixed amount (even $10-25) into a separate savings account toward a starter emergency fund.')
  }
  if (f.tracksSpending !== 'yes') actions.push('Spend 10 minutes reviewing last week\'s spending: needs, wants, and savings.')
  return actions
}

const PATH_BUILDERS = {
  freelancing: freelancingActions,
  ecommerce: ecommerceActions,
  contentCreation: contentAffiliateActions,
  affiliateMarketing: contentAffiliateActions,
  skillBuilding: skillBuildingActions,
  investing: investingActions,
}

function computeMilestones(f) {
  const { currentMonthlyIncome, targetMonthlyIncome, targetDate } = f
  if (typeof targetMonthlyIncome !== 'number' || !targetDate) return null

  const weeksRemaining = Math.max(1, Math.round((new Date(targetDate).getTime() - Date.now()) / WEEK_MS))
  const gap = targetMonthlyIncome - (currentMonthlyIncome ?? 0)
  const checkpoints = gap > 0
    ? [0.25, 0.5, 0.75, 1].map((fraction) => ({
        week: Math.round(weeksRemaining * fraction),
        monthlyIncome: Math.round((currentMonthlyIncome ?? 0) + gap * fraction),
      }))
    : []

  return {
    targetMonthlyIncome,
    currentMonthlyIncome: currentMonthlyIncome ?? null,
    weeksRemaining,
    paceNeededPerWeek: gap > 0 ? Math.round(gap / weeksRemaining) : 0,
    checkpoints,
    framing:
      "This is the pace needed to close the gap by your target date, based on your own numbers — not a projection of what you'll actually make. The actions below are what's in your control; the outcome depends on effort, market conditions, and plenty that isn't.",
  }
}

export function generateFinancialPlan(rawAnswers) {
  const a = normalizeAnswers(rawAnswers)
  const f = a.financialGoals
  const disclaimer =
    "Projected based on your own inputs, not a promise of what you'll make. Individual results vary — nothing here is financial advice."

  if (f.skip) {
    return { skipped: true, milestones: null, paths: [], fundamentalsTrack: null, disclaimer }
  }

  // Keep the weekly checklist realistic for the hours available: a long
  // list of actions gets ignored, a short one gets done.
  const perPathCap = (f.hoursPerWeekAvailable ?? 5) < 5 ? 2 : 3
  const seen = new Set()
  const paths = []
  for (const interest of f.interests) {
    const builder = PATH_BUILDERS[interest]
    if (!builder || seen.has(builder)) continue
    seen.add(builder)
    const built = builder(f)
    paths.push({ id: interest, ...built, weeklyActions: built.weeklyActions.slice(0, perPathCap) })
  }

  const basics = fundamentalsActions(f).slice(0, 2)
  if (basics.length) {
    paths.push({ id: 'fundamentals', weeklyActions: basics, note: null, requiresDisclosureReminder: false })
  }

  return {
    skipped: false,
    milestones: computeMilestones(f),
    paths,
    hoursPerWeek: f.hoursPerWeekAvailable,
    fundamentalsTrack: f.hasEmergencyFund
      ? null
      : {
          label: 'Emergency fund',
          note: 'Roughly a quarter of adults have no emergency savings at all. A common first milestone is a small starter fund, then building toward 3-6 months of essential expenses.',
          priority: 'low',
        },
    disclaimer,
  }
}
