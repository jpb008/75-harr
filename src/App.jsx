import { useState } from 'react'
import { useChallenge } from './hooks/useChallenge'
import { useAccentColor } from './hooks/useAccentColor'
import { useBackgroundColor } from './hooks/useBackgroundColor'
import { useGoals } from './hooks/useGoals'
import { usePhotos } from './hooks/usePhotos'
import { useMilestoneCelebration } from './hooks/useMilestoneCelebration'
import { today } from './lib/dates'
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
  const { backgroundColor, setBackgroundColor, themeMode, setThemeMode } = useBackgroundColor()
  const goals = useGoals()
  const photos = usePhotos()
  const milestone = useMilestoneCelebration(challenge, dayNumber, todayComplete)
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
        />
      )}
    </div>
  )
}
