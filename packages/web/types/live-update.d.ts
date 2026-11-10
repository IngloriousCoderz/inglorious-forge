import { Api } from "./mount"

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

/** What the live update types need of `LiveUpdate` from `@capawesome/capacitor-live-update`. */
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

/** What `watchLiveUpdate` needs of `App` from `@capacitor/app`. */
export interface LiveUpdateApp {
  getInfo(): Promise<{ build: string }>
  addListener(
    event: "resume" | "pause",
    listener: () => void,
  ): Promise<{ remove(): Promise<void> }>
}

export interface LiveUpdateEntity {
  id?: string
  type: string
  /** A bundle is downloaded and waits for the next trip to the background. */
  isUpdateReady: boolean
}

export type LiveUpdateType = {
  create(entity: LiveUpdateEntity): void
  liveUpdateReady(entity: LiveUpdateEntity): void
  /** Moves over to the downloaded bundle now, reloading the app. */
  liveUpdateApply(): void
}

/** The type that offers a downloaded live update. */
export declare function createLiveUpdate(config: {
  plugin: Pick<LiveUpdatePlugin, "reload">
}): LiveUpdateType

/** Whether a published bundle should replace the running one. */
export declare function isLiveUpdateWanted(
  manifest: Pick<LiveUpdateManifest, "release" | "minBuild"> | null,
  installed: { release: number; build: number },
): boolean

export interface WatchLiveUpdateOptions {
  plugin: LiveUpdatePlugin
  app: LiveUpdateApp
  /** Where to announce a downloaded bundle. */
  store?: Pick<Api, "notify">
  manifestUrl: string
  /** The release of the running web code. */
  release: number
  /** The LiveUpdate entity to announce to. Defaults to `liveUpdate`. */
  id?: string
  /** How often to check for a new bundle. Defaults to one hour. */
  checkEveryMs?: number
}

/**
 * Keeps a native app on its latest published web code, applying a downloaded
 * bundle on the next trip to the background. Does nothing outside a native app.
 * @returns A function that stops watching.
 */
export declare function watchLiveUpdate(
  options: WatchLiveUpdateOptions,
): () => Promise<void>
