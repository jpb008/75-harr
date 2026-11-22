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
  workoutLogs: {},
  weighIns: {},
  incomeLogs: {},
  reminderPrefs: {},
  mealSwaps: {},
  mealChecks: {},
}
const SYNCED_KEYS = Object.keys(SYNCED_KEY_DEFAULTS)

function buildLocalBlob() {
  const blob = {}
  for (const key of SYNCED_KEYS) blob[key] = loadJSON(key, SYNCED_KEY_DEFAULTS[key])
  return blob
}

// Returns true if anything local actually changed, so the app only
// re-reads state when it has to.
function applyBlobToLocal(blob) {
  let changed = false
  for (const key of SYNCED_KEYS) {
    if (blob[key] === undefined) continue
    if (JSON.stringify(loadJSON(key, SYNCED_KEY_DEFAULTS[key])) !== JSON.stringify(blob[key])) changed = true
    saveJSON(key, blob[key])
  }
  return changed
}

// Everything that belongs to the signed-in account. Cleared on logout so
// the next person to sign in on this device never inherits (or uploads)
// someone else's data.
const ACCOUNT_LOCAL_KEYS = [...SYNCED_KEYS, 'plan', 'planAnswers', 'syncVersion', 'lastReviewedWeekStart', 'recoveryStatus']

export function clearAccountLocalData() {
  for (const key of ACCOUNT_LOCAL_KEYS) localStorage.removeItem(`75hard:${key}`)
}

const PUSH_INTERVAL_MS = 30000

export function useSync(token) {
  // Tracks WHICH token finished its initial pull, so switching accounts
  // (logout -> login) can't briefly render with the previous state.
  const [hydratedFor, setHydratedFor] = useState(null)
  // Bumped whenever server data replaces local data after the app is up,
  // so the app remounts and every hook re-reads fresh state.
  const [generation, setGeneration] = useState(0)
  const versionRef = useRef(loadJSON('syncVersion', 0))

  async function pull() {
    versionRef.current = loadJSON('syncVersion', 0)
    try {
      const { state, version } = await apiFetch('/state', { method: 'GET', token })
      versionRef.current = version
      saveJSON('syncVersion', version)
      // Only an existing account's data overwrites local — a brand-new
      // account's empty state (version 0) must never clobber local data;
      // that first upload is handled explicitly by the migration step.
      if (version > 0 && applyBlobToLocal(state)) setGeneration((g) => g + 1)
    } catch {
      // offline or unreachable — keep whatever's already local
    } finally {
      setHydratedFor(token)
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
        versionRef.current = err.data.serverVersion
        saveJSON('syncVersion', err.data.serverVersion)
        if (applyBlobToLocal(err.data.serverState)) setGeneration((g) => g + 1)
      }
      // network failure: just try again on the next interval
    }
  }

  useEffect(() => {
    if (!token || !apiConfigured()) return
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

  const hydrated = !token || !apiConfigured() || hydratedFor === token
  return { hydrated, generation, pushNow: push }
}
