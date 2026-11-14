import { Api } from "../mount"

/** What `createLocalNotifications` needs of `LocalNotifications` from `@capacitor/local-notifications`. */
export interface LocalNotificationsPlugin {
  checkPermissions(): Promise<{ display: string }>
  requestPermissions(): Promise<{ display: string }>
  schedule(options: {
    notifications: {
      id: number
      title: string
      body?: string
      schedule: { at: Date }
      extra?: { url?: string }
    }[]
  }): Promise<unknown>
  cancel(options: { notifications: { id: number }[] }): Promise<void>
  addListener(
    event: "localNotificationActionPerformed",
    listener: (action: { notification: { extra?: { url?: string } } }) => void,
  ): unknown
}

/** A reminder to show at a given time. */
export interface LocalNotification {
  /** A whole number, to cancel it by. */
  id: number
  title: string
  body?: string
  at: Date
  /** Where a tap goes. */
  url?: string
}

export type LocalNotificationsPermission =
  "granted" | "denied" | "prompt" | "unsupported"

export interface LocalNotificationsEntity {
  id?: string
  type: string
  /** `null` until the device says. */
  permission: LocalNotificationsPermission | null
}

export type LocalNotificationsType = {
  create(entity: LocalNotificationsEntity, payload: unknown, api: Api): void
  localNotificationsAsk(
    entity: LocalNotificationsEntity,
    payload: unknown,
    api: Api,
  ): void
  localNotificationsPermission(
    entity: LocalNotificationsEntity,
    permission: LocalNotificationsPermission,
  ): void
  localNotificationSchedule(
    entity: LocalNotificationsEntity,
    notification: LocalNotification,
  ): void
  localNotificationCancel(entity: LocalNotificationsEntity, id: number): void
  localNotificationTap(
    entity: LocalNotificationsEntity,
    url: string | undefined,
    api: Api,
  ): void
}

/**
 * Reminders the device shows at a given time: through the Capacitor plugin in
 * a native app, even with the app closed; through the Notification API in a
 * browser, while the page is open.
 */
export declare function createLocalNotifications(config?: {
  plugin?: LocalNotificationsPlugin
  /** Where a tap goes. Defaults to `#router:navigate`. */
  onTap?: (url: string, api: Api) => void
}): LocalNotificationsType
