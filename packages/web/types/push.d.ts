import { Api } from "./mount"

export type PushPermission = "granted" | "denied" | "prompt"

/** Everything vendor-specific about pushes: the device, and where its token goes. */
export interface PushAdapter {
  /** Whether this device can receive pushes at all. */
  isSupported(): Promise<boolean>
  permission(): Promise<PushPermission>
  /**
   * Brings up the system's dialog. In a browser it must call
   * `Notification.requestPermission()` before it awaits anything.
   */
  request(): Promise<PushPermission>
  /** Gets the device's token and stores it for the signed-in user. */
  register(): Promise<void>
  /** Calls `listener(url)` when a push the system showed is tapped. */
  onTap?(listener: (url: string) => void): void
}

export interface PushPromptConfig {
  adapter: PushAdapter
  /** The localStorage key of a decline. Defaults to `"inglorious-push-declined"`. */
  declineKey?: string
  /** Opens a tapped push's `url`. Defaults to `#router:navigate`. */
  onTap?: (url: string, api: Api) => void
}

export interface PushPromptEntity {
  id?: string
  type: string
  /** The app's own prompt is showing. */
  isOpen: boolean
  /** Between `pushStart` and `pushStop`: someone to register for. */
  isActive: boolean
}

export type PushPromptType = {
  create(entity: PushPromptEntity, payload?: unknown, api?: Api): void
  /** Checks the permission: registers if granted, else opens the prompt. */
  pushStart(entity: PushPromptEntity, payload?: unknown, api?: Api): void
  /** Closes the prompt. */
  pushStop(entity: PushPromptEntity): void
  /** The prompt's yes: brings up the system's dialog. */
  pushAsk(entity: PushPromptEntity, payload?: unknown, api?: Api): void
  /** The prompt's no, remembered on this device. */
  pushDecline(entity: PushPromptEntity): void
  [handler: string]: unknown
}

/** The type that asks a device for pushes and keeps it registered. */
export declare function createPushPrompt(
  config: PushPromptConfig,
): PushPromptType
