import { RESOURCES } from './resourceLibrary'
import { normalizeAnswers } from './normalizeAnswers'
import {
  FITNESS_GOALS,
  MENTAL_FOCUS_AREAS,
  READING_TOPICS,
  INCOME_INTERESTS,
  SKILLS,
  labelFor,
} from './options'

const EXTRA_TAG_LABELS = {
  liftingTechnique: 'Lifting technique',
  homeWorkout: 'Home workouts',
  nutrition: 'Nutrition',
  sleep: 'Sleep',
  recovery: 'Recovery',
  injuryPrevention: 'Injury prevention',
  lowBack: 'Lower back care',
  knee: 'Knee care',
  shoulder: 'Shoulder care',
  running: 'Running',
  cycling: 'Cycling',
  swimming: 'Swimming',
  meditation: 'Meditation',
  journaling: 'Journaling',
  stress: 'Stress',
  budgeting: 'Budgeting',
  debt: 'Paying off debt',
  emergencyFund: 'Emergency fund',
  careerGrowth: 'Career growth',
  negotiation: 'Negotiation',
  sales: 'Sales',
}

const ALL_LABEL_SOURCES = [FITNESS_GOALS, MENTAL_FOCUS_AREAS, READING_TOPICS, INCOME_INTERESTS, SKILLS]

export function tagLabel(tag) {
  if (EXTRA_TAG_LABELS[tag]) return EXTRA_TAG_LABELS[tag]
  for (const options of ALL_LABEL_SOURCES) {
    const hit = options.find((o) => o.id === tag)
    if (hit) return hit.label
  }
  return tag.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
}

const STYLE_TO_TYPES = {
  video: ['video', 'channel'],
  book: ['book'],
  course: ['course'],
  podcast: ['podcast'],
  article: ['article', 'guide', 'tool'],
}

const INJURY_TAGS = { low_back: 'lowBack', knee: 'knee', shoulder: 'shoulder' }

const STOPWORDS = new Set(['the', 'and', 'for', 'how', 'with', 'want', 'learn', 'about', 'more', 'get', 'better', 'into', 'that', 'this', 'my'])

function userLevel(experienceId) {
  if (['2to5y', 'over5y', 'experienced'].includes(experienceId)) return 'advanced'
  if (['6moTo2y', 'some'].includes(experienceId)) return 'intermediate'
  return 'beginner'
}

function scoreResource(resource, { weights, preferredTypes, level, budget }) {
  let matchScore = 0
  const matched = []
  for (const tag of resource.tags) {
    if (weights[tag]) {
      matchScore += weights[tag]
      matched.push(tag)
    }
  }
  if (matchScore === 0) return null
  if (budget === 'free' && !resource.free) return null

  let score = matchScore * 10
  if (preferredTypes.size && preferredTypes.has(resource.type)) score += 6
  if (resource.free) score += budget === 'any' ? 0 : 3
  if (budget === 'some' && !resource.free && resource.type === 'course') score -= 6
  if (resource.level === level || resource.level === 'all') score += 3
  if (level === 'beginner' && resource.level === 'advanced') score -= 8
  return { score, matched }
}

function pick(weights, ctx, { limit, types, exclude }) {
  const ranked = []
  for (const resource of RESOURCES) {
    if (exclude.has(resource.id)) continue
    if (types && !types.includes(resource.type)) continue
    const result = scoreResource(resource, { ...ctx, weights })
    if (result) ranked.push({ resource, ...result })
  }
  ranked.sort((a, b) => b.score - a.score)

  // Keep the list varied: no more than two of the same type in a section.
  const chosen = []
  const typeCounts = {}
  for (const item of ranked) {
    if (chosen.length >= limit) break
    if ((typeCounts[item.resource.type] ?? 0) >= 2 && ranked.length > limit) continue
    typeCounts[item.resource.type] = (typeCounts[item.resource.type] ?? 0) + 1
    chosen.push(item)
  }
  for (const item of chosen) exclude.add(item.resource.id)
  return chosen.map(({ resource, matched }) => ({ resource, why: matched.slice(0, 3).map(tagLabel) }))
}

function weightsFrom(tags, boost = []) {
  const weights = {}
  for (const tag of tags) weights[tag] = (weights[tag] ?? 0) + 1
  for (const tag of boost) if (weights[tag]) weights[tag] += 1
  return weights
}

function keywordMatches(text, exclude, budget) {
  const words = text
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
  if (!words.length) return { items: [], unmatched: [] }
  const unmatched = []
  const items = []
  for (const word of [...new Set(words)]) {
    const stem = word.length >= 7 ? word.replace(/(ism|ing)$/, '') : word
    const pattern = new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
    const hits = RESOURCES.filter((r) => {
      if (exclude.has(r.id) || (budget === 'free' && !r.free)) return false
      return pattern.test(`${r.title} ${r.summary} ${r.tags.join(' ')}`)
    }).slice(0, 2)
    if (!hits.length) unmatched.push(word)
    for (const r of hits) {
      exclude.add(r.id)
      items.push({ resource: r, why: [`"${word}"`] })
    }
  }
  return { items: items.slice(0, 6), unmatched }
}

// Deterministic "research partner": maps everything the user told us to
// curated, link-checked sources, ranked by how well they match, the
// user's preferred learning formats, level and budget.
export function recommendResources(rawAnswers) {
  const a = normalizeAnswers(rawAnswers)
  const preferredTypes = new Set(a.learning.styles.flatMap((s) => STYLE_TO_TYPES[s] ?? []))
  const budget = a.learning.budget
  const exclude = new Set()
  const sections = []

  // Fitness
  const fitnessTags = [...a.fitnessGoals.primary]
  if (['none', 'under6mo'].includes(a.training.experience) || a.fitnessGoals.pastObstacles.includes('knowledge')) fitnessTags.push('liftingTechnique')
  if (['home', 'outdoors'].includes(a.training.location)) fitnessTags.push('homeWorkout')
  for (const injury of a.training.injuries) fitnessTags.push(INJURY_TAGS[injury] ?? 'injuryPrevention')
  for (const pref of a.training.cardioPreferences) if (['running', 'cycling', 'swimming'].includes(pref)) fitnessTags.push(pref)
  if (['5k', '10k', 'half', 'marathon'].includes(a.fitnessGoals.enduranceEvent)) fitnessTags.push('running')
  if (a.fitnessGoals.enduranceEvent === 'cycling') fitnessTags.push('cycling')
  if (a.fitnessGoals.primary.some((g) => ['fatLoss', 'muscleGain'].includes(g))) fitnessTags.push('nutrition')
  if (a.personal.sleepQuality === 'poor' || (a.personal.sleepHours != null && a.personal.sleepHours < 7)) fitnessTags.push('sleep')
  if (a.fitnessGoals.pastObstacles.includes('soreness')) fitnessTags.push('recovery')
  if (a.fitnessGoals.tightAreas.length) fitnessTags.push('mobility')
  const fitnessCtx = { preferredTypes, level: userLevel(a.training.experience), budget }
  if (fitnessTags.length) {
    sections.push({
      id: 'fitness',
      title: 'Training & health',
      intro: 'Trusted guides for your goals, technique and recovery.',
      items: pick(weightsFrom(fitnessTags, [a.fitnessGoals.mainGoal]), fitnessCtx, { limit: 6, exclude }),
    })
  }

  // Mind & habits
  const mindTags = [...a.mentalGoals.focusAreas]
  if (a.mentalGoals.meditationInterest || a.mentalGoals.meditationExperience === 'regular') mindTags.push('meditation')
  if (a.mentalGoals.journalingInterest) mindTags.push('journaling')
  if (a.personal.stressLevel === 'high') mindTags.push('stress')
  if (mindTags.length) {
    sections.push({
      id: 'mind',
      title: 'Mind & habits',
      intro: 'Evidence-based reading and tools for the areas you want to work on.',
      items: pick(weightsFrom(mindTags, [a.mentalGoals.priorityFocus]), { ...fitnessCtx, level: 'beginner' }, { limit: 6, exclude }),
    })
  }

  // Reading list
  if (a.mentalGoals.readingInterest && a.mentalGoals.readingTopics.length) {
    sections.push({
      id: 'books',
      title: 'Your reading list',
      intro: 'Books picked from the topics you said you enjoy.',
      items: pick(weightsFrom(a.mentalGoals.readingTopics), { ...fitnessCtx, preferredTypes: new Set(['book']), level: 'beginner' }, { limit: 6, types: ['book'], exclude }),
    })
  }

  // Money & career
  if (!a.financialGoals.skip) {
    const moneyTags = [...a.financialGoals.interests]
    if (a.financialGoals.tracksSpending !== 'yes') moneyTags.push('budgeting')
    if (a.financialGoals.hasHighInterestDebt === 'yes') moneyTags.push('debt')
    if (!a.financialGoals.hasEmergencyFund) moneyTags.push('emergencyFund')
    if (a.financialGoals.interests.includes('skillBuilding')) moneyTags.push('careerGrowth')
    if (a.financialGoals.interests.includes('freelancing')) moneyTags.push('sales')
    if (moneyTags.length) {
      sections.push({
        id: 'money',
        title: 'Money & career',
        intro: 'Official guides and well-regarded resources — no get-rich-quick content.',
        items: pick(weightsFrom(moneyTags), { ...fitnessCtx, level: userLevel(a.financialGoals.pathExperience) }, { limit: 6, exclude }),
      })
    }
  }

  // Skills — one mini-list per skill so each one gets real coverage.
  const skills = [...new Set([...a.financialGoals.desiredSkills, ...a.learning.extraTopics])]
  for (const skill of skills) {
    const items = pick({ [skill]: 1 }, { ...fitnessCtx, level: 'beginner' }, { limit: 3, exclude })
    if (items.length) {
      sections.push({ id: `skill-${skill}`, title: `Learn: ${tagLabel(skill)}`, intro: 'Start with the first one; the others go deeper.', items })
    }
  }

  // Anything typed in free text gets a best-effort keyword match.
  const freeText = [a.learning.topicsFreeText, a.financialGoals.otherSkillsText].filter(Boolean).join(', ')
  const { items: freeItems, unmatched } = keywordMatches(freeText, exclude, budget)
  if (freeItems.length) {
    sections.push({ id: 'freeText', title: 'From your other topics', intro: 'Closest matches to what you typed.', items: freeItems })
  }

  return {
    sections: sections.filter((s) => s.items.length),
    unmatchedTopics: unmatched.map((topic) => ({
      topic,
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`learn ${topic} for beginners`)}`,
    })),
  }
}
