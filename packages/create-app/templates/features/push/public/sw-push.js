self.addEventListener("push", (event) => {
  const { title, body, url } = event.data.json().data
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/pwa-192x192.png",
      data: { url },
    }),
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = new URL(event.notification.data.url, self.location.origin).href
  event.waitUntil(open(url))
})

async function open(url) {
  const [client] = await self.clients.matchAll({ type: "window" })
  if (!client) return self.clients.openWindow(url)
  await client.focus()
  if (client.url !== url) await client.navigate(url)
}
