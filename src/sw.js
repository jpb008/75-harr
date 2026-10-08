import { precacheAndRoute } from 'workbox-precaching'

precacheAndRoute(self.__WB_MANIFEST)

// Lets the service worker take over immediately after an update instead of
// waiting for every open tab to close first.
self.skipWaiting()
self.addEventListener('activate', () => self.clients.claim())

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data?.json() ?? {}
  } catch {
    data = { title: '75 Hard', body: event.data?.text() }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || '75 Hard', {
      body: data.body,
      tag: data.tag || 'at-risk',
      icon: './icon-192.png',
      badge: './icon-192.png',
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const existing = clients.find((c) => 'focus' in c)
      if (existing) return existing.focus()
      return self.clients.openWindow('./')
    })
  )
})
