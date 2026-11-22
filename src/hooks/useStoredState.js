import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'

// A piece of state mirrored to localStorage under `key`. Keys listed in
// useSync's SYNCED_KEY_DEFAULTS are also backed up to the account.
export function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => loadJSON(key, fallback))
  useEffect(() => saveJSON(key, value), [key, value])
  return [value, setValue]
}
