export interface LiveUpdateManifest {
  release: number
  minBuild: number
  url: string
  checksum: string
  signature: string
}

export interface PackLiveUpdateOptions {
  /** The built app, with `index.html` at its root. */
  dist: string
  /** Grows with every bundle, like the build's timestamp. */
  release: number
  /** The oldest native build that can run this bundle. Defaults to 0. */
  minBuild?: number
  /** PEM. */
  privateKey: string
  /** Where the zip will be served. */
  url: string
}

/** A new RSA key pair for signing live updates, as PEM. */
export declare function generateLiveUpdateKeys(): {
  privateKey: string
  publicKey: string
}

/** Zips a built app and signs the zip for `@capawesome/capacitor-live-update`. */
export declare function packLiveUpdate(options: PackLiveUpdateOptions): {
  zip: Uint8Array
  manifest: LiveUpdateManifest
}

export interface PublishLiveUpdateOptions extends Omit<
  PackLiveUpdateOptions,
  "url"
> {
  projectUrl: string
  /** A key allowed to write to the bucket, such as the service role key. */
  serviceKey: string
  /** A public bucket. Defaults to `live-updates`. */
  bucket?: string
  /** How many bundles to keep, the new one included. Defaults to 2. */
  keepBundles?: number
}

/**
 * Packs a built app and publishes the zip and `manifest.json` to a public
 * Supabase Storage bucket, then deletes all but the newest `keepBundles`
 * zips. A failed cleanup only warns.
 */
export declare function publishLiveUpdate(
  options: PublishLiveUpdateOptions,
): Promise<LiveUpdateManifest>

export declare function liveUpdateManifestUrl(
  projectUrl: string,
  options?: { bucket?: string },
): string
