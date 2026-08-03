import { useState } from 'react'
import { useChallenge } from './hooks/useChallenge'
import NavTabs from './components/NavTabs'
import TodayView from './components/TodayView'
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

  const [tab, setTab] = useState('today')

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
        />
      )}
      {tab === 'progress' && <ProgressView challenge={challenge} days={days} history={history} />}
      {tab === 'settings' && (
        <SettingsView challenge={challenge} onSave={updateSettings} onAbandonAndRestart={abandonAndRestart} />
      )}
    </div>
  )
}
