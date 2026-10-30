import type { FirebaseOptions } from "firebase/app"

export interface FirebaseAnalyticsConfig {
  /** The web app's config, with its `measurementId`. */
  firebase: FirebaseOptions
}

/** An analytics adapter for `createAnalytics` from `@inglorious/web/analytics`. */
export interface FirebaseAnalyticsAdapter {
  setConsent(isGranted: boolean): Promise<void>
  pageView(page: { route?: string; path?: string }): Promise<void>
  event(name: string, params?: Record<string, unknown>): Promise<void>
}

/**
 * Google Analytics for Firebase: the PWA reports to the web stream, the
 * native apps to theirs. Native apps must start with collection off.
 */
export declare function firebaseAnalytics(
  config: FirebaseAnalyticsConfig,
): FirebaseAnalyticsAdapter
