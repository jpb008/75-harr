import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useSync } from './hooks/useSync'
import { runMigrationIfNeeded } from './lib/migrate'
import { useChallenge } from './hooks/useChallenge'
import { useAccentColor } from './hooks/useAccentColor'
import { useBackgroundColor } from './hooks/useBackgroundColor'
import { useGoals } from './hooks/useGoals'
import { usePhotos } from './hooks/usePhotos'
import { useMilestoneCelebration } from './hooks/useMilestoneCelebration'
import { useNotifications } from './hooks/useNotifications'
import { today } from './lib/dates'
import NavTabs from './components/NavTabs'
import TodayView from './components/TodayView'
import GoalsView from './components/GoalsView'
import ProgressView from './components/ProgressView'
import SettingsView from './components/SettingsView'
import StartScreen from './components/StartScreen'
import AuthScreen from './components/AuthScreen'

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

  return <AuthenticatedApp />
}

function AuthenticatedApp() {
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
  const [tab, setTab] = useState('today')

  const todayDateStr = today()

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
        />
      )}
    </div>
  )
}
