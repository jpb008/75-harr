const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY
const PUSH_API_URL = import.meta.env.VITE_PUSH_API_URL

export function pushConfigured() {
  return Boolean(VAPID_PUBLIC_KEY && PUSH_API_URL)
}

// Push subscription keys arrive base64url-encoded; PushManager.subscribe
// wants the VAPID key as a raw Uint8Array.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export async function subscribeToPush() {
  if (!pushConfigured() || !('serviceWorker' in navigator)) return false
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    await fetch(`${PUSH_API_URL}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        tzOffsetMinutes: new Date().getTimezoneOffset(),
      }),
    })
    return true
  } catch {
    return false
  }
}

export async function hasPushSubscription() {
  if (!('serviceWorker' in navigator)) return false
  try {
    const registration = await navigator.serviceWorker.ready
    return Boolean(await registration.pushManager.getSubscription())
  } catch {
    return false
  }
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return
    const endpoint = subscription.endpoint
    await subscription.unsubscribe()
    if (pushConfigured()) {
      await fetch(`${PUSH_API_URL}/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      })
    }
  } catch {
    // best-effort cleanup
  }
}
