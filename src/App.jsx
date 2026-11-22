import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useSync } from './hooks/useSync'
import { usePlan } from './hooks/usePlan'
import { usePlanDay } from './hooks/usePlanDay'
import { useWeeklyReview } from './hooks/useWeeklyReview'
import { runMigrationIfNeeded } from './lib/migrate'
import { useChallenge } from './hooks/useChallenge'
import { useAccentColor } from './hooks/useAccentColor'
import { useBackgroundColor } from './hooks/useBackgroundColor'
import { useGoals } from './hooks/useGoals'
import { usePhotos } from './hooks/usePhotos'
import { useMilestoneCelebration } from './hooks/useMilestoneCelebration'
import { useNotifications } from './hooks/useNotifications'
import { today } from './lib/dates'
import { DEFAULT_TASKS } from './lib/challenge'
import NavTabs from './components/NavTabs'
import TodayView from './components/TodayView'
import GoalsView from './components/GoalsView'
import ProgressView from './components/ProgressView'
import SettingsView from './components/SettingsView'
import StartScreen from './components/StartScreen'
import AuthScreen from './components/AuthScreen'
import OnboardingFlow from './components/onboarding/OnboardingFlow'
import WeeklyReviewModal from './components/WeeklyReviewModal'
import PlanView from './components/plan/PlanView'

export default function App() {
  const auth = useAuth()
  useSync(auth.token)

  async function handleSignup(email, password) {
    const session = await auth.signup(email, password)
    // Only on signup, never login — a brand-new account's server state is
    // guaranteed empty, so this device's existing local data (if any) is
    // safe to upload as the very first write.
    await runMigrationIfNeeded(session.token)
  }

  if (auth.status === 'anonymous') {
    return <AuthScreen onSignup={handleSignup} onLogin={auth.login} error={auth.error} />
  }

  return <AuthenticatedApp token={auth.token} email={auth.email} onLogout={auth.logout} />
}

function AuthenticatedApp({ token, email, onLogout }) {
  const {
    challenge,
    days,
    history,
    justFinished,
    dismissFinished,
    dayNumber,
    streak,
    todayRecord,
    todayComplete,
    toggleTask,
    startNewChallenge,
    updateSettings,
    abandonAndRestart,
  } = useChallenge()

  const [accentColor, setAccentColor] = useAccentColor()
  const { backgroundColor, setBackgroundColor, themeMode, setThemeMode } = useBackgroundColor()
  const goals = useGoals()
  const photos = usePhotos()
  const milestone = useMilestoneCelebration(challenge, dayNumber, todayComplete)
  const notifications = useNotifications()
  const plan = usePlan(token)
  const planDayApi = usePlanDay(plan.plan)
  const weeklyReview = useWeeklyReview(token, plan.plan, plan.answers, plan.savePlan)
  const [tab, setTab] = useState('today')
  const [reviewOpen, setReviewOpen] = useState(false)

  const todayDateStr = today()

  useEffect(() => {
    if (weeklyReview.isDue) {
      weeklyReview.prepareReview()
      setReviewOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeklyReview.isDue])

  // While the plan fetch is in flight, render nothing rather than falling
  // through to StartScreen — a brand-new user would otherwise see a flash
  // of StartScreen before OnboardingFlow mounts a moment later.
  if (plan.loading) return null

  // Show onboarding to anyone without a plan yet — including someone who
  // already has a classic challenge running from before this feature
  // existed (e.g. migrated from an older version of the app). Having a
  // challenge already isn't a reason to skip getting a personalized plan.
  if (!plan.hasPlan) {
    return (
      <OnboardingFlow
        onComplete={async (answers) => {
          // Only start a fresh classic challenge if one doesn't already
          // exist — never overwrite an in-progress streak.
          if (!challenge) {
            startNewChallenge({ name: '75 Hard', lengthDays: 75, tasks: DEFAULT_TASKS })
          }
          await plan.savePlan(answers, { source: 'onboarding' })
        }}
      />
    )
  }

  if (!challenge) {
    return (
      <StartScreen onStart={startNewChallenge} justFinished={justFinished} onDismissFinished={dismissFinished} />
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {tab === 'today' && (
        <TodayView
          challenge={challenge}
          dayNumber={dayNumber}
          streak={streak}
          todayRecord={todayRecord}
          todayComplete={todayComplete}
          onToggle={toggleTask}
          todayDateStr={todayDateStr}
          photoUrl={photos.urls[todayDateStr]}
          onSetPhoto={photos.setPhotoForDate}
          milestone={milestone}
          notificationsEnabled={notifications.enabled}
          plan={plan.plan}
          planDayApi={planDayApi}
          onOpenPlan={() => {
            setTab('plan')
            window.scrollTo({ top: 0 })
          }}
          motivationWhy={plan.answers?.fitnessGoals?.motivationWhy || null}
        />
      )}
      {tab === 'goals' && (
        <GoalsView
          goals={goals.goals}
          addGoal={goals.addGoal}
          toggleGoal={goals.toggleGoal}
          removeGoal={goals.removeGoal}
        />
      )}
      {tab === 'progress' && (
        <ProgressView challenge={challenge} days={days} history={history} photoUrls={photos.urls} />
      )}
      {tab === 'plan' && <PlanView plan={plan} />}
      {tab === 'settings' && (
        <SettingsView
          challenge={challenge}
          onSave={updateSettings}
          onAbandonAndRestart={abandonAndRestart}
          accentColor={accentColor}
          onAccentChange={setAccentColor}
          backgroundColor={backgroundColor}
          onBackgroundChange={setBackgroundColor}
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
          notifications={notifications}
          email={email}
          onLogout={onLogout}
        />
      )}
      <NavTabs active={tab} onChange={(next) => { setTab(next); window.scrollTo({ top: 0 }) }} />
      {reviewOpen && (
        <WeeklyReviewModal
          proposals={weeklyReview.proposals}
          onSubmit={weeklyReview.submitReview}
          onClose={() => setReviewOpen(false)}
        />
      )}
    </div>
  )
}
