import { readFileSync } from "node:fs"

import { parseAst } from "rollup/parseAst"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { hmr } from "."

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(),
}))

function createContext(resolve = async () => null) {
  return {
    parse: (code) => parseAst(code),
    resolve,
  }
}

function resolveMap(map) {
  return async (source) => (map[source] ? { id: map[source] } : null)
}

const STORE_CODE = `
  import { createStore } from "@inglorious/store"
  import { types } from "./types"
  import { entities } from "./entities"

  export const store = createStore({ types, entities })
`

const TYPES_CODE = `
  import { Footer } from "./Footer"
  import { TodoList } from "./TodoList"

  export const types = { Footer, TodoList }
`

const MAIN_CODE = `
  import { mount } from "@inglorious/web"
  import { store } from "./store"
  import { render } from "./app"

  const element = document.getElementById("root")
  mount(store, render, element)
`

const RESOLVE_MAP = {
  "./store": "/project/src/store.js",
  "./types": "/project/src/types/index.js",
  "./entities": "/project/src/entities.js",
  "./Footer": "/project/src/types/Footer.js",
  "./TodoList": "/project/src/types/TodoList.js",
}

describe("@inglorious/vite-plugin-hmr", () => {
  beforeEach(() => {
    readFileSync.mockReset()
  })

  it("creates the Vite plugin entry point", () => {
    const plugin = hmr()

    expect(plugin.name).toBe("@inglorious/vite-plugin-hmr")
    expect(typeof plugin.transform).toBe("function")
    expect(plugin.handleHotUpdate).toBeUndefined()
  })

  it("skips transformation outside of dev/serve mode", async () => {
    const plugin = hmr()
    plugin.configResolved({ command: "build" })

    const context = createContext()
    const code = `
      import { mount } from "@inglorious/web"
      mount(store, render, element)
    `

    await expect(plugin.transform.call(context, code, "main.js")).resolves.toBe(
      null,
    )
  })

  it("skips non-JS/TS files", async () => {
    const plugin = hmr()
    plugin.configResolved({ command: "serve" })

    await expect(
      plugin.transform.call(createContext(), "body { color: red }", "app.css"),
    ).resolves.toBe(null)
  })

  it("skips files that don't reference @inglorious/web", async () => {
    const plugin = hmr()
    plugin.configResolved({ command: "serve" })

    const code = `console.log("nothing to see here")`

    await expect(
      plugin.transform.call(createContext(), code, "main.js"),
    ).resolves.toBe(null)
  })

  it("skips files without a top-level mount() call", async () => {
    const plugin = hmr()
    plugin.configResolved({ command: "serve" })

    const code = `
      import { mount } from "@inglorious/web"

      function start() {
        mount(store, render, element) // not top-level
      }
    `

    await expect(
      plugin.transform.call(createContext(), code, "main.js"),
    ).resolves.toBe(null)
  })

  it("registers the running store globally before mount()", async () => {
    const plugin = hmr()
    plugin.configResolved({ command: "serve" })

    readFileSync.mockImplementation(() => {
      throw new Error("ENOENT")
    })

    const context = createContext(
      resolveMap({ "./store": "/project/src/store.js" }),
    )

    const result = await plugin.transform.call(context, MAIN_CODE, "main.js")

    expect(result).not.toBeNull()
    expect(result.code).toContain(
      "if (import.meta.hot) globalThis.__INGLORIOUS_HMR_STORE__ = store",
    )
    expect(result.code).toContain("mount(store, render, element)")
    expect(result.code).not.toContain("inglorious:seed-changed")
  })

  it("does not register or evaluate the store twice for a non-identifier mount() argument", async () => {
    const plugin = hmr()
    plugin.configResolved({ command: "serve" })

    const context = createContext()
    const code = `
    import { createStore } from "@inglorious/store"
    import { mount } from "@inglorious/web"
    import { render } from "./app"

    const element = document.getElementById("root")
    mount(createStore({ types: {}, entities: {} }), render, element)
  `

    await expect(plugin.transform.call(context, code, "main.js")).resolves.toBe(
      null,
    )
  })

  it("parses TypeScript-only import syntax without changing the mount call", async () => {
    const plugin = hmr()
    plugin.configResolved({ command: "serve" })

    readFileSync.mockImplementation(() => {
      throw new Error("ENOENT")
    })

    const context = createContext(
      resolveMap({ "./store": "/project/src/store.ts" }),
    )
    const code = `
      import { mount } from "@inglorious/web"
      import { store, type Store } from "./store"

      const render = (api: Store) => null
      mount(store, render, document.getElementById("root")!)
    `

    const result = await plugin.transform.call(context, code, "main.ts")

    expect(result).not.toBeNull()
    expect(result.code).toContain(
      "if (import.meta.hot) globalThis.__INGLORIOUS_HMR_STORE__ = store",
    )
    expect(result.code).toContain(
      'mount(store, render, document.getElementById("root")!)',
    )
  })

  describe("per-type HMR boundary", () => {
    async function setupWithTypes() {
      const plugin = hmr()
      plugin.configResolved({ command: "serve" })

      readFileSync.mockImplementation((filePath) => {
        if (filePath === "/project/src/store.js") return STORE_CODE
        if (filePath === "/project/src/types/index.js") return TYPES_CODE
        throw new Error("ENOENT")
      })

      const context = createContext(resolveMap(RESOLVE_MAP))
      await plugin.transform.call(context, MAIN_CODE, "main.js")

      return { plugin, context }
    }

    it("gives a resolved type file its own self-accept boundary", async () => {
      const { plugin, context } = await setupWithTypes()

      const footerCode = `
        import { html } from "@inglorious/web"
        export const Footer = { render: () => html\`<footer></footer>\` }
      `

      const result = await plugin.transform.call(
        context,
        footerCode,
        "/project/src/types/Footer.js",
      )

      expect(result).not.toBeNull()
      expect(result.code).toContain("import.meta.hot.accept")
      expect(result.code).toContain('store.setType("Footer", nextType)')
      expect(result.code).toContain("globalThis.__INGLORIOUS_HMR_STORE__")
    })

    it("does not import the store module in the type boundary", async () => {
      const { plugin, context } = await setupWithTypes()

      const footerCode = `
        import { html } from "@inglorious/web"
        export const Footer = { render: () => html\`<footer></footer>\` }
      `

      const result = await plugin.transform.call(
        context,
        footerCode,
        "/project/src/types/Footer.js",
      )

      expect(result.code).not.toMatch(/from\s+["']\.\.?\/.*store/)
    })

    it("leaves files not resolved as type files untouched", async () => {
      const plugin = hmr()
      plugin.configResolved({ command: "serve" })

      readFileSync.mockImplementation((filePath) => {
        if (filePath === "/project/src/store.js") return STORE_CODE
        if (filePath === "/project/src/types/index.js") return TYPES_CODE
        throw new Error("ENOENT")
      })

      const context = createContext(resolveMap(RESOLVE_MAP))
      await plugin.transform.call(context, MAIN_CODE, "main.js")

      const code = `console.log("just a helper, not a type")`

      await expect(
        plugin.transform.call(context, code, "/project/src/helpers.js"),
      ).resolves.toBe(null)
    })

    it("resolves type files from an inline types object", async () => {
      const plugin = hmr()
      plugin.configResolved({ command: "serve" })

      readFileSync.mockImplementation((filePath) => {
        if (filePath === "/project/src/store.js") {
          return `
            import { createStore } from "@inglorious/store"
            import { Footer } from "../footer/footer"

            export const store = createStore({ types: { Footer } })
          `
        }
        throw new Error("ENOENT")
      })

      const context = createContext(
        resolveMap({
          "./store": "/project/src/store.js",
          "../footer/footer": "/project/src/footer/footer.js",
        }),
      )

      await plugin.transform.call(context, MAIN_CODE, "main.js")

      const result = await plugin.transform.call(
        context,
        `export const Footer = { render: () => null }`,
        "/project/src/footer/footer.js",
      )

      expect(result).not.toBeNull()
      expect(result.code).toContain('store.setType("Footer", nextType)')
    })

    it("falls back to the root mount registration when types can't be resolved statically", async () => {
      const plugin = hmr()
      plugin.configResolved({ command: "serve" })

      readFileSync.mockReturnValue(`
        import { createStore } from "@inglorious/store"

        export const store = createStore({ types: { Footer: { render: () => null } } })
      `)

      const context = createContext(
        resolveMap({ "./store": "/project/src/store.js" }),
      )

      const result = await plugin.transform.call(context, MAIN_CODE, "main.js")

      expect(result).not.toBeNull()
      expect(result.code).toContain(
        "if (import.meta.hot) globalThis.__INGLORIOUS_HMR_STORE__ = store",
      )
      expect(result.code).toContain("mount(store, render, element)")
    })
  })
})
