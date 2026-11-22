import { useState } from 'react'
import { Lock, Trash2 } from 'lucide-react'
import { Button, inputClass } from './ui'
import { ApiError } from '../lib/api'
import { changePassword, deleteAccount } from '../lib/auth'

function errorText(err) {
  if (err instanceof ApiError && err.status && err.status !== 0) return err.message
  return "Couldn't reach the server. Check your connection and try again."
}

export function ChangePasswordForm({ token, onTokenChange }) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null) // { ok, text }

  async function submit(e) {
    e.preventDefault()
    if (next.length < 8) return setMsg({ ok: false, text: 'New password must be at least 8 characters.' })
    setBusy(true)
    setMsg(null)
    try {
      const res = await changePassword(token, current, next)
      onTokenChange(res.token)
      setCurrent('')
      setNext('')
      setOpen(false)
      setMsg({ ok: true, text: 'Password changed. Other devices will need to log in again.' })
    } catch (err) {
      setMsg({ ok: false, text: errorText(err) })
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <div className="space-y-1.5">
        <Button variant="secondary" className="w-full" onClick={() => { setOpen(true); setMsg(null) }}>
          <Lock size={15} /> Change password
        </Button>
        {msg && <p className={`text-xs ${msg.ok ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{msg.text}</p>}
      </div>
    )
  }
  return (
    <form onSubmit={submit} className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-950)] p-3 space-y-2.5">
      <p className="text-sm font-medium text-[var(--ink-50)]">Change password</p>
      <input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" autoComplete="current-password" className={inputClass} />
      <input type="password" required minLength={8} value={next} onChange={(e) => setNext(e.target.value)} placeholder="New password (8+ characters)" autoComplete="new-password" className={inputClass} />
      {msg && <p className={`text-xs ${msg.ok ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>{msg.text}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={() => { setOpen(false); setMsg(null) }}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  )
}

export function DeleteAccount({ token, onDeleted }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      await deleteAccount(token, password)
      onDeleted()
    } catch (error) {
      setErr(errorText(error))
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-full text-center text-sm text-[var(--danger)] hover:underline py-1">
        Delete my account
      </button>
    )
  }
  return (
    <form onSubmit={submit} className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-soft)] p-3 space-y-2.5">
      <p className="flex items-center gap-2 text-sm font-semibold text-[var(--ink-50)]">
        <Trash2 size={16} className="text-[var(--danger)]" /> Delete account permanently
      </p>
      <p className="text-xs text-[var(--ink-200)]">
        This erases your account, plan, logs and recovery codes from the server and signs out every device. It can't be undone. Progress photos are stored only on this phone and aren't touched. Use Export my data first if you want a copy.
      </p>
      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" className={inputClass} />
      <input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder='Type DELETE to confirm' autoCapitalize="characters" className={inputClass} />
      {err && <p className="text-xs text-[var(--danger)]">{err}</p>}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={() => { setOpen(false); setErr(null); setPassword(''); setConfirm('') }}>
          Cancel
        </Button>
        <button
          type="submit"
          disabled={busy || confirm.trim().toUpperCase() !== 'DELETE' || !password}
          className="flex-1 rounded-xl bg-[var(--danger)] text-white text-sm font-semibold py-2.5 disabled:opacity-40"
        >
          {busy ? 'Deleting…' : 'Delete forever'}
        </button>
      </div>
    </form>
  )
}
