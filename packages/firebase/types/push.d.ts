import type { FirebaseOptions } from "firebase/app"

export type PushPermission = "granted" | "denied" | "prompt"
export type PushPlatform = "web" | "android" | "ios"

export interface FirebasePushConfig {
  /** The web app's config, from the Firebase console. */
  firebase: FirebaseOptions
  /** The public half of the project's Web Push key pair. */
  vapidKey: string
  /** Keeps the device's token for the signed-in user. */
  saveToken(token: string, platform: PushPlatform): Promise<void>
  /** Drops a token, at sign-out. */
  deleteToken(token: string): Promise<void>
  /** The localStorage key of this device's token. Defaults to `"inglorious-push-token"`. */
  tokenKey?: string
}

/** A push adapter for `createPushPrompt` from `@inglorious/web/push`. */
export interface FirebasePushAdapter {
  isSupported(): Promise<boolean>
  permission(): Promise<PushPermission>
  request(): Promise<PushPermission>
  register(): Promise<void>
  /** Deletes the token this device stored. Call it before signing out. */
  unregister(): Promise<void>
  onTap(listener: (url: string) => void): void
}

/** Firebase Cloud Messaging, in the PWA, Android and iOS alike. */
export declare function firebasePush(
  config: FirebasePushConfig,
): FirebasePushAdapter
