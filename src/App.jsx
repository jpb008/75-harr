import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useSync, clearAccountLocalData } from './hooks/useSync'
import { useStoredState } from './hooks/useStoredState'
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
import { useRecoveryStatus } from './components/RecoveryCodes'
import { useMeals } from './hooks/useMeals'
import StartScreen from './components/StartScreen'
import AuthScreen from './components/AuthScreen'
import OnboardingFlow from './components/onboarding/OnboardingFlow'
import WeeklyReviewModal from './components/WeeklyReviewModal'
import PlanView from './components/plan/PlanView'
import { normalizeAnswers } from './lib/plan/normalizeAnswers'
import { applyCalorieAdjustment } from './lib/plan/bodyweight'

export default function App() {
  const auth = useAuth()
  const sync = useSync(auth.token)

  async function handleSignup(email, password) {
    const session = await auth.signup(email, password)
    // Only on signup, never login — a brand-new account's server state is
    // guaranteed empty, so this device's existing local data (if any) is
    // safe to upload as the very first write.
    await runMigrationIfNeeded(session.token)
  }

  if (auth.status === 'anonymous') {
    return <AuthScreen onSignup={handleSignup} onLogin={auth.login} onRecover={auth.recover} error={auth.error} />
  }

  async function handleLogout() {
    // Save anything not yet synced, then wipe this account's data from the
    // device so the next sign-in starts clean.
    await Promise.race([sync.pushNow(), new Promise((resolve) => setTimeout(resolve, 4000))])
    clearAccountLocalData()
    auth.logout()
  }

  // Wait for the account's saved data before rendering anything that reads
  // it — otherwise a new device shows "Start your challenge" and could
  // overwrite the real one.
  if (!sync.hydrated) return null

  return <AuthenticatedApp key={sync.generation} token={auth.token} email={auth.email} onLogout={handleLogout} />
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
  const [workoutLogs, setWorkoutLogs] = useStoredState('workoutLogs', {})
  const [weighIns, setWeighIns] = useStoredState('weighIns', {})
  const [incomeLogs, setIncomeLogs] = useStoredState('incomeLogs', {})
  const [reminderPrefs, setReminderPrefs] = useStoredState('reminderPrefs', {})
  const [recoveryStatus, setRecoveryStatus] = useRecoveryStatus(token)
  const meals = useMeals(plan.plan, plan.answers)
  const weightUnit = plan.answers?.personal?.units === 'metric' ? 'kg' : 'lb'
  const [tab, setTab] = useState('today')
  const [planSection, setPlanSection] = useState('workouts')
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
          onOpenPlan={(section = 'workouts') => {
            setPlanSection(section)
            setTab('plan')
            window.scrollTo({ top: 0 })
          }}
          motivationWhy={plan.answers?.fitnessGoals?.motivationWhy || null}
          answers={plan.answers}
          meals={meals}
          todayDateStr={todayDateStr}
          recoveryStatus={recoveryStatus}
          onOpenRecovery={() => {
            setTab('settings')
            setTimeout(() => document.getElementById('account')?.scrollIntoView({ block: 'start' }), 50)
          }}
          workoutLogs={workoutLogs}
          weightUnit={weightUnit}
          injuries={plan.answers ? normalizeAnswers(plan.answers).training.injuries : []}
          onSaveWorkoutLog={(sessionId, entries) => setWorkoutLogs((prev) => ({ ...prev, [todayDateStr]: { sessionId, entries } }))}
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
        <ProgressView
          challenge={challenge}
          days={days}
          history={history}
          photoUrls={photos.urls}
          weighIns={weighIns}
          setWeighIns={setWeighIns}
          answers={plan.answers ? normalizeAnswers(plan.answers) : null}
          weightUnit={weightUnit}
          plan={plan.plan}
          workoutLogs={workoutLogs}
          mealChecks={meals.checks}
          onApplyCalorieAdjustment={(delta) =>
            plan.savePlan(applyCalorieAdjustment(plan.answers, delta, todayDateStr), { source: 'calorie_adjustment' })
          }
        />
      )}
      {tab === 'plan' && <PlanView key={planSection} initialSection={planSection} plan={plan} meals={meals} workoutLogs={workoutLogs} weightUnit={weightUnit} incomeLogs={incomeLogs} setIncomeLogs={setIncomeLogs} />}
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
          reminderPrefs={reminderPrefs}
          setReminderPrefs={setReminderPrefs}
          token={token}
          recoveryStatus={recoveryStatus}
          setRecoveryStatus={setRecoveryStatus}
        />
      )}
      <NavTabs
        active={tab}
        onChange={(next) => {
          if (next === 'plan') setPlanSection('workouts')
          setTab(next)
          window.scrollTo({ top: 0 })
        }}
      />
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
