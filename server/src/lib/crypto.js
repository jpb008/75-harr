// Cloudflare Workers' free tier caps CPU time at ~10ms/request. Measured
// locally (Web Crypto's native PBKDF2-SHA256, same underlying primitive
// Workers uses): 100,000 iterations costs ~18-26ms — over budget and would
// make signup/login fail intermittently. 20,000 costs ~4-6ms, leaving real
// margin for the rest of the request (D1 query, JSON parsing, HMAC sign).
const PBKDF2_ITERATIONS = 20000
const PBKDF2_ALGORITHM = 'pbkdf2-sha256'

function bytesToBase64Url(bytes) {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(base64url) {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4)
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function deriveBits(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  return new Uint8Array(bits)
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const derived = await deriveBits(password, salt, PBKDF2_ITERATIONS)
  return `${PBKDF2_ALGORITHM}$${PBKDF2_ITERATIONS}$${bytesToBase64Url(salt)}$${bytesToBase64Url(derived)}`
}

// Constant-time-ish comparison: always walks the full length of the longer
// array so a mismatched length doesn't short-circuit the loop early.
function timingSafeEqual(a, b) {
  const len = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < len; i += 1) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0)
  }
  return diff === 0
}

export async function verifyPassword(password, stored) {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== PBKDF2_ALGORITHM) return false
  const iterations = Number(parts[1])
  const salt = base64UrlToBytes(parts[2])
  const expected = base64UrlToBytes(parts[3])
  const derived = await deriveBits(password, salt, iterations)
  return timingSafeEqual(derived, expected)
}

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])
}

export async function signToken(payload, secret) {
  const key = await hmacKey(secret)
  const payloadB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)))
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64))
  return `${payloadB64}.${bytesToBase64Url(new Uint8Array(signature))}`
}

export async function verifyToken(token, secret) {
  const [payloadB64, signatureB64] = token.split('.')
  if (!payloadB64 || !signatureB64) return null
  try {
    const key = await hmacKey(secret)
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(signatureB64),
      new TextEncoder().encode(payloadB64)
    )
    if (!valid) return null
    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)))
    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}

// Recovery codes: 12 characters from an unambiguous 32-letter alphabet
// (60 bits), shown as XXXX-XXXX-XXXX. They're random enough that a fast
// SHA-256 hash is safe to store (unlike passwords, they can't be guessed
// from a dictionary).
const RECOVERY_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateRecoveryCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  const chars = Array.from(bytes, (b) => RECOVERY_ALPHABET[b % 32]).join('')
  return `${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8)}`
}

export function normalizeRecoveryCode(code) {
  return String(code ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

export async function hashRecoveryCode(code) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalizeRecoveryCode(code)))
  return bytesToBase64Url(new Uint8Array(digest))
}
