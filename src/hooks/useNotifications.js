import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { notificationsSupported, requestNotificationPermission } from '../lib/notify'
import { hasPushSubscription, pushConfigured, subscribeToPush, unsubscribeFromPush } from '../lib/push'

export function useNotifications() {
  const supported = notificationsSupported()
  const [enabledPref, setEnabledPref] = useState(() => loadJSON('notificationsEnabled', false))
  const [permission, setPermission] = useState(() => (supported ? Notification.permission : 'unsupported'))
  const [pushActive, setPushActive] = useState(false)

  useEffect(() => saveJSON('notificationsEnabled', enabledPref), [enabledPref])

  // Re-establish the push subscription on mount if the preference was
  // already on from a previous session (e.g. the subscription was lost, or
  // this is a fresh service worker install).
  useEffect(() => {
    if (!enabledPref || permission !== 'granted' || !pushConfigured()) return
    hasPushSubscription().then((has) => {
      if (has) setPushActive(true)
      else subscribeToPush().then(setPushActive)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function enable() {
    const result = await requestNotificationPermission()
    setPermission(result)
    setEnabledPref(result === 'granted')
    if (result === 'granted') {
      setPushActive(await subscribeToPush())
    }
  }

  function disable() {
    setEnabledPref(false)
    setPushActive(false)
    unsubscribeFromPush()
  }

  return {
    // The source of truth for "should we actually fire" — a stale local
    // preference doesn't count if the browser permission was revoked since.
    enabled: enabledPref && permission === 'granted',
    // Whether the closed-app push path is actually wired up, vs. just the
    // open-app in-page notification. Callers can use this to tailor copy.
    pushEnabled: pushConfigured() && pushActive,
    pushConfigured: pushConfigured(),
    permission,
    supported,
    enable,
    disable,
  }
}
