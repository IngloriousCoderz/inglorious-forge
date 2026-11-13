import { createHash, generateKeyPairSync, sign } from "node:crypto"
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { zipSync } from "fflate"

import { DEFAULT_BUCKET, liveUpdateManifestUrl } from "./url.js"

const NO_MIN_BUILD = 0
const KEY_BITS = 2048
const MANIFEST_CACHE_SECONDS = 60
const BUNDLE_CACHE_SECONDS = 31_536_000
const BUNDLES_FOLDER = "bundles"
const DEFAULT_KEEP_BUNDLES = 2
const LIST_PAGE_SIZE = 1000
const NONE = 0
const THE_NEW_ONE = 1

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
 * `watchLiveUpdate` from `@inglorious/web/native/live-update` reads.
 *
 * Then it deletes all but the newest `keepBundles` zips, 2 by default: the
 * manifest points only to the latest, and a bundle that fails rolls back to
 * the app's own code, never to an older one. The previous zip stays for a
 * device that read the old manifest just before and is still downloading. A
 * failed cleanup only warns, since the update is out by then.
 *
 * @param {{
 *   dist: string,
 *   release: number,
 *   minBuild?: number,
 *   privateKey: string,
 *   projectUrl: string,
 *   serviceKey: string,
 *   bucket?: string,
 *   keepBundles?: number,
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
  keepBundles = DEFAULT_KEEP_BUNDLES,
}) {
  const bundlePath = `${BUNDLES_FOLDER}/${release}.zip`
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
  try {
    await pruneBundles({ projectUrl, serviceKey, bucket, release, keepBundles })
  } catch (error) {
    console.warn(`[live-update] old bundles stay: ${error.message}`)
  }
  return manifest
}

async function pruneBundles({
  projectUrl,
  serviceKey,
  bucket,
  release,
  keepBundles,
}) {
  const releases = (await listBundles({ projectUrl, serviceKey, bucket }))
    .filter((other) => other !== release)
    .sort((a, b) => b - a)
  const stale = releases.slice(Math.max(keepBundles - THE_NEW_ONE, NONE))
  if (!stale.length) return

  const response = await fetch(`${projectUrl}/storage/v1/object/${bucket}`, {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${serviceKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      prefixes: stale.map((stamp) => `${BUNDLES_FOLDER}/${stamp}.zip`),
    }),
  })
  if (!response.ok) throw new Error(await response.text())
}

async function listBundles({ projectUrl, serviceKey, bucket }) {
  const releases = []
  for (let offset = 0; ; offset += LIST_PAGE_SIZE) {
    const response = await fetch(
      `${projectUrl}/storage/v1/object/list/${bucket}`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${serviceKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          prefix: BUNDLES_FOLDER,
          limit: LIST_PAGE_SIZE,
          offset,
        }),
      },
    )
    if (!response.ok) throw new Error(await response.text())
    const page = await response.json()
    for (const { name } of page) {
      const stamp = Number(name.replace(/\.zip$/, ""))
      if (Number.isFinite(stamp) && name.endsWith(".zip")) releases.push(stamp)
    }
    if (page.length < LIST_PAGE_SIZE) return releases
  }
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
