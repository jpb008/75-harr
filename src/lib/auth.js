import { apiFetch } from './api'
import { loadJSON, saveJSON } from './storage'

const SESSION_KEY = 'authSession' // { token, userId, email }

export function getStoredSession() {
  return loadJSON(SESSION_KEY, null)
}

export function setStoredSession(session) {
  saveJSON(SESSION_KEY, session)
}

export function clearStoredSession() {
  saveJSON(SESSION_KEY, null)
}

export async function signup(email, password) {
  return apiFetch('/auth/signup', { method: 'POST', body: { email, password } })
}

export async function login(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: { email, password } })
}

export async function verifySession(token) {
  return apiFetch('/auth/session', { method: 'GET', token })
}
