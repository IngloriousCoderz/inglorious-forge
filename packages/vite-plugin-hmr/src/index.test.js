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

describe("@inglorious/vite-plugin-hmr", () => {
  beforeEach(() => {
    readFileSync.mockReset()
  })

  it("creates the Vite plugin entry point", () => {
    const plugin = hmr()

    expect(plugin.name).toBe("@inglorious/vite-plugin-hmr")
    expect(typeof plugin.transform).toBe("function")
    expect(typeof plugin.handleHotUpdate).toBe("function")
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

  it("injects HMR bootstrap around a top-level mount() call", async () => {
    const plugin = hmr()
    plugin.configResolved({ command: "serve" })

    readFileSync.mockImplementation(() => {
      throw new Error("ENOENT") // store.js not reachable in this test
    })

    const context = createContext(
      resolveMap({ "./store": "/project/src/store.js" }),
    )

    const code = `
      import { mount } from "@inglorious/web"
      import { store } from "./store"
      import { render } from "./app"

      const element = document.getElementById("root")
      mount(store, render, element)
    `

    const result = await plugin.transform.call(context, code, "main.js")

    expect(result.code).toContain("const __hmrStore = store")
    expect(result.code).toContain("const __hmrRender = render")
    expect(result.code).toContain("const __hmrElement = element")
    expect(result.code).toContain(
      "mount(__hmrStore, __hmrRender, __hmrElement,",
    )
    expect(result.code).toContain("import.meta.hot.dispose")
    expect(result.code).toContain("import.meta.hot.accept()")
  })

  it("resolves the dedicated entities file when createStore imports it", async () => {
    const plugin = hmr()
    plugin.configResolved({ command: "serve" })

    readFileSync.mockReturnValue(`
      import { createStore } from "@inglorious/store"
      import { types } from "./types"
      import { entities } from "./entities"

      export const store = createStore({ types, entities })
    `)

    const context = createContext(
      resolveMap({
        "./store": "/project/src/store.js",
        "./entities": "/project/src/entities.js",
      }),
    )

    const code = `
      import { mount } from "@inglorious/web"
      import { store } from "./store"
      import { render } from "./app"

      const element = document.getElementById("root")
      mount(store, render, element)
    `

    await plugin.transform.call(context, code, "main.js")

    const send = vi.fn()
    plugin.handleHotUpdate({
      file: "/project/src/entities.js",
      server: { ws: { send } },
    })

    expect(send).toHaveBeenCalledWith({
      type: "custom",
      event: "inglorious:seed-changed",
    })
  })

  it("falls back to watching the whole store module when entities is inline", async () => {
    const plugin = hmr()
    plugin.configResolved({ command: "serve" })

    readFileSync.mockReturnValue(`
      import { createStore } from "@inglorious/store"

      export const store = createStore({ entities: { tasks: [] } })
    `)

    const context = createContext(
      resolveMap({ "./store": "/project/src/store.js" }),
    )

    const code = `
      import { mount } from "@inglorious/web"
      import { store } from "./store"
      import { render } from "./app"

      const element = document.getElementById("root")
      mount(store, render, element)
    `

    await plugin.transform.call(context, code, "main.js")

    const send = vi.fn()
    plugin.handleHotUpdate({
      file: "/project/src/store.js",
      server: { ws: { send } },
    })

    expect(send).toHaveBeenCalledWith({
      type: "custom",
      event: "inglorious:seed-changed",
    })
  })

  it("does not notify for files unrelated to the resolved seed", async () => {
    const plugin = hmr()
    plugin.configResolved({ command: "serve" })

    readFileSync.mockImplementation(() => {
      throw new Error("ENOENT")
    })

    const context = createContext(
      resolveMap({ "./store": "/project/src/store.js" }),
    )

    const code = `
      import { mount } from "@inglorious/web"
      import { store } from "./store"
      import { render } from "./app"

      const element = document.getElementById("root")
      mount(store, render, element)
    `

    await plugin.transform.call(context, code, "main.js")

    const send = vi.fn()
    plugin.handleHotUpdate({
      file: "/project/src/some-unrelated-component.js",
      server: { ws: { send } },
    })

    expect(send).not.toHaveBeenCalled()
  })

  it("skips seed tracking when mount()'s store argument isn't a plain identifier", async () => {
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

    const result = await plugin.transform.call(context, code, "main.js")

    expect(result.code).not.toContain("inglorious:seed-changed")
    expect(result.code).toContain("data.skipRestore = false")
  })
})
