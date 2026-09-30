import fs from "node:fs/promises"

import { afterEach, describe, expect, it, vi } from "vitest"

import {
  collectPageDependencies,
  createManifest,
  createPageHasher,
  determineRebuildPages,
  hashFile,
  hashRuntime,
  hashSharedSources,
  loadManifest,
  saveManifest,
} from "./manifest"

const mockReadFile = vi.hoisted(() => vi.fn())
const mockWriteFile = vi.hoisted(() => vi.fn())

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    readFile: mockReadFile,
    writeFile: mockWriteFile,
    default: {
      ...actual.default,
      readFile: mockReadFile,
      writeFile: mockWriteFile,
    },
  }
})

/**
 * Builds a stub Vite server whose module graph maps each id to the ids it
 * imports, mirroring the shape of `vite.moduleGraph`.
 */
function fakeVite(graph) {
  const nodes = new Map()
  const nodeFor = (id) => {
    if (!nodes.has(id)) {
      nodes.set(id, { id, importedModules: new Set() })
    }
    return nodes.get(id)
  }

  for (const [id, imported] of Object.entries(graph)) {
    for (const childId of imported) {
      nodeFor(id).importedModules.add(nodeFor(childId))
    }
  }

  return { moduleGraph: { getModuleById: (id) => nodes.get(id) } }
}

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
        shared: null,
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

  describe("hashSharedSources", () => {
    it("should hash store and config files under src", async () => {
      fs.readFile.mockResolvedValue("content")

      await hashSharedSources("root")

      const readPaths = fs.readFile.mock.calls.map(([filePath]) => filePath)

      expect(readPaths).toContain("root/src/store/entities.js")
      expect(readPaths).toContain("root/src/store/types.js")
      expect(readPaths).toContain("root/src/site.config.js")
    })

    it("should return a stable hash regardless of extension order", async () => {
      fs.readFile.mockImplementation(async (filePath) => {
        if (filePath === "root/src/store/entities.ts") return "entities"
        return null
      })

      const first = await hashSharedSources("root")
      const second = await hashSharedSources("root")

      expect(typeof first).toBe("string")
      expect(first).toBe(second)
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
    it("should rebuild all if shared sources hash changed", async () => {
      const pages = [{ path: "/" }]
      const manifest = { shared: "old" }
      const result = await determineRebuildPages(pages, manifest, "new", "rt")

      expect(result.pagesToBuild).toEqual(pages)
      expect(result.pagesToSkip).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Shared sources changed"),
      )
    })

    it("should split pages based on hash changes", async () => {
      const pages = [
        { path: "/changed", filePath: "changed.js" },
        { path: "/same", filePath: "same.js" },
      ]
      const manifest = {
        shared: "hash",
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

    it("should rebuild a page when a shared partial it imports changes", async () => {
      const page = { path: "/", filePath: "/site/src/pages/index.js" }
      const pages = [page]
      const vite = fakeVite({
        "/site/src/pages/index.js": ["/site/src/components/nav.js"],
      })
      const read = (edited) =>
        fs.readFile.mockImplementation(
          async (filePath) =>
            `content of ${
              edited && filePath === "/site/src/components/nav.js"
                ? "/site/src/components/nav.js EDITED"
                : filePath
            }`,
        )

      read(false)
      const before = await createPageHasher(vite)(page)

      read(true)
      const after = await createPageHasher(vite)(page)

      expect(after).not.toBe(before)

      const result = await determineRebuildPages(
        pages,
        {
          shared: "hash",
          runtime: "rt",
          pages: { "/": { hash: before } },
        },
        "hash",
        "rt",
        createPageHasher(vite),
      )

      expect(result.pagesToBuild).toHaveLength(1)
      expect(result.pagesToSkip).toHaveLength(0)
    })

    it("should rebuild all if runtime hash changed", async () => {
      const pages = [{ path: "/" }]
      const manifest = { shared: "hash", runtime: "old-rt" }
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

  describe("collectPageDependencies", () => {
    it("should follow the module graph transitively", () => {
      const vite = fakeVite({
        "/site/src/pages/index.js": [
          "/site/src/components/nav.js",
          "/site/src/store/theme.js",
        ],
        "/site/src/components/nav.js": ["/site/src/components/logo.js"],
      })

      expect(collectPageDependencies("/site/src/pages/index.js", vite)).toEqual(
        [
          "/site/src/components/logo.js",
          "/site/src/components/nav.js",
          "/site/src/pages/index.js",
          "/site/src/store/theme.js",
        ],
      )
    })

    it("should exclude node_modules and virtual modules", () => {
      const vite = fakeVite({
        "/site/src/pages/index.js": [
          "/site/node_modules/dep/index.js",
          "\0virtual:module",
          "/site/src/components/nav.js",
        ],
      })

      expect(collectPageDependencies("/site/src/pages/index.js", vite)).toEqual(
        ["/site/src/components/nav.js", "/site/src/pages/index.js"],
      )
    })

    it("should track linked workspace packages but ignore installed ones", () => {
      const vite = fakeVite({
        "/site/src/pages/index.js": [
          "/repo/packages/web/src/index.js",
          "/site/node_modules/@inglorious/web/dist/index.js",
        ],
      })

      expect(collectPageDependencies("/site/src/pages/index.js", vite)).toEqual(
        ["/repo/packages/web/src/index.js", "/site/src/pages/index.js"],
      )
    })

    it("should handle import cycles", () => {
      const vite = fakeVite({
        "/site/a.js": ["/site/b.js"],
        "/site/b.js": ["/site/a.js"],
      })

      expect(collectPageDependencies("/site/a.js", vite)).toEqual([
        "/site/a.js",
        "/site/b.js",
      ])
    })

    it("should fall back to the page module when the graph has no entry", () => {
      expect(
        collectPageDependencies("/site/src/pages/index.js", fakeVite({})),
      ).toEqual(["/site/src/pages/index.js"])
      expect(collectPageDependencies("/site/src/pages/index.js")).toEqual([
        "/site/src/pages/index.js",
      ])
    })
  })

  describe("createPageHasher", () => {
    it("should read each dependency at most once across pages", async () => {
      const vite = fakeVite({
        "/site/a.js": ["/site/shared.js"],
        "/site/b.js": ["/site/shared.js"],
      })
      fs.readFile.mockResolvedValue("content")

      const getPageHash = createPageHasher(vite)
      await getPageHash({ filePath: "/site/a.js" })
      await getPageHash({ filePath: "/site/b.js" })

      const reads = fs.readFile.mock.calls
        .map(([filePath]) => filePath)
        .filter((filePath) => filePath === "/site/shared.js")

      expect(reads).toHaveLength(1)
    })

    it("should be order-independent", async () => {
      const forward = fakeVite({ "/site/a.js": ["/site/x.js", "/site/y.js"] })
      const reverse = fakeVite({ "/site/a.js": ["/site/y.js", "/site/x.js"] })
      fs.readFile.mockImplementation(async (filePath) => `body:${filePath}`)

      const first = await createPageHasher(forward)({ filePath: "/site/a.js" })
      const second = await createPageHasher(reverse)({ filePath: "/site/a.js" })

      expect(first).toBe(second)
    })
  })

  describe("createManifest", () => {
    it("should create a new manifest with page hashes", async () => {
      const renderedPages = [
        { path: "/", filePath: "index.js" },
        { path: "/about", filePath: "about.js" },
      ]
      const sharedHash = "shared-hash"
      const runtimeHash = "runtime-hash"

      fs.readFile.mockImplementation(async (path) => {
        if (path === "index.js") return "index content"
        if (path === "about.js") return "about content"
        return ""
      })

      const manifest = await createManifest(
        renderedPages,
        sharedHash,
        runtimeHash,
      )

      expect(manifest.shared).toBe(sharedHash)
      expect(manifest.runtime).toBe(runtimeHash)
      expect(manifest.buildTime).toBeDefined()
      expect(manifest.pages["/"].filePath).toBe("index.js")
      expect(manifest.pages["/about"].filePath).toBe("about.js")
    })

    it("should record the dependency-aware hash produced by the page hasher", async () => {
      const vite = fakeVite({ "index.js": ["nav.js"] })
      fs.readFile.mockImplementation(async (filePath) => `body:${filePath}`)

      const getPageHash = createPageHasher(vite)
      const manifest = await createManifest(
        [{ path: "/", filePath: "index.js" }],
        "shared",
        "rt",
        getPageHash,
      )

      expect(manifest.pages["/"].hash).toBe(
        await getPageHash({
          filePath: "index.js",
        }),
      )
    })
  })
})
