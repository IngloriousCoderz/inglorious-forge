import { Capacitor } from "@capacitor/core"
import { getApps, initializeApp } from "firebase/app"

export const PLATFORM = Capacitor.getPlatform()
export const IS_WEB = PLATFORM === "web"

/**
 * Starts the Firebase app a browser needs, once, whichever adapter asks
 * first. The native apps read the project from google-services.json and
 * GoogleService-Info.plist instead, so there this does nothing.
 * @param {import("firebase/app").FirebaseOptions} config
 */
export function startFirebase(config) {
  if (IS_WEB && !getApps().length) initializeApp(config)
}
