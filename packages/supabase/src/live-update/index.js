import { createHash, generateKeyPairSync, sign } from "node:crypto"
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { zipSync } from "fflate"

import { DEFAULT_BUCKET, liveUpdateManifestUrl } from "./url.js"

const NO_MIN_BUILD = 0
const KEY_BITS = 2048
const MANIFEST_CACHE_SECONDS = 60
const BUNDLE_CACHE_SECONDS = 31_536_000

export { liveUpdateManifestUrl }

/**
 * A new RSA key pair for signing live updates, as PEM. Keep the private key
 * off the build machine; the public key goes in the app's Capacitor config.
 */
export function generateLiveUpdateKeys() {
  return generateKeyPairSync("rsa", {
    modulusLength: KEY_BITS,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  })
}

/**
 * Zips a built app and signs the zip the way
 * `@capawesome/capacitor-live-update` checks it: RSA with SHA-256 over the
 * zip's bytes, in base64.
 *
 * @param {{ dist: string, release: number, minBuild?: number, privateKey: string, url: string }} options
 *   `url` is where the zip will be served.
 */
export function packLiveUpdate({
  dist,
  release,
  minBuild = NO_MIN_BUILD,
  privateKey,
  url,
}) {
  const zip = zipSync(filesOf(dist))
  return {
    zip,
    manifest: {
      release,
      minBuild,
      url,
      checksum: createHash("sha256").update(zip).digest("hex"),
      signature: sign("sha256", zip, privateKey).toString("base64"),
    },
  }
}

/**
 * Packs a built app and publishes it to a public Supabase Storage bucket: the
 * zip at `bundles/<release>.zip`, then `manifest.json`, which
 * `watchLiveUpdate` from `@inglorious/web/live-update` reads.
 *
 * @param {{
 *   dist: string,
 *   release: number,
 *   minBuild?: number,
 *   privateKey: string,
 *   projectUrl: string,
 *   serviceKey: string,
 *   bucket?: string,
 * }} options
 * @returns {Promise<import("../../types/live-update.js").LiveUpdateManifest>}
 */
export async function publishLiveUpdate({
  dist,
  release,
  minBuild,
  privateKey,
  projectUrl,
  serviceKey,
  bucket = DEFAULT_BUCKET,
}) {
  const bundlePath = `bundles/${release}.zip`
  const { zip, manifest } = packLiveUpdate({
    dist,
    release,
    minBuild,
    privateKey,
    url: `${projectUrl}/storage/v1/object/public/${bucket}/${bundlePath}`,
  })
  const upload = (file, body, contentType, cacheSeconds) =>
    put(`${projectUrl}/storage/v1/object/${bucket}/${file}`, body, {
      serviceKey,
      contentType,
      cacheSeconds,
    })
  await upload(bundlePath, zip, "application/zip", BUNDLE_CACHE_SECONDS)
  await upload(
    "manifest.json",
    JSON.stringify(manifest),
    "application/json",
    MANIFEST_CACHE_SECONDS,
  )
  return manifest
}

function filesOf(directory, prefix = "") {
  const files = {}
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name)
    const name = `${prefix}${entry.name}`
    if (entry.isDirectory()) Object.assign(files, filesOf(full, `${name}/`))
    else files[name] = readFileSync(full)
  }
  return files
}

async function put(url, body, { serviceKey, contentType, cacheSeconds }) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${serviceKey}`,
      "content-type": contentType,
      "cache-control": `max-age=${cacheSeconds}`,
      "x-upsert": "true",
    },
    body,
  })
  if (!response.ok) {
    throw new Error(`Upload to ${url} failed: ${await response.text()}`)
  }
}
