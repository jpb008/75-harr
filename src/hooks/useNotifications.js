import { useEffect, useState } from 'react'
import { loadJSON, saveJSON } from '../lib/storage'
import { notificationsSupported, requestNotificationPermission } from '../lib/notify'

export function useNotifications() {
  const supported = notificationsSupported()
  const [enabledPref, setEnabledPref] = useState(() => loadJSON('notificationsEnabled', false))
  const [permission, setPermission] = useState(() => (supported ? Notification.permission : 'unsupported'))

  useEffect(() => saveJSON('notificationsEnabled', enabledPref), [enabledPref])

  async function enable() {
    const result = await requestNotificationPermission()
    setPermission(result)
    setEnabledPref(result === 'granted')
  }

  function disable() {
    setEnabledPref(false)
  }

  return {
    // The source of truth for "should we actually fire" — a stale local
    // preference doesn't count if the browser permission was revoked since.
    enabled: enabledPref && permission === 'granted',
    permission,
    supported,
    enable,
    disable,
  }
}
