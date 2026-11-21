const PREFIX = '75hard:'

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    // A stored JSON `null` (e.g. synced down from a server record that
    // never had this field) must fall back the same as a missing key —
    // otherwise callers expecting an object/array default (like `{}`)
    // get a real `null` back and crash on first property access.
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently
  }
}
