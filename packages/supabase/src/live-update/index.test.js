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
  const publish = (options) =>
    publishLiveUpdate({
      dist,
      release: 42,
      privateKey: keys.privateKey,
      projectUrl: PROJECT,
      serviceKey: "secret",
      ...options,
    })

  function stubStorage(bundles, { listPages } = {}) {
    const fetch = vi.fn(async (url, init) => {
      if (url.includes("/object/list/")) {
        const { offset } = JSON.parse(init.body)
        const page = listPages
          ? (listPages[offset] ?? [])
          : bundles.map((name) => ({ name }))
        return { ok: true, json: async () => page }
      }
      return { ok: true }
    })
    vi.stubGlobal("fetch", fetch)
    return fetch
  }

  function deleted(fetch) {
    const call = fetch.mock.calls.find(([, init]) => init.method === "DELETE")
    return call ? JSON.parse(call[1].body).prefixes : []
  }

  it("uploads the zip, then the manifest that points to it", async () => {
    const fetch = stubStorage(["42.zip"])

    const manifest = await publish()

    expect(fetch.mock.calls.map(([url]) => url).slice(0, 2)).toEqual([
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

  it("then deletes all but the new bundle and the one before", async () => {
    const fetch = stubStorage([
      "39.zip",
      "42.zip",
      "41.zip",
      "40.zip",
      ".emptyFolderPlaceholder",
    ])

    await publish()

    expect(deleted(fetch)).toEqual(["bundles/40.zip", "bundles/39.zip"])
    const [url] = fetch.mock.calls.find(([, init]) => init.method === "DELETE")
    expect(url).toBe(`${PROJECT}/storage/v1/object/live-updates`)
  })

  it("keeps as many bundles as asked", async () => {
    const fetch = stubStorage(["40.zip", "41.zip", "42.zip"])

    await publish({ keepBundles: 1 })

    expect(deleted(fetch)).toEqual(["bundles/41.zip", "bundles/40.zip"])
  })

  it("deletes nothing when there is nothing old", async () => {
    const fetch = stubStorage(["41.zip", "42.zip"])

    await publish()

    expect(deleted(fetch)).toEqual([])
  })

  it("reads every page of bundles", async () => {
    const full = Array.from({ length: 1000 }, (_, index) => ({
      name: `${index}.zip`,
    }))
    const fetch = stubStorage([], {
      listPages: { 0: full, 1000: [{ name: "1000.zip" }] },
    })

    await publish({ release: 1001 })

    expect(deleted(fetch)).toHaveLength(1000)
    expect(deleted(fetch)).not.toContain("bundles/1000.zip")
  })

  it("only warns when the cleanup fails: the update is out", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url) =>
        url.includes("/object/list/")
          ? { ok: false, text: async () => "Forbidden" }
          : { ok: true },
      ),
    )

    await expect(publish()).resolves.toMatchObject({ release: 42 })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Forbidden"))
    warn.mockRestore()
  })

  it("stops when an upload is refused", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, text: async () => "Unauthorized" })),
    )
    await expect(publish({ serviceKey: "wrong" })).rejects.toThrow(
      "Unauthorized",
    )
  })
})
