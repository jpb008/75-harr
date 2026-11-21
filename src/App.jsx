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
import PlanSettingsView from './components/PlanSettingsView'

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

  if (!challenge && !plan.hasPlan) {
    return (
      <OnboardingFlow
        onComplete={async (answers) => {
          // Start the classic checklist first (synchronous, no network) so
          // there's no flash of StartScreen while savePlan's await is
          // in flight — the two systems stay decoupled either way.
          startNewChallenge({ name: '75 Hard', lengthDays: 75, tasks: DEFAULT_TASKS })
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
    <div className="min-h-screen">
      <NavTabs active={tab} onChange={setTab} />
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
      {tab === 'plan' && <PlanSettingsView plan={plan} onDone={() => setTab('today')} />}
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
