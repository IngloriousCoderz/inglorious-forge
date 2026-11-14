import { isNative } from "../../native/index.js"

/**
 * The type behind reminders the device shows on its own, such as "your job
 * starts in an hour". In a native app they go through `LocalNotifications`
 * from `@capacitor/local-notifications`, given as `plugin`, and show even with
 * the app closed. In a browser they show only while the page is open, through
 * the Notification API.
 *
 * `permission` is `"granted"`, `"denied"`, `"prompt"` or `"unsupported"`.
 * `localNotificationsAsk` brings up the system's dialog: send it from a tap,
 * which a browser requires. `localNotificationSchedule({ id, title, body, at,
 * url })` schedules one, `id` being a whole number to cancel it by with
 * `localNotificationCancel(id)`. A tap on one with a `url` navigates there,
 * through `onTap(url, api)`, by default `#router:navigate`.
 *
 * @param {{ plugin?: object, onTap?: (url: string, api: object) => void }} [config]
 *
 * @example
 * import { LocalNotifications } from "@capacitor/local-notifications"
 * const types = {
 *   Reminders: createLocalNotifications({ plugin: LocalNotifications }),
 * }
 * api.notify("#reminders:localNotificationSchedule", {
 *   id: 1,
 *   title: "Wedding in an hour",
 *   at: new Date(start - HOUR),
 *   url: "/jobs/1",
 * })
 */
export function createLocalNotifications({
  plugin,
  onTap = (url, api) => api.notify("#router:navigate", url),
} = {}) {
  const device = plugin && isNative() ? fromPlugin(plugin) : fromBrowser()

  return {
    create(entity, _, api) {
      const { id } = entity
      entity.permission ??= null
      device.onTap((url) => api.notify(`#${id}:localNotificationTap`, url))
      device
        .permission()
        .then((permission) =>
          api.notify(`#${id}:localNotificationsPermission`, permission),
        )
    },

    localNotificationsAsk(entity, _, api) {
      const { id } = entity
      device
        .request()
        .then((permission) =>
          api.notify(`#${id}:localNotificationsPermission`, permission),
        )
    },

    localNotificationsPermission(entity, permission) {
      entity.permission = permission
    },

    localNotificationSchedule(entity, notification) {
      device.schedule(notification)
    },

    localNotificationCancel(entity, notificationId) {
      device.cancel(notificationId)
    },

    localNotificationTap(entity, url, api) {
      if (url) onTap(url, api)
    },
  }
}

function fromPlugin(plugin) {
  return {
    permission: () => plugin.checkPermissions().then(toPermission),
    request: () => plugin.requestPermissions().then(toPermission),
    schedule: ({ id, title, body, at, url }) =>
      plugin.schedule({
        notifications: [{ id, title, body, schedule: { at }, extra: { url } }],
      }),
    cancel: (id) => plugin.cancel({ notifications: [{ id }] }),
    onTap: (listener) =>
      plugin.addListener(
        "localNotificationActionPerformed",
        ({ notification }) => listener(notification.extra?.url),
      ),
  }
}

function fromBrowser() {
  const Notification = globalThis.Notification
  const timers = new Map()
  let tapListener = () => {}

  return {
    permission: async () =>
      Notification ? toPermission(Notification.permission) : "unsupported",
    request: async () =>
      Notification
        ? toPermission(await Notification.requestPermission())
        : "unsupported",
    schedule: ({ id, title, body, at, url }) => {
      if (!Notification) return
      clearTimeout(timers.get(id))
      const delay = new Date(at).getTime() - Date.now()
      const show = () => {
        timers.delete(id)
        const notification = new Notification(title, { body })
        notification.onclick = () => {
          globalThis.focus?.()
          tapListener(url)
        }
      }
      timers.set(id, setTimeout(show, delay))
    },
    cancel: (id) => {
      clearTimeout(timers.get(id))
      timers.delete(id)
    },
    onTap: (listener) => {
      tapListener = listener
    },
  }
}

function toPermission(result) {
  const value = typeof result === "string" ? result : result.display
  if (value === "granted" || value === "denied") return value
  return "prompt"
}
