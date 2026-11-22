import { useState } from 'react'

export default function WeeklyReviewModal({ proposals, onSubmit, onClose }) {
  const [wentWell, setWentWell] = useState('')
  const [struggled, setStruggled] = useState('')
  const [approvedIds, setApprovedIds] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const textareaClass =
    'w-full rounded-xl bg-[var(--ink-950)] border border-[var(--ink-700)] px-3 py-2 text-[var(--ink-50)] focus:outline-none focus:border-[var(--accent)] transition-colors'

  function toggleApprove(id) {
    setApprovedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  async function submit() {
    setSubmitting(true)
    try {
      await onSubmit({ wentWell, struggled }, approvedIds)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-[var(--ink-900)] border border-[var(--ink-700)] rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-5 max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in">
        <div>
          <h2 className="text-3xl font-display text-[var(--ink-50)] leading-none">Weekly review</h2>
          <p className="text-sm text-[var(--ink-300)] mt-1.5">Two minutes to look back. Reflecting on what worked is how plans get better.</p>
        </div>

        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">What went well this week?</label>
          <textarea value={wentWell} onChange={(e) => setWentWell(e.target.value)} rows={2} className={textareaClass} />
        </div>
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">What did you struggle with?</label>
          <textarea value={struggled} onChange={(e) => setStruggled(e.target.value)} rows={2} className={textareaClass} />
        </div>

        {proposals.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-[var(--ink-300)]">Based on your last two weeks — check any you'd like to apply:</p>
            {proposals.map((p) => (
              <label
                key={p.id}
                className="flex items-start gap-3 rounded-xl border border-[var(--ink-700)] bg-[var(--ink-950)] p-3 text-sm text-[var(--ink-200)] cursor-pointer"
              >
                <input type="checkbox" className="task-check mt-0.5" checked={approvedIds.includes(p.id)} onChange={() => toggleApprove(p.id)} />
                <span>{p.reason}</span>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--ink-700)] text-[var(--ink-300)] py-2.5 hover:text-[var(--ink-50)] transition-colors"
          >
            Skip
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="flex-1 rounded-xl bg-gradient-to-b from-[var(--accent)] to-[var(--accent-strong)] disabled:opacity-60 text-white font-semibold py-2.5 transition-colors"
          >
            {submitting ? 'Saving…' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
