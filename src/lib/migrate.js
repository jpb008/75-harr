import { apiFetch, apiConfigured } from './api'
import { loadJSON, saveJSON } from './storage'

const SYNCED_KEYS = ['challenge', 'days', 'history', 'goals', 'celebratedMilestones', 'planDays']
const MIGRATED_FLAG_KEY = 'migratedToServer'

export function detectLocalLegacyData() {
  return Boolean(loadJSON('challenge', null))
}

export function buildMigrationPayload() {
  const blob = {}
  for (const key of SYNCED_KEYS) blob[key] = loadJSON(key, null)
  return blob
}

// Runs once per device, only from the signup success path (never login) —
// a brand-new account's /state is guaranteed empty (version 0), so this is
// always a safe first write, never an overwrite of someone else's data.
// The flag stops a second signup on the same device from re-uploading this
// device's old local data on top of that second account's own server state.
export async function runMigrationIfNeeded(token) {
  if (loadJSON(MIGRATED_FLAG_KEY, false)) return { migrated: false, reason: 'already-migrated' }
  if (!apiConfigured()) return { migrated: false, reason: 'api-not-configured' }
  if (!detectLocalLegacyData()) {
    saveJSON(MIGRATED_FLAG_KEY, true)
    return { migrated: false, reason: 'no-local-data' }
  }

  try {
    const { version } = await apiFetch('/state', {
      method: 'PUT',
      token,
      body: { state: buildMigrationPayload(), version: 0 },
    })
    saveJSON('syncVersion', version)
    saveJSON(MIGRATED_FLAG_KEY, true)
    return { migrated: true }
  } catch (err) {
    // Don't mark as migrated on failure — a transient network error should
    // let the next successful sync tick pick this up instead of losing it.
    return { migrated: false, reason: 'request-failed', error: err }
  }
}
