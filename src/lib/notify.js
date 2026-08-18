export function notificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window
}

// Resolves to the permission the browser actually settled on — the
// caller decides what to persist based on this, never assumes success.
export async function requestNotificationPermission() {
  if (!notificationsSupported()) return 'unsupported'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

// Prefers the service worker's showNotification — required on some
// platforms (Android Chrome rejects `new Notification()` from an
// installed PWA's page context) and works whether or not the app is
// currently focused, as long as it's still running somewhere.
export async function fireNotification(title, options) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
      return
    } catch {
      // fall through to the plain constructor
    }
  }
  try {
    new Notification(title, options)
  } catch {
    // some platforms reject direct construction — nothing more to do
  }
}
