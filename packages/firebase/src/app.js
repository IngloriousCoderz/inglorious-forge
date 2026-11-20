import { Capacitor } from "@capacitor/core"
import { getApps, initializeApp } from "firebase/app"

export const PLATFORM = Capacitor.getPlatform()
export const IS_WEB = PLATFORM === "web"

// What every Firebase web app needs before it can start.
const REQUIRED_KEYS = ["apiKey", "projectId", "appId"]

/**
 * Whether there is a Firebase project to talk to. A browser needs the web
 * app's config: until it is filled in, as in a project just created, Firebase
 * would fail on its first call, so the adapters stand aside instead. The
 * native apps read their project from google-services.json and
 * GoogleService-Info.plist, so they always count as configured.
 * @param {import("firebase/app").FirebaseOptions} [config]
 * @param {string[]} [extraKeys] - What else the caller needs, such as
 *   `measurementId`.
 */
export function isConfigured(config, extraKeys = []) {
  if (!IS_WEB) return true
  return [...REQUIRED_KEYS, ...extraKeys].every((key) => Boolean(config?.[key]))
}

/**
 * Starts the Firebase app a browser needs, once, whichever adapter asks
 * first. The native apps read the project from google-services.json and
 * GoogleService-Info.plist instead, so there this does nothing.
 * @param {import("firebase/app").FirebaseOptions} config
 */
export function startFirebase(config) {
  if (IS_WEB && !getApps().length) initializeApp(config)
}
