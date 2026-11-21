// Every financial goal is structured as target -> milestones -> controllable
// weekly actions, modeled on CFPB's goal-setting worksheets (divide the
// total by time remaining to get a periodic "pace needed", never an
// earnings promise). Per-path guidance follows FTC rules on income-claim
// overpromising (no guarantees, no implied earnings), SBA general new-
// business guidance, and FTC Endorsement Guides (affiliate/sponsored
// disclosure is required regardless of audience size).
const WEEK_MS = 7 * 24 * 60 * 60 * 1000

function freelancingActions(hoursPerWeekAvailable) {
  const outreachCount = Math.max(2, Math.round((hoursPerWeekAvailable ?? 5) / 5))
  return {
    weeklyActions: [
      'Define or refine the one specific service you offer.',
      'Add one new sample to your portfolio.',
      `Reach out to ${outreachCount} potential clients.`,
      'Review and adjust your pricing based on what you hear back.',
    ],
    note: null,
    requiresDisclosureReminder: false,
  }
}

function ecommerceActions() {
  return {
    weeklyActions: [
      'Research your niche/product and supplier or platform costs.',
      'Set up or refine your storefront.',
      'Publish or update product listings.',
    ],
    note: 'New e-commerce businesses commonly take a few years (often cited around 3-4) to reach consistent profitability — pace your expectations accordingly.',
    requiresDisclosureReminder: false,
  }
}

function contentAffiliateActions() {
  return {
    weeklyActions: [
      'Publish at least one piece of content.',
      'Review what performed well last week and do more of that.',
    ],
    note: 'Always clearly disclose any affiliate or sponsored links — required by FTC guidelines regardless of audience size.',
    requiresDisclosureReminder: true,
  }
}

function skillBuildingActions(desiredSkills) {
  const skill = desiredSkills?.[0] ?? 'your target skill'
  return {
    weeklyActions: [
      `Complete focused learning sessions on ${skill} (aim for around 30 min/day).`,
      'Apply what you learned to one real task this week.',
    ],
    note: "Skill-building improves your qualifications, but no credible source can promise a timeline to a raise or new role — this builds your case, it doesn't decide the outcome.",
    requiresDisclosureReminder: false,
  }
}

function investingActions() {
  return {
    weeklyActions: [
      'Learn one new investing basic this week.',
      'If you invest, consider putting in a fixed amount on a regular schedule regardless of price (dollar-cost averaging) rather than trying to time the market.',
    ],
    note: "Investing can lose money. Nothing here is a specific recommendation, and past performance never predicts future results.",
    requiresDisclosureReminder: false,
  }
}

const PATH_BUILDERS = {
  freelancing: (goals) => freelancingActions(goals.hoursPerWeekAvailable),
  ecommerce: () => ecommerceActions(),
  contentCreation: () => contentAffiliateActions(),
  affiliateMarketing: () => contentAffiliateActions(),
  skillBuilding: (goals) => skillBuildingActions(goals.desiredSkills),
  investing: () => investingActions(),
}

function computeMilestones(financialGoals) {
  const { currentMonthlyIncome, targetMonthlyIncome, targetDate } = financialGoals
  if (typeof targetMonthlyIncome !== 'number' || !targetDate) return null

  const weeksRemaining = Math.max(1, Math.round((new Date(targetDate).getTime() - Date.now()) / WEEK_MS))
  const gap = targetMonthlyIncome - (currentMonthlyIncome ?? 0)

  return {
    targetMonthlyIncome,
    currentMonthlyIncome: currentMonthlyIncome ?? null,
    weeksRemaining,
    paceNeededPerWeek: gap > 0 ? Math.round(gap / weeksRemaining) : 0,
    framing:
      "This is the pace needed to close the gap by your target date, based on your own numbers — not a projection of what you will actually earn. The actions below are what's in your control; the outcome depends on effort, market conditions, and plenty that isn't.",
  }
}

export function generateFinancialPlan(answers) {
  const financialGoals = answers.financialGoals ?? {}
  const interests = financialGoals.interests ?? []

  const seen = new Set()
  const paths = []
  for (const interest of interests) {
    const builder = PATH_BUILDERS[interest]
    if (!builder || seen.has(builder)) continue
    seen.add(builder)
    paths.push({ id: interest, ...builder(financialGoals) })
  }

  return {
    milestones: computeMilestones(financialGoals),
    paths,
    fundamentalsTrack: financialGoals.hasEmergencyFund
      ? null
      : {
          label: 'Emergency fund awareness',
          note: 'Roughly a quarter of adults have no emergency savings at all. Separately from growing your income, consider setting aside even a small, regular amount for unplanned expenses.',
          priority: 'low',
        },
    disclaimer:
      "Projected based on your own inputs, not a promise of what you'll earn. Individual results vary — nothing here is financial advice.",
  }
}
