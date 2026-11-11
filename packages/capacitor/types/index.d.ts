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

export interface ProjectSettings {
  root: string
  appId: string
  appName: string
  appLinks: Required<NonNullable<NativeConfig["appLinks"]>> | null
  ios: {
    teamId: string | null
    infoPlist: Record<string, unknown>
    swipeBack?: boolean
  }
  android: { sha256: string[]; permissions: string[] }
  assets: NonNullable<NativeConfig["assets"]>
  hasPush: boolean
  hasAnalytics: boolean
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

/** Makes the native icons and splash screens from one logo. */
export declare function assets(options?: {
  root?: string
  platforms?: ("ios" | "android")[]
}): Promise<void>
