import { Api } from "./mount"

/** Everything vendor-specific about measuring an app. */
export interface AnalyticsAdapter {
  /** Starts or stops measuring. Not called before the user answered. */
  setConsent(isGranted: boolean): void | Promise<void>
  /** One page or screen, on every route change once granted. */
  pageView(page: { route?: string; path?: string }): void | Promise<void>
  /** One of the app's own events. */
  event(name: string, params?: Record<string, unknown>): void | Promise<void>
}

export interface AnalyticsConfig {
  adapter: AnalyticsAdapter
  /** The localStorage key of the choice. Defaults to `"inglorious-analytics-consent"`. */
  consentKey?: string
}

export interface AnalyticsEntity {
  id?: string
  type: string
  /** `null` until the user answered. */
  consent: "granted" | "denied" | null
  /** The app's own consent prompt is showing. */
  isAsking: boolean
}

export type AnalyticsType = {
  create(entity: AnalyticsEntity): void
  /** A page view, from the router's broadcast, once granted. */
  routeChange(
    entity: AnalyticsEntity,
    payload?: { route?: string; path?: string },
  ): void
  /** The consent prompt's answer. */
  analyticsConsent(entity: AnalyticsEntity, isGranted: boolean, api: Api): void
  /** Brings the consent prompt back, to change the choice. */
  analyticsAsk(entity: AnalyticsEntity): void
  /** One of the app's own events, once granted. */
  analyticsTrack(
    entity: AnalyticsEntity,
    payload: { name: string; params?: Record<string, unknown> },
  ): void
}

/** The type that measures how an app is used, once the user said yes. */
export declare function createAnalytics(config: AnalyticsConfig): AnalyticsType
