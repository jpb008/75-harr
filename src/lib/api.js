const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_PUSH_API_URL

const REQUEST_TIMEOUT_MS = 10000

export function apiConfigured() {
  return Boolean(API_URL)
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status // 0 = network/unreachable, otherwise the HTTP status
    this.data = data
  }
}

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  if (!API_URL) throw new ApiError('API not configured', 0)

  // A hung request on a weak connection is treated like being offline, so
  // the app falls back to the data saved on the device instead of waiting
  // on a blank screen.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch {
    throw new ApiError('Network error', 0)
  } finally {
    clearTimeout(timer)
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // empty/non-JSON body
  }

  if (!res.ok) {
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data)
  }
  return data
}
