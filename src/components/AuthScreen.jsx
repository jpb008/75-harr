import { useState } from 'react'

export default function AuthScreen({ onSignup, onLogin, error }) {
  const [mode, setMode] = useState('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)

  const inputClass =
    'w-full rounded-lg bg-[var(--ink-900)] border border-[var(--ink-700)] px-3 py-2 text-[var(--ink-50)] focus:outline-none focus:border-[var(--accent)] transition-colors'

  async function submit(e) {
    e.preventDefault()
    setLocalError(null)
    if (mode === 'signup' && password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }
    setSubmitting(true)
    try {
      if (mode === 'signup') await onSignup(email, password)
      else await onLogin(email, password)
    } catch {
      // error is surfaced via the `error` prop from useAuth
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <p className="font-display text-lg text-[var(--accent-light)] tracking-wide">
        75<span className="text-[var(--ink-100)]">HARD</span>
      </p>
      <h1 className="font-display text-5xl leading-none text-[var(--ink-50)] mt-1 mb-2">
        {mode === 'signup' ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="text-[var(--ink-300)] text-sm mb-8 max-w-md">
        {mode === 'signup'
          ? 'Your personalized plan and progress sync across devices from here.'
          : 'Log back in to pick up where you left off.'}
      </p>

      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-sm text-[var(--ink-300)] mb-1.5">Password</label>
          <input
            type="password"
            required
            minLength={mode === 'signup' ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          />
        </div>

        {(localError || error) && (
          <p className="text-sm text-[var(--danger)]">{localError || error}</p>
        )}

        {mode === 'signup' && (
          <p className="text-xs text-[var(--ink-400)]">
            There's no "forgot password" email recovery — if you lose this password, that account
            can't be recovered. Use Settings → Export data to keep a backup once you're in.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-strong)] disabled:opacity-60 text-white font-medium py-2.5 transition-colors shadow-[0_0_24px_-8px_var(--accent-a70)]"
        >
          {submitting ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signup' ? 'login' : 'signup')
            setLocalError(null)
          }}
          className="w-full text-sm text-[var(--ink-300)] hover:text-[var(--ink-50)] transition-colors"
        >
          {mode === 'signup' ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </form>
    </div>
  )
}
