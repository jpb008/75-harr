import { useState } from 'react'
import AtRiskBanner from './AtRiskBanner'
import { RecoveryBanner } from './RecoveryCodes'
import ProgressPhotoCard from './ProgressPhotoCard'
import MilestoneOverlay from './MilestoneOverlay'
import ShareCardModal from './ShareCardModal'
import TodayPlanSection from './TodayPlanSection'
import { Flame, CheckCircle2, Share2 } from 'lucide-react'
import { Card, ProgressRing } from './ui'

export default function TodayView({
  challenge,
  dayNumber,
  streak,
  todayRecord,
  todayComplete,
  onToggle,
  todayDateStr,
  photoUrl,
  onSetPhoto,
  milestone,
  notificationsEnabled,
  plan,
  planDayApi,
  onOpenPlan,
  motivationWhy,
  workoutLogs,
  weightUnit,
  onSaveWorkoutLog,
  injuries,
  answers,
  meals,
  recoveryStatus,
  onOpenRecovery,
}) {
  const [shareOpen, setShareOpen] = useState(false)
  const percent = challenge.tasks.length
    ? Math.round((todayRecord.completedTaskIds.length / challenge.tasks.length) * 100)
    : 0
  const remainingCount = challenge.tasks.length - todayRecord.completedTaskIds.length

  return (
    <div className="max-w-xl mx-auto px-4 pt-6 pb-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="font-display text-lg text-[var(--accent-light)] tracking-wide">
          75<span className="text-[var(--ink-100)]">HARD</span>
        </p>
        <button
          onClick={() => setShareOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--ink-200)] hover:text-[var(--ink-50)] border border-[var(--ink-700)] rounded-full px-3 py-1.5 transition-colors"
        >
          <Share2 size={13} /> Share
        </button>
      </div>

      <RecoveryBanner status={recoveryStatus} onOpen={onOpenRecovery} />

      <Card className="p-5 mb-5 overflow-hidden relative">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[var(--accent-a15)] blur-2xl pointer-events-none" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[var(--ink-300)] text-xs uppercase tracking-[0.15em] truncate">{challenge.name}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h1 className="font-display text-6xl leading-none text-[var(--ink-50)]">Day {dayNumber}</h1>
              <span className="text-[var(--ink-400)] tabular-nums">/ {challenge.lengthDays}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-[var(--accent-light)] font-semibold">
                <Flame size={16} /> {streak} day streak
              </span>
              {todayComplete && (
                <span className="inline-flex items-center gap-1 text-sm text-[var(--success)] font-semibold">
                  <CheckCircle2 size={16} /> Today complete
                </span>
              )}
            </div>
          </div>
          <ProgressRing value={percent / 100} size={84} stroke={7}>
            <span className="text-center leading-tight">
              <span className="block text-lg font-semibold text-[var(--ink-50)] tabular-nums">{percent}%</span>
              <span className="block text-[10px] text-[var(--ink-300)]">today</span>
            </span>
          </ProgressRing>
        </div>
        <div className="relative w-full h-1.5 bg-[var(--ink-800)] rounded-full overflow-hidden mt-5">
          <div
            className="h-full bg-gradient-to-r from-[var(--accent-strong)] to-[var(--accent-light)] transition-all duration-500"
            style={{ width: `${Math.min(100, Math.round((dayNumber / challenge.lengthDays) * 100))}%` }}
          />
        </div>
        <p className="relative text-[11px] text-[var(--ink-400)] mt-1.5">
          {Math.max(0, challenge.lengthDays - dayNumber)} days to go
        </p>
      </Card>

      <AtRiskBanner
        todayComplete={todayComplete}
        remainingCount={remainingCount}
        notificationsEnabled={notificationsEnabled}
      />

      <h2 className="text-xs uppercase tracking-[0.15em] text-[var(--ink-300)] font-semibold px-1 mb-2.5">Daily non-negotiables</h2>
      <ul className="space-y-2.5">
        {challenge.tasks.map((task) => {
          const checked = todayRecord.completedTaskIds.includes(task.id)
          return (
            <li key={task.id}>
              <label
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 cursor-pointer transition-all active:scale-[0.99] ${
                  checked
                    ? 'bg-[var(--accent-a10)] border-[var(--accent-a40)]'
                    : 'bg-gradient-to-b from-[var(--ink-900)] to-[var(--ink-950)] border-[var(--ink-800)] hover:border-[var(--ink-700)]'
                }`}
                style={task.color ? { borderLeftColor: task.color, borderLeftWidth: '3px' } : undefined}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(task.id)}
                  className="task-check"
                />
                {task.icon && <span className="text-base shrink-0">{task.icon}</span>}
                <span className={checked ? 'text-[var(--ink-200)] line-through decoration-[var(--ink-400)]' : 'text-[var(--ink-50)]'}>
                  {task.label}
                </span>
              </label>
            </li>
          )
        })}
      </ul>

      {challenge.tasks.length === 0 && (
        <p className="text-[var(--ink-400)] text-sm mt-6">
          No tasks yet — add some in Settings to start checking off your day.
        </p>
      )}

      <div className="mt-6">
        <ProgressPhotoCard dateStr={todayDateStr} photoUrl={photoUrl} onSetPhoto={onSetPhoto} />
      </div>

      <p className="text-[var(--ink-400)] text-xs mt-2 text-center">
        Miss any task by midnight and the challenge resets to Day 1 automatically.
      </p>

      {plan && <TodayPlanSection
          plan={plan}
          planDayApi={planDayApi}
          onOpenPlan={onOpenPlan}
          motivationWhy={motivationWhy}
          workoutLogs={workoutLogs}
          weightUnit={weightUnit}
          onSaveWorkoutLog={onSaveWorkoutLog}
          todayDateStr={todayDateStr}
          injuries={injuries}
          answers={answers}
          meals={meals}
        />}

      {shareOpen && (
        <ShareCardModal
          challenge={challenge}
          dayNumber={dayNumber}
          streak={streak}
          isFinished={false}
          onClose={() => setShareOpen(false)}
        />
      )}

      {milestone.visible && (
        <MilestoneOverlay label={milestone.label} isFinish={milestone.isFinish} onDismiss={milestone.dismiss} />
      )}
    </div>
  )
}
