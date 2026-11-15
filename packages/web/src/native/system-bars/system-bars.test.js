/**
 * @vitest-environment jsdom
 */
import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createSystemBars, styleFor } from "./index.js"

describe("styleFor", () => {
  it("puts light content on a dark-only page", () => {
    expect(styleFor("dark")).toBe("DARK")
  })

  it("puts dark content on a light-only page", () => {
    expect(styleFor("light")).toBe("LIGHT")
  })

  it("follows the device when the page does", () => {
    expect(styleFor("light dark")).toBe("DEFAULT")
    expect(styleFor("normal")).toBe("DEFAULT")
    expect(styleFor("")).toBe("DEFAULT")
  })
})

describe("createSystemBars", () => {
  let systemBars
  let store

  beforeEach(() => {
    systemBars = { setStyle: vi.fn(async () => {}) }
    vi.stubGlobal("Capacitor", { isNativePlatform: () => true })
  })

  afterEach(() => {
    store?.notify("remove", "systemBars")
    store = null
    document.body.className = ""
    document.head.innerHTML = ""
    vi.unstubAllGlobals()
  })

  function start() {
    store = createStore({
      types: { SystemBars: createSystemBars({ plugin: systemBars }) },
      entities: { systemBars: { type: "SystemBars" } },
    })
    return store
  }

  it("does nothing outside a native app", () => {
    vi.stubGlobal("Capacitor", { isNativePlatform: () => false })

    start()

    expect(systemBars.setStyle).not.toHaveBeenCalled()
    expect(store.getEntity("systemBars").style).toBe(null)
  })

  it("matches the theme at once, and follows it when it changes", async () => {
    document.head.innerHTML = `<style>
      .light { color-scheme: light }
      .light.dark { color-scheme: dark }
    </style>`
    document.body.className = "light"

    start()
    expect(systemBars.setStyle).toHaveBeenLastCalledWith({ style: "LIGHT" })
    expect(store.getEntity("systemBars").style).toBe("LIGHT")

    document.body.classList.add("dark")
    await Promise.resolve()
    expect(systemBars.setStyle).toHaveBeenLastCalledWith({ style: "DARK" })
    expect(store.getEntity("systemBars").style).toBe("DARK")
  })

  it("sets the style again only when it changes", async () => {
    document.head.innerHTML = `<style>.light { color-scheme: light }</style>`
    document.body.className = "light"

    start()
    document.body.classList.add("other")
    await Promise.resolve()

    expect(systemBars.setStyle).toHaveBeenCalledTimes(1)
  })
})
