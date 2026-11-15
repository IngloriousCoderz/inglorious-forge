/** What a publisher puts at the manifest URL. */
export interface LiveUpdateManifest {
  /** Grows with every bundle: newer than the running release means wanted. */
  release: number
  /** The oldest native build that can run this bundle. */
  minBuild?: number
  /** Where the bundle's zip lives. */
  url: string
  /** The zip's SHA-256, hex. */
  checksum?: string
  /** The zip's RSA-SHA256 signature, base64. */
  signature?: string
}

/** What `createLiveUpdate` needs of `LiveUpdate` from `@capawesome/capacitor-live-update`. */
export interface LiveUpdatePlugin {
  ready(): Promise<unknown>
  reload(): Promise<void>
  getBlockedBundles(): Promise<{ bundleIds: string[] }>
  getDownloadedBundles(): Promise<{ bundleIds: string[] }>
  downloadBundle(options: {
    url: string
    bundleId: string
    checksum?: string
    signature?: string
  }): Promise<void>
  setNextBundle(options: { bundleId: string | null }): Promise<void>
}

/** What `createLiveUpdate` needs of `App` from `@capacitor/app`. */
export interface LiveUpdateApp {
  getInfo(): Promise<{ build: string }>
  addListener(
    event: "resume" | "pause",
    listener: () => void,
  ): Promise<{ remove(): Promise<void> }>
}

export interface LiveUpdateConfig {
  plugin: LiveUpdatePlugin
  /** Needed to check for bundles; without it the type only offers `liveUpdateApply`. */
  app?: LiveUpdateApp
  manifestUrl?: string
  /** The release of the running web code. None for a development build. */
  release?: number
  /** How often to check for a new bundle. Defaults to one hour. */
  checkEveryMs?: number
}

export interface LiveUpdateEntity {
  id?: string
  type: string
  /** A bundle is downloaded and waits for the next trip to the background. */
  isUpdateReady: boolean
  /** The release of the downloaded bundle, or `null`. */
  pendingRelease: number | null
}

export type LiveUpdateType = {
  create(entity: LiveUpdateEntity): void
  destroy(entity: LiveUpdateEntity): void
  liveUpdateReady(entity: LiveUpdateEntity, release: number): void
  /** Moves over to the downloaded bundle now, reloading the app. */
  liveUpdateApply(): void
}

/**
 * The type that keeps a native app on its latest published web code, applying
 * a downloaded bundle on the next trip to the background. Does nothing outside
 * a native app.
 */
export declare function createLiveUpdate(
  config: LiveUpdateConfig,
): LiveUpdateType

/** Whether a published bundle should replace the running one. */
export declare function isLiveUpdateWanted(
  manifest: Pick<LiveUpdateManifest, "release" | "minBuild"> | null,
  installed: { release: number; build: number },
): boolean
