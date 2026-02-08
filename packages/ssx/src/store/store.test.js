import { existsSync } from "node:fs"
import path from "node:path"

import { describe, expect, it, vi } from "vitest"

import { generateStore } from "."

const ROOT_DIR = path.join(import.meta.dirname, "..", "__fixtures__")
const PAGES_DIR = path.join(ROOT_DIR, "src", "pages")

vi.mock("node:fs")

describe("generateStore", () => {
  it("should generate the proper types and entities from a static page", async () => {
    const page = {
      filePath: path.join(PAGES_DIR, "index.js"),
    }

    const store = await generateStore([page], { rootDir: ROOT_DIR })

    expect(store.getType("index").render).toBeDefined()
    expect(store.getState()).toMatchSnapshot()
  })

  it("should generate the proper types and entities from a page with an entity", async () => {
    const page = {
      filePath: path.join(PAGES_DIR, "about.js"),
    }

    const store = await generateStore([page], { rootDir: ROOT_DIR })

    expect(store.getType("about").render).toBeDefined()
    expect(store.getState()).toMatchSnapshot()
  })

  it("should generate the proper types and entities from a page that has metadata", async () => {
    const page = {
      filePath: path.join(PAGES_DIR, "blog.js"),
    }

    const store = await generateStore([page], { rootDir: ROOT_DIR })

    expect(store.getType("blog").render).toBeDefined()
    expect(store.getState()).toMatchSnapshot()
  })

  it("should handle missing entities.js gracefully", async () => {
    const page = {
      filePath: path.join(PAGES_DIR, "index.js"),
    }

    // Point to a directory that doesn't contain entities.js
    const store = await generateStore([page], {
      rootDir: path.join(ROOT_DIR, "pages"),
    })

    // Should initialize with empty entities (or at least not the ones from fixtures)
    expect(store.getState()).not.toHaveProperty("about")
  })

  it("should check for entities.js and entities.ts and load them if they exist", async () => {
    vi.mocked(existsSync).mockReturnValue(true)

    const loader = vi.fn(async (p) => {
      if (p.includes("index.js")) {
        return {
          index: { render: () => "" },
        }
      }

      if (p.includes("entities.js") || p.includes("entities.ts")) {
        return {
          entities: {},
        }
      }

      return {}
    })

    const page = { filePath: path.join(PAGES_DIR, "index.js") }

    await generateStore([page], { rootDir: ROOT_DIR }, loader)

    expect(loader).toHaveBeenCalledWith(page.filePath)
    expect(loader).toHaveBeenCalledWith(
      path.join(ROOT_DIR, "src", "store", "entities.js"),
    )
  })
})
