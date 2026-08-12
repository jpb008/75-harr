import { useEffect, useState } from 'react'
import { useChallenge } from './hooks/useChallenge'
import { useAccentColor } from './hooks/useAccentColor'
import { useBackgroundColor } from './hooks/useBackgroundColor'
import { useGoals } from './hooks/useGoals'
import { useAuth } from './hooks/useAuth'
import { useCloudSync } from './hooks/useCloudSync'
import NavTabs from './components/NavTabs'
import TodayView from './components/TodayView'
import GoalsView from './components/GoalsView'
import ProgressView from './components/ProgressView'
import SettingsView from './components/SettingsView'
import StartScreen from './components/StartScreen'

export default function App() {
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
  const [backgroundColor, setBackgroundColor] = useBackgroundColor()
  const goals = useGoals()
  const [tab, setTab] = useState('today')

  const auth = useAuth()
  const { status: syncStatus, scheduleSync } = useCloudSync(auth.user)

  useEffect(() => {
    if (!auth.user) return
    scheduleSync({ challenge, days, history, accentColor, backgroundColor, goals: goals.goals })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user, challenge, days, history, accentColor, backgroundColor, goals.goals])

  if (!challenge) {
    return (
      <StartScreen
        onStart={startNewChallenge}
        justFinished={justFinished}
        onDismissFinished={dismissFinished}
        account={auth}
        syncStatus={syncStatus}
      />
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
      {tab === 'progress' && <ProgressView challenge={challenge} days={days} history={history} />}
      {tab === 'settings' && (
        <SettingsView
          challenge={challenge}
          onSave={updateSettings}
          onAbandonAndRestart={abandonAndRestart}
          accentColor={accentColor}
          onAccentChange={setAccentColor}
          backgroundColor={backgroundColor}
          onBackgroundChange={setBackgroundColor}
          account={auth}
          syncStatus={syncStatus}
        />
      )}
    </div>
  )
}
