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

export async function recover(email, code, newPassword) {
  return apiFetch('/auth/recover', { method: 'POST', body: { email, code, newPassword } })
}

export async function getRecoveryStatus(token) {
  return apiFetch('/auth/recovery-codes', { method: 'GET', token })
}

export async function createRecoveryCodes(token) {
  return apiFetch('/auth/recovery-codes', { method: 'POST', token })
}

export async function changePassword(token, currentPassword, newPassword) {
  return apiFetch('/auth/change-password', { method: 'POST', token, body: { currentPassword, newPassword } })
}

export async function deleteAccount(token, password) {
  return apiFetch('/auth/delete-account', { method: 'POST', token, body: { password } })
}
