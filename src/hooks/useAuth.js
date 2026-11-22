import { useEffect, useState } from 'react'
import { ApiError } from '../lib/api'
import * as authApi from '../lib/auth'

export function useAuth() {
  const [session, setSession] = useState(() => authApi.getStoredSession())
  // Computed synchronously from storage, so the app never flashes a
  // loading screen just to decide whether to show AuthScreen.
  const [status, setStatus] = useState(() => (authApi.getStoredSession()?.token ? 'authenticated' : 'anonymous'))
  const [error, setError] = useState(null)

  // Re-verify the cached token in the background. A 401 means the token is
  // genuinely invalid (log out); a network failure means the server is
  // just unreachable right now (stay logged in on cached data) — getting
  // this distinction wrong is what would turn a server hiccup into the
  // whole app being unusable.
  useEffect(() => {
    if (!session?.token) return
    let cancelled = false

    async function verify() {
      try {
        await authApi.verifySession(session.token)
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          authApi.clearStoredSession()
          setSession(null)
          setStatus('anonymous')
        }
        // any other error (including status 0 / network) is ignored —
        // stay authenticated on the cached session.
      }
    }

    verify()
    const onOnline = () => verify()
    window.addEventListener('online', onOnline)
    return () => {
      cancelled = true
      window.removeEventListener('online', onOnline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token])

  async function signup(email, password) {
    setError(null)
    try {
      const { token, userId } = await authApi.signup(email, password)
      const next = { token, userId, email }
      authApi.setStoredSession(next)
      setSession(next)
      setStatus('authenticated')
      return next
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.')
      throw err
    }
  }

  async function login(email, password) {
    setError(null)
    try {
      const { token, userId } = await authApi.login(email, password)
      const next = { token, userId, email }
      authApi.setStoredSession(next)
      setSession(next)
      setStatus('authenticated')
      return next
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.')
      throw err
    }
  }

  async function recover(email, code, newPassword) {
    setError(null)
    try {
      const { token, userId } = await authApi.recover(email, code, newPassword)
      const next = { token, userId, email }
      authApi.setStoredSession(next)
      setSession(next)
      setStatus('authenticated')
      return next
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.')
      throw err
    }
  }

  function logout() {
    authApi.clearStoredSession()
    setSession(null)
    setStatus('anonymous')
  }

  return {
    status,
    userId: session?.userId ?? null,
    email: session?.email ?? null,
    token: session?.token ?? null,
    error,
    signup,
    login,
    recover,
    logout,
  }
}
