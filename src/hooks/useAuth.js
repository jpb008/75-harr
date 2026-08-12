import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function sendMagicLink(email) {
    if (!isSupabaseConfigured) throw new Error('Cloud sync is not set up yet.')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    })
    if (error) throw error
  }

  async function logout() {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
  }

  return {
    user: session?.user ?? null,
    loading,
    sendMagicLink,
    logout,
    isSupabaseConfigured,
  }
}
