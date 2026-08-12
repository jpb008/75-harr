import { useEffect, useRef, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { loadJSON, saveJSON } from '../lib/storage'

const SYNCED_KEYS = ['challenge', 'days', 'history', 'accentColor', 'backgroundColor', 'goals']

function snapshotLocal() {
  const snapshot = {}
  for (const key of SYNCED_KEYS) snapshot[key] = loadJSON(key, null)
  return snapshot
}

function applyRemote(data) {
  for (const key of SYNCED_KEYS) {
    if (data[key] !== undefined) saveJSON(key, data[key])
  }
}

// Pulls (or seeds) progress once per login, then debounces pushes of local
// changes to Supabase while a user is signed in. Fully inert when signed
// out or when Supabase isn't configured — the app just runs on
// localStorage, exactly as it did before login existed.
export function useCloudSync(user) {
  const [status, setStatus] = useState('idle') // idle | pulling | pushing | synced | error
  const debounceRef = useRef(null)
  const handledUserId = useRef(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !user) {
      handledUserId.current = null
      return
    }
    if (handledUserId.current === user.id) return
    handledUserId.current = user.id

    let cancelled = false
    setStatus('pulling')

    supabase
      .from('progress')
      .select('data')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setStatus('error')
          return
        }
        if (data?.data) {
          applyRemote(data.data)
          setStatus('synced')
          window.location.reload()
          return
        }
        // First login on this account — seed the cloud row from what's local.
        supabase
          .from('progress')
          .upsert({ user_id: user.id, data: snapshotLocal(), updated_at: new Date().toISOString() })
          .then(({ error: upsertError }) => setStatus(upsertError ? 'error' : 'synced'))
      })

    return () => {
      cancelled = true
    }
  }, [user])

  function scheduleSync(snapshot) {
    if (!isSupabaseConfigured || !user) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setStatus('pushing')
      supabase
        .from('progress')
        .upsert({ user_id: user.id, data: snapshot, updated_at: new Date().toISOString() })
        .then(({ error }) => setStatus(error ? 'error' : 'synced'))
    }, 800)
  }

  return { status, scheduleSync }
}
