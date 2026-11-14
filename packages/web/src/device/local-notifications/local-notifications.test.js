import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createLocalNotifications } from "./index.js"

const HOUR = 3_600_000

function storeWith(type) {
  return createStore({
    types: { Reminders: type },
    entities: { reminders: { type: "Reminders" } },
  })
}

describe("createLocalNotifications", () => {
  afterEach(() => {
    delete globalThis.Capacitor
    delete globalThis.Notification
    vi.useRealTimers()
  })

  describe("in a browser", () => {
    let shown

    beforeEach(() => {
      vi.useFakeTimers()
      shown = []
      globalThis.Notification = class {
        static permission = "default"
        static requestPermission = vi.fn(async () => "granted")
        constructor(title, options) {
          shown.push(this)
          Object.assign(this, { title, ...options })
        }
      }
    })

    it("asks for permission", async () => {
      const store = storeWith(createLocalNotifications())
      await vi.waitFor(() =>
        expect(store.getEntity("reminders").permission).toBe("prompt"),
      )

      store.notify("#reminders:localNotificationsAsk")

      await vi.waitFor(() =>
        expect(store.getEntity("reminders").permission).toBe("granted"),
      )
    })

    it("shows a notification at its time, while the page is open", () => {
      const store = storeWith(createLocalNotifications())
      store.notify("#reminders:localNotificationSchedule", {
        id: 1,
        title: "Wedding in an hour",
        body: "Villa Erba",
        at: new Date(Date.now() + HOUR),
      })

      vi.advanceTimersByTime(HOUR - 1)
      expect(shown).toHaveLength(0)
      vi.advanceTimersByTime(1)
      expect(shown[0]).toMatchObject({
        title: "Wedding in an hour",
        body: "Villa Erba",
      })
    })

    it("cancels one by its id", () => {
      const store = storeWith(createLocalNotifications())
      store.notify("#reminders:localNotificationSchedule", {
        id: 1,
        title: "Soon",
        at: new Date(Date.now() + HOUR),
      })
      store.notify("#reminders:localNotificationCancel", 1)

      vi.advanceTimersByTime(HOUR)
      expect(shown).toHaveLength(0)
    })

    it("goes to its url when tapped", () => {
      const onTap = vi.fn()
      const store = storeWith(createLocalNotifications({ onTap }))
      store.notify("#reminders:localNotificationSchedule", {
        id: 1,
        title: "Soon",
        at: new Date(),
        url: "/jobs/1",
      })
      vi.advanceTimersByTime(0)

      shown[0].onclick()

      expect(onTap).toHaveBeenCalledWith("/jobs/1", expect.anything())
    })

    it("says when notifications are unsupported", async () => {
      delete globalThis.Notification
      const store = storeWith(createLocalNotifications())

      await vi.waitFor(() =>
        expect(store.getEntity("reminders").permission).toBe("unsupported"),
      )
    })
  })

  describe("in a native app", () => {
    let plugin
    let tap

    beforeEach(() => {
      globalThis.Capacitor = { isNativePlatform: () => true }
      plugin = {
        checkPermissions: vi.fn(async () => ({ display: "prompt" })),
        requestPermissions: vi.fn(async () => ({ display: "granted" })),
        schedule: vi.fn(async () => {}),
        cancel: vi.fn(async () => {}),
        addListener: vi.fn((name, listener) => {
          tap = listener
        }),
      }
    })

    it("schedules and cancels through the plugin", () => {
      const at = new Date(Date.now() + HOUR)
      const store = storeWith(createLocalNotifications({ plugin }))

      store.notify("#reminders:localNotificationSchedule", {
        id: 1,
        title: "Soon",
        at,
        url: "/jobs/1",
      })
      store.notify("#reminders:localNotificationCancel", 1)

      expect(plugin.schedule).toHaveBeenCalledWith({
        notifications: [
          {
            id: 1,
            title: "Soon",
            body: undefined,
            schedule: { at },
            extra: { url: "/jobs/1" },
          },
        ],
      })
      expect(plugin.cancel).toHaveBeenCalledWith({ notifications: [{ id: 1 }] })
    })

    it("asks through the plugin", async () => {
      const store = storeWith(createLocalNotifications({ plugin }))
      store.notify("#reminders:localNotificationsAsk")

      await vi.waitFor(() =>
        expect(store.getEntity("reminders").permission).toBe("granted"),
      )
    })

    it("navigates where a tapped notification points", () => {
      const store = storeWith(createLocalNotifications({ plugin }))
      const notify = vi.spyOn(store._api, "notify")

      tap({ notification: { extra: { url: "/jobs/1" } } })

      expect(notify).toHaveBeenCalledWith("#router:navigate", "/jobs/1")
    })
  })
})
