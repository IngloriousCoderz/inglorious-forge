import { Buffer } from "node:buffer"
import { createHash, verify } from "node:crypto"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

import { unzipSync } from "fflate"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  generateLiveUpdateKeys,
  liveUpdateManifestUrl,
  packLiveUpdate,
  publishLiveUpdate,
} from "./index.js"

const PROJECT = "https://ref.supabase.co"
const keys = generateLiveUpdateKeys()

let dist

beforeEach(() => {
  dist = mkdtempSync(path.join(tmpdir(), "live-update-"))
  writeFileSync(path.join(dist, "index.html"), "<!doctype html>")
  mkdirSync(path.join(dist, "assets"))
  writeFileSync(path.join(dist, "assets", "app.js"), "console.log(1)")
})

afterEach(() => {
  rmSync(dist, { recursive: true, force: true })
  vi.unstubAllGlobals()
})

describe("packLiveUpdate", () => {
  it("zips the app with index.html at the root, and signs the zip", () => {
    const { zip, manifest } = packLiveUpdate({
      dist,
      release: 42,
      minBuild: 3,
      privateKey: keys.privateKey,
      url: "https://cdn.test/42.zip",
    })

    expect(Object.keys(unzipSync(zip)).sort()).toEqual([
      "assets/app.js",
      "index.html",
    ])
    expect(manifest).toMatchObject({
      release: 42,
      minBuild: 3,
      url: "https://cdn.test/42.zip",
      checksum: createHash("sha256").update(zip).digest("hex"),
    })
    expect(
      verify(
        "sha256",
        zip,
        keys.publicKey,
        Buffer.from(manifest.signature, "base64"),
      ),
    ).toBe(true)
  })
})

describe("publishLiveUpdate", () => {
  it("uploads the zip, then the manifest that points to it", async () => {
    const fetch = vi.fn(async () => ({ ok: true }))
    vi.stubGlobal("fetch", fetch)

    const manifest = await publishLiveUpdate({
      dist,
      release: 42,
      privateKey: keys.privateKey,
      projectUrl: PROJECT,
      serviceKey: "secret",
    })

    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      `${PROJECT}/storage/v1/object/live-updates/bundles/42.zip`,
      `${PROJECT}/storage/v1/object/live-updates/manifest.json`,
    ])
    expect(fetch.mock.calls[0][1].headers.authorization).toBe("Bearer secret")
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual(manifest)
    expect(manifest.url).toBe(
      `${PROJECT}/storage/v1/object/public/live-updates/bundles/42.zip`,
    )
    expect(liveUpdateManifestUrl(PROJECT)).toBe(
      `${PROJECT}/storage/v1/object/public/live-updates/manifest.json`,
    )
  })

  it("stops when an upload is refused", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, text: async () => "Unauthorized" })),
    )
    await expect(
      publishLiveUpdate({
        dist,
        release: 42,
        privateKey: keys.privateKey,
        projectUrl: PROJECT,
        serviceKey: "wrong",
      }),
    ).rejects.toThrow("Unauthorized")
  })
})
