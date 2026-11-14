/** The `native` key of the app's `package.json`. */
export interface NativeConfig {
  /** Links to this domain open the installed app. */
  appLinks?: {
    domain: string
    /**
     * Paths that open the app: `/jobs*` matches every path starting with
     * `/jobs`. Defaults to `["/*"]`.
     */
    paths?: string[]
    /**
     * Paths (`/onboarding*`) or fragments (`#*access_token*`) that stay in the
     * browser. iOS only: Android opens just the `paths`.
     */
    exclude?: string[]
  }
  ios?: {
    /** The Apple Developer Team ID that signs the app. */
    teamId?: string
    /** Extra Info.plist entries, such as usage descriptions. */
    infoPlist?: Record<string, unknown>
    /**
     * Swiping from the left edge goes back, as in other iOS apps: turns on
     * WebKit's back gesture in a generated `MainViewController`.
     */
    swipeBack?: boolean
    /**
     * Entries of the app's `PrivacyInfo.xcprivacy`, with Apple's keys. Merged
     * with the manifest already there and with the required-reason APIs of
     * known plugins that do not declare their own.
     */
    privacyManifest?: PrivacyManifest
  }
  android?: {
    /** SHA-256 fingerprints of the keys that sign the app, for App Links. */
    sha256?: string[]
    /** Extra permissions, such as `android.permission.RECORD_AUDIO`. */
    permissions?: string[]
  }
  assets?: {
    /** Defaults to `public/logo.svg`, then `public/logo.png`. */
    logo?: string
    /** Icon and splash background. Defaults to `#ffffff`. */
    background?: string
    /** Splash background in dark mode. Defaults to `#121212`. */
    backgroundDark?: string
    /** The logo's width as a share of the icon. Defaults to `0.6`. */
    iconScale?: number
    /** The logo's width as a share of the splash. Defaults to `0.3`. */
    splashScale?: number
  }
}

/** An app's privacy manifest, with Apple's keys. */
export interface PrivacyManifest {
  NSPrivacyTracking?: boolean
  NSPrivacyTrackingDomains?: string[]
  NSPrivacyCollectedDataTypes?: Record<string, unknown>[]
  NSPrivacyAccessedAPITypes?: AccessedApiType[]
}

/** A required-reason API and why the app calls it. */
export interface AccessedApiType {
  NSPrivacyAccessedAPIType: string
  NSPrivacyAccessedAPITypeReasons: string[]
}

export interface ProjectSettings {
  root: string
  appId: string
  appName: string
  /** The built web app, from the Capacitor config. */
  webDir: string
  appLinks: Required<NonNullable<NativeConfig["appLinks"]>> | null
  ios: {
    teamId: string | null
    infoPlist: Record<string, unknown>
    swipeBack?: boolean
    privacyManifest: PrivacyManifest | null
  }
  android: { sha256: string[]; permissions: string[] }
  assets: NonNullable<NativeConfig["assets"]>
  hasPush: boolean
  hasAnalytics: boolean
  /** Required-reason APIs the app's plugins use without declaring them. */
  accessedApiTypes: AccessedApiType[]
}

/**
 * Reads the Capacitor config, the `native` settings and the Firebase plugins
 * the app depends on.
 */
export declare function readSettings(
  root: string,
  env?: NodeJS.ProcessEnv,
): Promise<ProjectSettings>

/**
 * Applies the `native` settings to the native projects that exist, and writes
 * `public/.well-known` for App Links. Idempotent: it runs after every
 * `cap sync`.
 * @returns The platforms it configured.
 */
export declare function configure(options?: {
  root?: string
  env?: NodeJS.ProcessEnv
}): Promise<string[]>

/** A device whose store screenshots `listingAssets` captures. */
export type ListingDevice =
  "iphone-6.9" | "iphone-6.3" | "ipad-13" | "android" | "tablet-7" | "tablet-10"

/** The default export of `listing.config.js`. */
export interface ListingConfig {
  /** The running app. Defaults to `http://localhost:5173`. */
  url?: string
  /** One set of screenshots each. Defaults to one set, in the browser's locale. */
  locales?: string[]
  /** The query parameter the app reads the locale from, such as `lang`. */
  localeParam?: string
  /** Defaults to `["iphone-6.9", "android"]`. */
  devices?: ListingDevice[]
  /** Defaults to `listing-assets`. */
  out?: string
  /** The Playwright browser channel. Defaults to `chrome`. */
  browser?: string
  /** Milliseconds to wait after a screen loads. Defaults to `1000`. */
  settle?: number
  /**
   * `localStorage` entries set before the app starts, such as answers to the
   * consent and push prompts, so they stay out of the screenshots.
   */
  storage?:
    | Record<string, unknown>
    | ((locale: string | null) => Record<string, unknown>)
  /** Signs the demo account in, once per locale: the other devices reuse the session. */
  signIn?: (
    page: import("playwright-core").Page,
    context: { url: string; locale: string | null },
  ) => Promise<void>
  /** In the order the stores show them. */
  screens: {
    /** The file name, such as `01-feed`. */
    name: string
    path: string
    /** Brings the screen to the state worth showing, such as a filled form. */
    prepare?: (
      page: import("playwright-core").Page,
      context: { locale: string | null },
    ) => Promise<void>
  }[]
  /** The feature graphic, header and search results images. */
  promo?: {
    /** One line, or one per locale. A newline breaks the line. */
    tagline?: string | Record<string, string>
    /** The search results card's smaller line under the tagline. */
    subtitle?: string | Record<string, string>
    /**
     * The screenshots framed in the header (both) and search results card
     * (the first). Defaults to the first two `screens`.
     */
    screens?: string[]
    /** Whose screenshots to frame. Defaults to the first iPhone in `devices`. */
    device?: ListingDevice
    /** Defaults to `native.assets.background`. */
    background?: string
    /** Text and phone frames. Defaults to `#1f1f1f`. */
    color?: string
    /** A short bar under the text, in this colour. None by default. */
    accent?: string
    /** A CSS font-family. Defaults to the system font. */
    font?: string
  }
}

/**
 * Captures store screenshots of the running app and makes the promotional
 * images and Google Play's 512px icon, from `listing.config.js`.
 * @returns The folder written to.
 */
export declare function listingAssets(options?: {
  root?: string
}): Promise<string>

/** Makes the native icons and splash screens from one logo. */
export declare function assets(options?: {
  root?: string
  platforms?: ("ios" | "android")[]
}): Promise<void>

/**
 * Runs the app on a device or emulator with live reload: Vite listens on the
 * local network and `cap run --live-reload` points the app at it. Builds the
 * web app first if it was never built.
 * @returns The exit code of `cap run`.
 */
export declare function dev(options: {
  root?: string
  platform: "ios" | "android"
  /** Defaults to 5173. */
  port?: number
  /** More options for `cap run`, such as `["--target", "<id>"]`. */
  args?: string[]
}): Promise<number>
