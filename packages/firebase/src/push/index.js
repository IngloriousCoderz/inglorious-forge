import { FirebaseMessaging } from "@capacitor-firebase/messaging"

import { IS_WEB, PLATFORM, startFirebase } from "../app.js"

const DEFAULT_TOKEN_KEY = "inglorious-push-token"

/**
 * A push adapter over Firebase Cloud Messaging, for `createPushPrompt` from
 * `@inglorious/web/push`: one token per device, in the PWA, Android and iOS
 * alike. Where the token is kept is the app's, through `saveToken` and
 * `deleteToken`.
 *
 * In a browser, pushes arrive at the PWA's own service worker (the one
 * `navigator.serviceWorker.ready` gives), as Web Push carrying FCM's JSON;
 * showing them and their taps is that worker's. In the native apps the
 * system shows them, and `onTap` hears the tap.
 *
 * @param {Object} config
 * @param {import("firebase/app").FirebaseOptions} config.firebase - The web
 *   app's config, from the Firebase console.
 * @param {string} config.vapidKey - The public half of the project's Web Push
 *   key pair.
 * @param {(token: string, platform: "web" | "android" | "ios") => Promise<void>} config.saveToken
 * @param {(token: string) => Promise<void>} config.deleteToken
 * @param {string} [config.tokenKey] - The localStorage key of this device's
 *   token, which `unregister` deletes.
 */
export function firebasePush({
  firebase,
  vapidKey,
  saveToken,
  deleteToken,
  tokenKey = DEFAULT_TOKEN_KEY,
}) {
  // A browser's half of the plugin loads on its first call, and needs the
  // app started by then.
  function messaging() {
    startFirebase(firebase)
    return FirebaseMessaging
  }

  return {
    async isSupported() {
      const { isSupported } = await messaging().isSupported()
      return isSupported
    },

    // "prompt" covers never asked and asked but dismissed, which Android
    // reports as "prompt-with-rationale".
    async permission() {
      const { receive } = await messaging().checkPermissions()
      return toPermission(receive)
    },

    // A browser shows its dialog only within the tap that asked, so
    // Notification.requestPermission runs before anything awaits.
    async request() {
      if (IS_WEB) return toPermission(await Notification.requestPermission())
      const { receive } = await messaging().requestPermissions()
      return toPermission(receive)
    },

    // The same token again, unless FCM rotated it.
    async register() {
      const options = IS_WEB
        ? {
            vapidKey,
            serviceWorkerRegistration: await navigator.serviceWorker.ready,
          }
        : {}
      const { token } = await messaging().getToken(options)
      await saveToken(token, PLATFORM)
      try {
        window.localStorage.setItem(tokenKey, token)
      } catch {
        // Without storage unregister cannot find it; the next user of the
        // device takes the token over.
      }
    },

    // Before the sign-out, while the user can still delete their own token.
    // It comes from storage, not FCM, which would mint one on a device that
    // never had any.
    async unregister() {
      let token
      try {
        token = window.localStorage.getItem(tokenKey)
      } catch {
        return
      }
      if (!token) return
      await deleteToken(token)
      window.localStorage.removeItem(tokenKey)
    },

    onTap(listener) {
      if (IS_WEB) return
      messaging().addListener(
        "notificationActionPerformed",
        ({ notification }) => {
          const url = notification.data?.url
          if (url) listener(url)
        },
      )
    },
  }
}

function toPermission(state) {
  return state === "granted" || state === "denied" ? state : "prompt"
}
