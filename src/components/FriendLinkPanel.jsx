import { useEffect, useState } from 'react'
import { Users, Copy, Check, Link2Off, RefreshCw } from 'lucide-react'
import { Button, inputClass } from './ui'
import { apiFetch } from '../lib/api'

function linkFor(token) {
  return `${window.location.origin}${window.location.pathname}?friend=${token}`
}

export default function FriendLinkPanel({ token }) {
  const [state, setState] = useState({ loading: true, token: null, nickname: '' })
  const [nickname, setNickname] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    apiFetch('/share', { method: 'GET', token })
      .then((res) => {
        setState({ loading: false, token: res.token, nickname: res.nickname ?? '' })
        setNickname(res.nickname ?? '')
      })
      .catch(() => setState({ loading: false, token: null, nickname: '', offline: true }))
  }, [token])

  async function create() {
    setBusy(true)
    setErr(null)
    try {
      const res = await apiFetch('/share', { method: 'POST', token, body: { nickname } })
      setState({ loading: false, token: res.token, nickname: res.nickname })
    } catch (e) {
      setErr(e?.message && e.status ? e.message : "Couldn't reach the server.")
    } finally {
      setBusy(false)
    }
  }

  async function revoke() {
    setBusy(true)
    try {
      await apiFetch('/share/revoke', { method: 'POST', token })
      setState({ loading: false, token: null, nickname: state.nickname })
    } catch {
      setErr("Couldn't reach the server.")
    } finally {
      setBusy(false)
    }
  }

  async function share() {
    const url = linkFor(state.token)
    try {
      if (navigator.share) await navigator.share({ text: `Keep me accountable on my 75 Hard: ${url}` })
      else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // cancelled
    }
  }

  return (
    <div className="rounded-xl border border-[var(--ink-800)] bg-[var(--ink-950)] p-3 space-y-2.5">
      <div className="flex items-start gap-2.5">
        <Users size={18} className="text-[var(--accent-light)] shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--ink-50)]">Accountability friend</p>
          <p className="text-xs text-[var(--ink-300)] mt-0.5">
            A private link that shows only your name, 75 Hard day, streak and whether today's checklist is done. Nothing else. Turn it off any time.
          </p>
        </div>
      </div>
      {state.loading ? null : state.token ? (
        <>
          <p className="text-xs font-mono break-all rounded-lg bg-[var(--ink-900)] border border-[var(--ink-800)] px-2.5 py-2 text-[var(--ink-200)] select-all">{linkFor(state.token)}</p>
          <Button className="w-full" onClick={share}>
            {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? 'Copied' : 'Send to a friend'}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={create} disabled={busy}>
              <RefreshCw size={15} /> New link
            </Button>
            <Button variant="secondary" onClick={revoke} disabled={busy}>
              <Link2Off size={15} /> Turn off
            </Button>
          </div>
          <p className="text-[11px] text-[var(--ink-400)]">"New link" stops the old one working. Shown as "{state.nickname}".</p>
        </>
      ) : (
        <>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="First name or nickname they'll see" maxLength={30} className={inputClass} />
          <Button className="w-full" onClick={create} disabled={busy || !nickname.trim()}>
            {busy ? 'Creating…' : 'Create link'}
          </Button>
        </>
      )}
      {(err || state.offline) && <p className="text-xs text-[var(--danger)]">{err ?? "Couldn't reach the server."}</p>}
    </div>
  )
}
