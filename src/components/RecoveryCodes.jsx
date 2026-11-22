import { useEffect, useState } from 'react'
import { KeyRound, Copy, Download, Check, ShieldCheck } from 'lucide-react'
import { Card, Button } from './ui'
import { loadJSON, saveJSON } from '../lib/storage'
import { getRecoveryStatus, createRecoveryCodes } from '../lib/auth'

// { total, remaining } from the server, cached so the card and banner
// don't flicker on every load. null = not known yet (offline / loading).
export function useRecoveryStatus(token) {
  const [status, setStatusState] = useState(() => loadJSON('recoveryStatus', null))
  function setStatus(next) {
    setStatusState(next)
    saveJSON('recoveryStatus', next)
  }
  useEffect(() => {
    if (!token) return
    let cancelled = false
    getRecoveryStatus(token)
      .then(({ total, remaining }) => !cancelled && setStatus({ total, remaining }))
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])
  return [status, setStatus]
}

function downloadCodes(codes, email) {
  const text = [
    '75 Hard app - account recovery codes',
    email ? `Account: ${email}` : '',
    '',
    'Each code works once. Use one on the login screen (Forgot password?) to set a new password.',
    'Keep these somewhere safe and private.',
    '',
    ...codes,
    '',
  ]
    .filter((line, i) => line || i > 1)
    .join('\n')
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
  const a = document.createElement('a')
  a.href = url
  a.download = '75hard-recovery-codes.txt'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function RecoveryCodesPanel({ token, email, status, setStatus }) {
  const [codes, setCodes] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [copied, setCopied] = useState(false)
  const [confirmNew, setConfirmNew] = useState(false)

  async function create() {
    setBusy(true)
    setErr(null)
    try {
      const res = await createRecoveryCodes(token)
      setCodes(res.codes)
      setStatus({ total: res.codes.length, remaining: res.remaining })
      setConfirmNew(false)
    } catch {
      setErr("Couldn't reach the server. Check your connection and try again.")
    } finally {
      setBusy(false)
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(codes.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setErr('Copy failed. Write the codes down or use Download.')
    }
  }

  if (codes) {
    return (
      <div className="rounded-xl border border-[var(--accent-a40)] bg-[var(--accent-a10)] p-3 space-y-3">
        <p className="text-sm text-[var(--ink-100)]">
          Save these now. You won't be able to see them again. Each one resets your password once.
        </p>
        <ol className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-x-3 gap-y-1.5 font-mono text-sm text-[var(--ink-50)] tabular-nums whitespace-nowrap">
          {codes.map((c) => (
            <li key={c} className="select-all">
              {c}
            </li>
          ))}
        </ol>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={copy}>
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Copy'}
          </Button>
          <Button variant="secondary" onClick={() => downloadCodes(codes, email)}>
            <Download size={15} /> Download
          </Button>
        </div>
        <Button className="w-full" onClick={() => setCodes(null)}>
          I've saved them
        </Button>
        {err && <p className="text-xs text-[var(--danger)]">{err}</p>}
      </div>
    )
  }

  const hasCodes = status?.total > 0
  return (
    <div className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-950)] p-3 space-y-2.5">
      <div className="flex items-start gap-2.5">
        <KeyRound size={18} className="text-[var(--accent-light)] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--ink-50)]">Recovery codes</p>
          <p className="text-xs text-[var(--ink-300)] mt-0.5">
            {status == null
              ? 'Used to reset a forgotten password.'
              : hasCodes
                ? `${status.remaining} of ${status.total} codes left. Lost them? Make a new set — the old ones stop working.`
                : "Not set up. Without them, a forgotten password can't be reset."}
          </p>
        </div>
      </div>
      {hasCodes && !confirmNew ? (
        <Button variant="secondary" className="w-full" onClick={() => setConfirmNew(true)}>
          Make new codes
        </Button>
      ) : (
        <div className="space-y-2">
          {hasCodes && <p className="text-xs text-[var(--ink-200)]">Your current codes will stop working. Continue?</p>}
          <div className="flex gap-2">
            {hasCodes && (
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmNew(false)}>
                Cancel
              </Button>
            )}
            <Button className="flex-1" disabled={busy} onClick={create}>
              {busy ? 'Creating…' : hasCodes ? 'Yes, make new codes' : 'Create recovery codes'}
            </Button>
          </div>
        </div>
      )}
      {err && <p className="text-xs text-[var(--danger)]">{err}</p>}
    </div>
  )
}

// Nudge on the Today screen until codes exist (or when few are left).
export function RecoveryBanner({ status, onOpen }) {
  if (!status) return null
  const none = status.total === 0
  const low = !none && status.remaining <= 2
  if (!none && !low) return null
  return (
    <Card className="p-4 mb-5 border-[var(--accent-a40)] bg-[var(--accent-a10)]">
      <div className="flex gap-3">
        <ShieldCheck size={20} className="text-[var(--accent-light)] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--ink-50)]">{none ? 'Protect your account' : `Only ${status.remaining} recovery code${status.remaining === 1 ? '' : 's'} left`}</p>
          <p className="text-sm text-[var(--ink-200)] mt-1">
            {none
              ? 'Create recovery codes so you can reset your password if you ever forget it. Takes 30 seconds.'
              : 'Make a fresh set so you can still reset your password if you forget it.'}
          </p>
          <Button className="mt-3" onClick={onOpen}>
            {none ? 'Set up recovery codes' : 'Make new codes'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
