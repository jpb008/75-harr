import { useEffect, useRef, useState } from 'react'
import { apiFetch, apiConfigured, ApiError } from '../lib/api'
import { loadJSON, saveJSON } from '../lib/storage'

// The same localStorage keys the rest of the app already reads/writes
// directly — useSync harmonizes these with the server in the background
// rather than requiring every existing hook to be rewritten. The server
// stays the backup/sync target; local reads/writes keep working exactly
// as before, online or offline.
// `challenge` genuinely can be null (no active challenge); the rest should
// never be — defaulting them to proper empty containers here stops a
// missing/corrupted local value from ever being synced up as `null` and
// poisoning another device (or this one, on the next pull).
const SYNCED_KEY_DEFAULTS = {
  challenge: null,
  days: {},
  history: [],
  goals: [],
  celebratedMilestones: {},
  planDays: {},
}
const SYNCED_KEYS = Object.keys(SYNCED_KEY_DEFAULTS)

function buildLocalBlob() {
  const blob = {}
  for (const key of SYNCED_KEYS) blob[key] = loadJSON(key, SYNCED_KEY_DEFAULTS[key])
  return blob
}

function applyBlobToLocal(blob) {
  for (const key of SYNCED_KEYS) {
    if (blob[key] !== undefined) saveJSON(key, blob[key])
  }
}

const PUSH_INTERVAL_MS = 30000

export function useSync(token) {
  const [hydrated, setHydrated] = useState(false)
  const versionRef = useRef(loadJSON('syncVersion', 0))

  async function pull() {
    try {
      const { state, version } = await apiFetch('/state', { method: 'GET', token })
      versionRef.current = version
      saveJSON('syncVersion', version)
      // Only an existing account's data overwrites local — a brand-new
      // account's empty state (version 0) must never clobber local data;
      // that first upload is handled explicitly by the migration step.
      if (version > 0) applyBlobToLocal(state)
    } catch {
      // offline or unreachable — keep whatever's already local
    } finally {
      setHydrated(true)
    }
  }

  async function push() {
    try {
      const { version } = await apiFetch('/state', {
        method: 'PUT',
        token,
        body: { state: buildLocalBlob(), version: versionRef.current },
      })
      versionRef.current = version
      saveJSON('syncVersion', version)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409 && err.data) {
        // Someone else (another device/tab) wrote more recently — adopt
        // their version as current rather than silently overwriting it.
        applyBlobToLocal(err.data.serverState)
        versionRef.current = err.data.serverVersion
        saveJSON('syncVersion', err.data.serverVersion)
      }
      // network failure: just try again on the next interval
    }
  }

  useEffect(() => {
    if (!token || !apiConfigured()) {
      setHydrated(true)
      return
    }
    pull()
    const interval = setInterval(push, PUSH_INTERVAL_MS)
    const onHide = () => {
      if (document.visibilityState === 'hidden') push()
    }
    document.addEventListener('visibilitychange', onHide)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onHide)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return { hydrated, pushNow: push }
}
