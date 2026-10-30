import {
  ConsentStatus,
  ConsentType,
  FirebaseAnalytics,
} from "@capacitor-firebase/analytics"

import { IS_WEB, startFirebase } from "../app.js"

const AD_CONSENTS = [
  ConsentType.AdStorage,
  ConsentType.AdUserData,
  ConsentType.AdPersonalization,
]

/**
 * An analytics adapter over Google Analytics for Firebase, for
 * `createAnalytics` from `@inglorious/web/analytics`: the PWA reports to the
 * project's web stream, the Android and iOS apps to theirs.
 *
 * It is called only once the user said yes, so in a browser nothing loads
 * before then. The native apps must start with collection off, or they
 * measure from launch: `firebase_analytics_collection_enabled` false in
 * AndroidManifest.xml, `FIREBASE_ANALYTICS_COLLECTION_ENABLED` NO in
 * Info.plist. Advertising consents stay denied.
 *
 * A browser counts history changes as page views by itself, so `pageView`
 * logs screens in the native apps only, named after the route.
 *
 * @param {Object} config
 * @param {import("firebase/app").FirebaseOptions} config.firebase - The web
 *   app's config, with its `measurementId`.
 */
export function firebaseAnalytics({ firebase }) {
  let hasStarted = false

  function analytics() {
    startFirebase(firebase)
    return FirebaseAnalytics
  }

  return {
    async setConsent(isGranted) {
      if (!isGranted && !hasStarted) return
      hasStarted = true
      const status = isGranted ? ConsentStatus.Granted : ConsentStatus.Denied
      await analytics().setConsent({
        type: ConsentType.AnalyticsStorage,
        status,
      })
      for (const type of AD_CONSENTS) {
        await analytics().setConsent({ type, status: ConsentStatus.Denied })
      }
      await analytics().setEnabled({ enabled: isGranted })
    },

    async pageView({ route }) {
      if (IS_WEB || !route) return
      await analytics().setCurrentScreen({ screenName: route })
    },

    async event(name, params) {
      await analytics().logEvent({ name, params })
    },
  }
}
