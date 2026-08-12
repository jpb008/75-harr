import { useState } from 'react'

const SYNC_LABEL = {
  pulling: 'Syncing…',
  pushing: 'Saving…',
  synced: 'Synced',
  error: 'Sync error',
  idle: null,
}

export default function AccountSection({ user, loading, sendMagicLink, logout, syncStatus, isSupabaseConfigured }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  if (!isSupabaseConfigured || loading) return null

  async function submit() {
    setError('')
    const trimmed = email.trim()
    if (!trimmed) return
    setSending(true)
    try {
      await sendMagicLink(trimmed)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong sending the link.')
    } finally {
      setSending(false)
    }
  }

  if (user) {
    return (
      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-2">Account</label>
        <div className="rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--ink-50)]">{user.email}</p>
            {SYNC_LABEL[syncStatus] && <p className="text-xs text-[var(--ink-400)] mt-0.5">{SYNC_LABEL[syncStatus]}</p>}
          </div>
          <button
            onClick={logout}
            className="rounded-lg bg-[var(--ink-800)] hover:bg-[var(--ink-700)] border border-[var(--ink-700)] px-3 py-1.5 text-sm text-[var(--ink-100)] transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    )
  }

  if (sent) {
    return (
      <div>
        <label className="block text-sm text-[var(--ink-300)] mb-2">Account</label>
        <div className="rounded-lg border border-[var(--accent-a40)] bg-[var(--accent-a10)] px-4 py-3">
          <p className="text-sm text-[var(--ink-50)]">Check {email} for a login link.</p>
          <button
            onClick={() => {
              setSent(false)
              setEmail('')
            }}
            className="text-xs text-[var(--accent-light)] hover:opacity-80 mt-1.5"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-sm text-[var(--ink-300)] mb-2">Save your progress with email</label>
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="you@example.com"
          className="flex-1 rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] px-3 py-2 text-sm text-[var(--ink-50)] placeholder:text-[var(--ink-400)] focus:outline-none focus:border-[var(--accent)] transition-colors"
        />
        <button
          onClick={submit}
          disabled={sending}
          className="rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-strong)] disabled:bg-[var(--ink-800)] disabled:text-[var(--ink-400)] px-3 py-2 text-sm text-white transition-colors whitespace-nowrap"
        >
          {sending ? 'Sending…' : 'Send login link'}
        </button>
      </div>
      {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
      <p className="text-xs text-[var(--ink-400)] mt-1.5">
        No password — we'll email you a link. Your progress then syncs to any device you log into.
      </p>
    </div>
  )
}
