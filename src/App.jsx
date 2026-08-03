import { useState } from 'react'
import { useChallenge } from './hooks/useChallenge'
import { useAccentColor } from './hooks/useAccentColor'
import { useBackgroundColor } from './hooks/useBackgroundColor'
import { useWeeklyGoals } from './hooks/useWeeklyGoals'
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
  const weeklyGoals = useWeeklyGoals(dayNumber)
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
      {tab === 'goals' && (
        <GoalsView
          currentWeek={weeklyGoals.currentWeek}
          currentGoals={weeklyGoals.currentGoals}
          addGoal={weeklyGoals.addGoal}
          toggleGoal={weeklyGoals.toggleGoal}
          removeGoal={weeklyGoals.removeGoal}
          pastWeeks={weeklyGoals.pastWeeks}
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
        />
      )}
    </div>
  )
}
