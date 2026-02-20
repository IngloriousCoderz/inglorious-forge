import fs from "node:fs/promises"

import { afterEach, describe, expect, it, vi } from "vitest"

import {
  createManifest,
  determineRebuildPages,
  hashEntities,
  hashFile,
  hashRuntime,
  loadManifest,
  saveManifest,
} from "./manifest"

vi.mock("node:fs/promises")

describe("manifest", () => {
  const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe("loadManifest", () => {
    it("should load and parse manifest if exists", async () => {
      const mockManifest = { pages: {}, entities: "abc" }
      fs.readFile.mockResolvedValue(JSON.stringify(mockManifest))

      const result = await loadManifest("dist")
      expect(result).toEqual(mockManifest)
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining(".ssx-manifest.json"),
        "utf-8",
      )
    })

    it("should return default manifest if file missing", async () => {
      fs.readFile.mockRejectedValue(new Error("ENOENT"))

      const result = await loadManifest("dist")
      expect(result).toEqual({
        pages: {},
        entities: null,
        runtime: null,
        buildTime: null,
      })
    })
  })

  describe("saveManifest", () => {
    it("should write manifest to file", async () => {
      const manifest = { pages: {} }
      await saveManifest("dist", manifest)

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining(".ssx-manifest.json"),
        JSON.stringify(manifest, null, 2),
        "utf-8",
      )
    })
  })

  describe("hashFile", () => {
    it("should return md5 hash of file content", async () => {
      fs.readFile.mockResolvedValue("content")
      // md5("content") = 9a0364b9e99bb480dd25e1f0284c8555
      const hash = await hashFile("file.txt")
      expect(hash).toBe("9a0364b9e99bb480dd25e1f0284c8555")
    })

    it("should return null if file read fails", async () => {
      fs.readFile.mockRejectedValue(new Error("ENOENT"))
      const hash = await hashFile("file.txt")
      expect(hash).toBeNull()
    })
  })

  describe("hashEntities", () => {
    it("should hash entities.js in root dir", async () => {
      fs.readFile.mockResolvedValue("entities")
      await hashEntities("src")
      expect(fs.readFile).toHaveBeenCalledWith(
        expect.stringContaining("entities.js"),
        "utf-8",
      )
    })
  })

  describe("hashRuntime", () => {
    it("should hash SSX runtime files", async () => {
      fs.readFile.mockResolvedValue("runtime")
      const hash = await hashRuntime()
      expect(typeof hash).toBe("string")
      expect(hash.length).toBe(32)
    })
  })

  describe("determineRebuildPages", () => {
    it("should rebuild all if entities hash changed", async () => {
      const pages = [{ path: "/" }]
      const manifest = { entities: "old" }
      const result = await determineRebuildPages(pages, manifest, "new", "rt")

      expect(result.pagesToBuild).toEqual(pages)
      expect(result.pagesToSkip).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Entities changed"),
      )
    })

    it("should split pages based on hash changes", async () => {
      const pages = [
        { path: "/changed", filePath: "changed.js" },
        { path: "/same", filePath: "same.js" },
      ]
      const manifest = {
        entities: "hash",
        pages: {
          "/changed": { hash: "old-hash" },
          "/same": { hash: "9a0364b9e99bb480dd25e1f0284c8555" }, // md5("content")
        },
      }

      // Mock hashFile behavior via fs.readFile
      fs.readFile.mockImplementation(async (path) => {
        if (path === "changed.js") return "new content"
        if (path === "same.js") return "content"
        return ""
      })

      const result = await determineRebuildPages(
        pages,
        { ...manifest, runtime: "same-rt" },
        "hash",
        "same-rt",
      )

      expect(result.pagesToBuild).toHaveLength(1)
      expect(result.pagesToBuild[0].path).toBe("/changed")
      expect(result.pagesToSkip).toHaveLength(1)
      expect(result.pagesToSkip[0].path).toBe("/same")
    })

    it("should rebuild all if runtime hash changed", async () => {
      const pages = [{ path: "/" }]
      const manifest = { entities: "hash", runtime: "old-rt" }
      const result = await determineRebuildPages(
        pages,
        manifest,
        "hash",
        "new-rt",
      )

      expect(result.pagesToBuild).toEqual(pages)
      expect(result.pagesToSkip).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("runtime changed"),
      )
    })
  })

  describe("createManifest", () => {
    it("should create a new manifest with page hashes", async () => {
      const renderedPages = [
        { path: "/", filePath: "index.js" },
        { path: "/about", filePath: "about.js" },
      ]
      const entitiesHash = "entities-hash"
      const runtimeHash = "runtime-hash"

      fs.readFile.mockImplementation(async (path) => {
        if (path === "index.js") return "index content"
        if (path === "about.js") return "about content"
        return ""
      })

      const manifest = await createManifest(
        renderedPages,
        entitiesHash,
        runtimeHash,
      )

      expect(manifest.entities).toBe(entitiesHash)
      expect(manifest.runtime).toBe(runtimeHash)
      expect(manifest.buildTime).toBeDefined()
      expect(manifest.pages["/"]).toEqual({
        hash: "176b689259e8d68ef0aa869fd3b3be45",
        filePath: "index.js",
      })
      expect(manifest.pages["/about"]).toEqual({
        hash: "f43ab6cf4975e90e757c05cc3c619a85",
        filePath: "about.js",
      })
    })
  })
})
