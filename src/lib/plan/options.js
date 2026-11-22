// Single source of truth for every structured onboarding choice. The
// questionnaire renders these and the rule engine branches on the ids, so
// a label change never silently breaks plan generation.

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const SEX_OPTIONS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'unspecified', label: 'Prefer not to say' },
]

export const COUNTRIES = [
  { id: 'us', label: 'United States' },
  { id: 'ca', label: 'Canada' },
  { id: 'other', label: 'Somewhere else' },
]

export const ACTIVITY_LEVELS = [
  { id: 'sedentary', label: 'Mostly sitting', hint: 'Desk job, little walking' },
  { id: 'light', label: 'Lightly active', hint: 'Some walking, on your feet part of the day' },
  { id: 'moderate', label: 'Active', hint: 'On your feet most of the day' },
  { id: 'very', label: 'Very active', hint: 'Physical job or lots of daily movement' },
]

export const SLEEP_QUALITY = [
  { id: 'poor', label: 'Poor' },
  { id: 'fair', label: 'Okay' },
  { id: 'good', label: 'Good' },
]

export const STRESS_LEVELS = [
  { id: 'low', label: 'Low' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'high', label: 'High' },
]

// PAR-Q+-style screening items: any "yes" means we recommend medical
// clearance before starting, and the plan starts conservatively.
export const MEDICAL_FLAGS = [
  { id: 'heart', label: 'Heart condition' },
  { id: 'chestPain', label: 'Chest pain during activity' },
  { id: 'bloodPressure', label: 'High blood pressure' },
  { id: 'dizziness', label: 'Dizziness or fainting' },
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'jointSurgery', label: 'Recent surgery or joint replacement' },
  { id: 'medication', label: 'Medication that affects exercise' },
]

export const DIET_PREFERENCES = [
  { id: 'none', label: 'No preference' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Kosher' },
]

export const DIET_RESTRICTIONS = [
  { id: 'glutenFree', label: 'Gluten-free' },
  { id: 'dairyFree', label: 'Dairy-free' },
  { id: 'nutAllergy', label: 'Nut allergy' },
  { id: 'soyFree', label: 'Soy-free' },
]

export const COOKING_TIME = [
  { id: 'minimal', label: 'Almost none', hint: 'Quick, no-cook or grab-and-go' },
  { id: 'some', label: 'Some', hint: '15-30 min on most days' },
  { id: 'lots', label: 'I enjoy cooking', hint: 'Happy to meal prep' },
]

export const KITCHEN_ACCESS = [
  { id: 'full', label: 'Full kitchen', hint: 'Stove, oven and fridge' },
  { id: 'microwave', label: 'Microwave + fridge only', hint: 'Dorm room, office or shared space' },
  { id: 'none', label: 'No kitchen', hint: 'Only food that needs no cooking' },
]

export const GROCERY_BUDGETS = [
  { id: 'tight', label: 'Tight', hint: 'Cheapest options first: eggs, beans, chicken, oats' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'flexible', label: 'Flexible', hint: 'Salmon, shrimp and the like are fine' },
]

export const BREAKFAST_HABITS = [
  { id: 'yes', label: 'Yes' },
  { id: 'sometimes', label: 'Sometimes' },
  { id: 'no', label: 'I skip it' },
]

export const MEAL_PREP_STYLES = [
  { id: 'fresh', label: 'Cook as I go', hint: 'Quick meals made fresh each day' },
  { id: 'batch', label: 'Batch cook', hint: 'Cook twice a week, eat leftovers' },
]

export const MEAL_VARIETY = [
  { id: 'same', label: 'Same few meals', hint: 'Simple, easy shopping' },
  { id: 'some', label: 'Some variety' },
  { id: 'lots', label: 'Lots of variety', hint: 'Different meals most days' },
]

export const EXPERIENCE_LEVELS = [
  { id: 'none', label: 'Never trained consistently' },
  { id: 'under6mo', label: 'Less than 6 months' },
  { id: '6moTo2y', label: '6 months to 2 years' },
  { id: '2to5y', label: '2 to 5 years' },
  { id: 'over5y', label: '5+ years' },
]

export const PUSH_UP_LEVELS = [
  { id: '0', label: 'None yet' },
  { id: '1-5', label: '1-5' },
  { id: '6-15', label: '6-15' },
  { id: '16-30', label: '16-30' },
  { id: '30+', label: '30+' },
]

export const PULL_UP_LEVELS = [
  { id: '0', label: 'None yet' },
  { id: '1-3', label: '1-3' },
  { id: '4-8', label: '4-8' },
  { id: '9+', label: '9+' },
]

export const SQUAT_LEVELS = [
  { id: 'under10', label: 'Fewer than 10' },
  { id: '10-25', label: '10-25' },
  { id: '25-50', label: '25-50' },
  { id: '50+', label: '50+' },
]

export const PLANK_LEVELS = [
  { id: 'under20', label: 'Under 20 sec' },
  { id: '20-60', label: '20-60 sec' },
  { id: '1-2min', label: '1-2 min' },
  { id: '2min+', label: '2+ min' },
]

export const CARDIO_ABILITY = [
  { id: 'walk', label: "I can't jog for 5 minutes yet" },
  { id: 'jog10', label: 'I can jog 10-20 minutes' },
  { id: 'run30', label: 'I can run 30+ minutes' },
  { id: 'trained', label: 'I train for races / cardio regularly' },
]

export const TRAINING_LOCATIONS = [
  { id: 'gym', label: 'Commercial gym' },
  { id: 'homeGym', label: 'Home gym' },
  { id: 'home', label: 'At home (little or no equipment)' },
  { id: 'outdoors', label: 'Outdoors / park' },
]

export const EQUIPMENT_OPTIONS = [
  { id: 'dumbbell', label: 'Dumbbells' },
  { id: 'kettlebell', label: 'Kettlebells' },
  { id: 'barbell', label: 'Barbell + rack' },
  { id: 'bench', label: 'Bench' },
  { id: 'pullupBar', label: 'Pull-up bar' },
  { id: 'bands', label: 'Resistance bands' },
  { id: 'machine', label: 'Weight machines' },
  { id: 'cable', label: 'Cable machine' },
  { id: 'cardioMachine', label: 'Treadmill / bike / rower' },
  { id: 'jumpRope', label: 'Jump rope' },
]

export const SESSION_LENGTHS = [20, 30, 45, 60, 75, 90]

export const CARDIO_PREFERENCES = [
  { id: 'walking', label: 'Walking' },
  { id: 'running', label: 'Running' },
  { id: 'cycling', label: 'Cycling' },
  { id: 'swimming', label: 'Swimming' },
  { id: 'rowing', label: 'Rowing' },
  { id: 'hiit', label: 'HIIT / circuits' },
  { id: 'hiking', label: 'Hiking' },
  { id: 'sports', label: 'Playing sports' },
  { id: 'jumpRope', label: 'Jump rope' },
  { id: 'dance', label: 'Dance' },
]

export const INJURY_OPTIONS = [
  { id: 'low_back', label: 'Lower back' },
  { id: 'knee', label: 'Knee' },
  { id: 'shoulder', label: 'Shoulder' },
  { id: 'wrist', label: 'Wrist' },
  { id: 'elbow', label: 'Elbow' },
  { id: 'hip', label: 'Hip' },
  { id: 'ankle', label: 'Ankle / foot' },
  { id: 'neck', label: 'Neck' },
]

export const FITNESS_GOALS = [
  { id: 'muscleGain', label: 'Build muscle' },
  { id: 'fatLoss', label: 'Lose body fat' },
  { id: 'strength', label: 'Get stronger' },
  { id: 'endurance', label: 'Improve cardio endurance' },
  { id: 'athleticPerformance', label: 'Improve athletic performance' },
  { id: 'mobility', label: 'Improve flexibility / mobility' },
  { id: 'generalHealth', label: 'General health & consistency' },
]

export const MUSCLE_FOCUS_AREAS = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'arms', label: 'Arms' },
  { id: 'legs', label: 'Legs' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'core', label: 'Core' },
]

export const PRIORITY_LIFTS = [
  { id: 'squat', label: 'Squat' },
  { id: 'bench', label: 'Bench press' },
  { id: 'deadlift', label: 'Deadlift' },
  { id: 'overheadPress', label: 'Overhead press' },
  { id: 'pullUp', label: 'Pull-ups' },
  { id: 'pushUp', label: 'Push-ups' },
]

export const ENDURANCE_EVENTS = [
  { id: 'none', label: 'No specific event' },
  { id: '5k', label: '5K run' },
  { id: '10k', label: '10K run' },
  { id: 'half', label: 'Half marathon' },
  { id: 'marathon', label: 'Marathon' },
  { id: 'cycling', label: 'Cycling event' },
  { id: 'triathlon', label: 'Triathlon' },
]

export const SPORTS = [
  { id: 'basketball', label: 'Basketball' },
  { id: 'soccer', label: 'Soccer' },
  { id: 'football', label: 'Football' },
  { id: 'hockey', label: 'Hockey' },
  { id: 'volleyball', label: 'Volleyball' },
  { id: 'baseball', label: 'Baseball / softball' },
  { id: 'tennis', label: 'Tennis / racket sports' },
  { id: 'combat', label: 'Boxing / MMA / martial arts' },
  { id: 'running', label: 'Running / track' },
  { id: 'swimming', label: 'Swimming' },
  { id: 'other', label: 'Another sport' },
]

export const SEASONS = [
  { id: 'offSeason', label: 'Off-season' },
  { id: 'preSeason', label: 'Pre-season' },
  { id: 'inSeason', label: 'In season' },
  { id: 'none', label: 'Just for fun / no season' },
]

export const SPORT_TYPES = [
  { id: 'team', label: 'Team sport (basketball, soccer, football…)' },
  { id: 'racket', label: 'Racket sport' },
  { id: 'combat', label: 'Combat sport / martial arts' },
  { id: 'running', label: 'Running / track' },
  { id: 'other', label: 'Other' },
]

export const TIGHT_AREAS = [
  { id: 'hips', label: 'Hips' },
  { id: 'hamstrings', label: 'Hamstrings' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'upperBack', label: 'Upper back' },
  { id: 'lowBack', label: 'Lower back' },
  { id: 'ankles', label: 'Ankles / calves' },
]

export const PAST_OBSTACLES = [
  { id: 'time', label: 'Not enough time' },
  { id: 'motivation', label: 'Lost motivation' },
  { id: 'knowledge', label: "Didn't know what to do" },
  { id: 'boredom', label: 'Got bored' },
  { id: 'schedule', label: 'Unpredictable schedule' },
  { id: 'results', label: "Didn't see results" },
  { id: 'soreness', label: 'Too sore / got hurt' },
]

export const MENTAL_FOCUS_AREAS = [
  { id: 'discipline', label: 'Discipline' },
  { id: 'confidence', label: 'Confidence' },
  { id: 'consistency', label: 'Consistency' },
  { id: 'mentalResilience', label: 'Mental resilience' },
  { id: 'reducingProcrastination', label: 'Reducing procrastination' },
  { id: 'improvingFocus', label: 'Improving focus' },
  { id: 'timeManagement', label: 'Time management' },
  { id: 'buildingHabits', label: 'Building better habits' },
  { id: 'reducingScreenTime', label: 'Reducing screen time' },
  { id: 'stress', label: 'Managing stress' },
]

export const DAILY_MINUTES = [10, 20, 30, 45, 60]

export const DISTRACTIONS = [
  { id: 'socialMedia', label: 'Social media' },
  { id: 'videoStreaming', label: 'YouTube / streaming' },
  { id: 'gaming', label: 'Video games' },
  { id: 'news', label: 'News / browsing' },
  { id: 'messaging', label: 'Texting / group chats' },
]

export const READING_FREQUENCY = [
  { id: 'never', label: 'Rarely or never' },
  { id: 'monthly', label: 'A few times a month' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'daily', label: 'Daily' },
]

export const READING_FORMATS = [
  { id: 'physical', label: 'Physical books' },
  { id: 'ebook', label: 'E-books' },
  { id: 'audiobook', label: 'Audiobooks' },
]

export const READING_TOPICS = [
  { id: 'psychology', label: 'Psychology' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'business', label: 'Business' },
  { id: 'personalFinance', label: 'Personal finance' },
  { id: 'health', label: 'Health & fitness' },
  { id: 'biography', label: 'Biographies' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'science', label: 'Science' },
  { id: 'history', label: 'History' },
]

export const MEDITATION_EXPERIENCE = [
  { id: 'never', label: 'Never tried' },
  { id: 'tried', label: "Tried, didn't stick" },
  { id: 'regular', label: 'I meditate regularly' },
]

export const EMPLOYMENT_STATUS = [
  { id: 'employed', label: 'Employed full-time' },
  { id: 'partTime', label: 'Employed part-time' },
  { id: 'self-employed', label: 'Self-employed / business owner' },
  { id: 'student', label: 'Student' },
  { id: 'unemployed', label: 'Not currently working' },
]

export const INCOME_INTERESTS = [
  { id: 'freelancing', label: 'Freelancing' },
  { id: 'ecommerce', label: 'E-commerce / dropshipping' },
  { id: 'digitalProducts', label: 'Digital products (guides, templates)' },
  { id: 'clipping', label: 'Clipping / short-form content' },
  { id: 'agency', label: 'Services for local businesses' },
  { id: 'aiApps', label: 'Apps built with AI' },
  { id: 'contentCreation', label: 'Content creation' },
  { id: 'affiliateMarketing', label: 'Affiliate marketing' },
  { id: 'investing', label: 'Investing' },
  { id: 'skillBuilding', label: 'Building a skill for a raise / new role' },
]

export const PATH_EXPERIENCE = [
  { id: 'none', label: 'Starting from zero' },
  { id: 'some', label: "I've dabbled" },
  { id: 'experienced', label: 'I already earn some this way' },
]

export const STARTUP_BUDGETS = [
  { id: '0', label: '$0' },
  { id: 'under100', label: 'Under $100' },
  { id: '100to500', label: '$100-500' },
  { id: '500to2000', label: '$500-2,000' },
  { id: 'over2000', label: '$2,000+' },
]

export const EMERGENCY_FUND_LEVELS = [
  { id: 'none', label: 'None' },
  { id: 'under1', label: 'Less than 1 month' },
  { id: '1to3', label: '1-3 months' },
  { id: '3to6', label: '3-6 months' },
  { id: 'over6', label: '6+ months' },
]

export const SPENDING_TRACKING = [
  { id: 'no', label: "I don't track it" },
  { id: 'sometimes', label: 'Sometimes' },
  { id: 'yes', label: 'Yes, I budget' },
]

export const YES_NO_UNSURE = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'unsure', label: 'Not sure' },
]

export const SKILLS = [
  { id: 'webDevelopment', label: 'Web development' },
  { id: 'programming', label: 'Programming / Python' },
  { id: 'dataAnalysis', label: 'Data analysis' },
  { id: 'excel', label: 'Excel / spreadsheets' },
  { id: 'graphicDesign', label: 'Graphic design' },
  { id: 'uxDesign', label: 'UX / UI design' },
  { id: 'videoEditing', label: 'Video editing' },
  { id: 'photography', label: 'Photography' },
  { id: 'copywriting', label: 'Copywriting / writing' },
  { id: 'digitalMarketing', label: 'Digital marketing' },
  { id: 'socialMedia', label: 'Social media management' },
  { id: 'seo', label: 'SEO' },
  { id: 'sales', label: 'Sales' },
  { id: 'bookkeeping', label: 'Bookkeeping / accounting' },
  { id: 'projectManagement', label: 'Project management' },
  { id: 'publicSpeaking', label: 'Public speaking' },
  { id: 'aiTools', label: 'AI tools' },
  { id: 'aiCoding', label: 'Building with AI coding tools' },
  { id: 'aiVideo', label: 'AI video & animation' },
  { id: 'automation', label: 'No-code automation' },
  { id: 'emailMarketing', label: 'Email marketing' },
  { id: 'paidAds', label: 'Paid ads (Meta, Google)' },
  { id: 'cybersecurity', label: 'Cybersecurity' },
  { id: 'languages', label: 'A foreign language' },
  { id: 'trades', label: 'A skilled trade' },
]

export const LEARNING_STYLES = [
  { id: 'video', label: 'Videos' },
  { id: 'book', label: 'Books' },
  { id: 'course', label: 'Structured courses' },
  { id: 'podcast', label: 'Podcasts' },
  { id: 'article', label: 'Articles & guides' },
]

export const LEARNING_BUDGETS = [
  { id: 'free', label: 'Free resources only' },
  { id: 'some', label: 'Happy to buy a book or two' },
  { id: 'any', label: 'Willing to pay for good courses' },
]

export function labelFor(options, id) {
  return options.find((o) => o.id === id)?.label ?? id
}

export const SHOPPING_FREQUENCY = [
  { id: 'weekly', label: 'Once a week', hint: 'One shop covers Monday to Sunday' },
  { id: 'twice', label: 'Twice a week', hint: 'Fresher food: one shop for Mon–Thu, one for Fri–Sun' },
  { id: 'biweekly', label: 'Every two weeks', hint: 'One big shop; we lean on frozen and long-lasting food' },
]

export const SHOPPING_STYLES = [
  { id: 'cheapest', label: 'Cheapest stores', hint: "I'll go where it's cheapest (No Frills, Walmart, Aldi…)" },
  { id: 'bulk', label: 'Bulk / warehouse', hint: 'I can buy big packs (Costco and similar)' },
  { id: 'closest', label: "Whatever's closest", hint: 'Convenience first; show me how to save there' },
]
