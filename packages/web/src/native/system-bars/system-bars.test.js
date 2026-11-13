/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { styleFor, watchSystemBars } from "./index.js"

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

describe("watchSystemBars", () => {
  let systemBars
  let stop

  beforeEach(() => {
    systemBars = { setStyle: vi.fn(async () => {}) }
    vi.stubGlobal("Capacitor", { isNativePlatform: () => true })
  })

  afterEach(() => {
    stop?.()
    document.body.className = ""
    document.head.innerHTML = ""
    vi.unstubAllGlobals()
  })

  it("does nothing outside a native app", () => {
    vi.stubGlobal("Capacitor", { isNativePlatform: () => false })

    stop = watchSystemBars(systemBars)

    expect(systemBars.setStyle).not.toHaveBeenCalled()
  })

  it("matches the theme at once, and follows it when it changes", async () => {
    document.head.innerHTML = `<style>
      .light { color-scheme: light }
      .light.dark { color-scheme: dark }
    </style>`
    document.body.className = "light"

    stop = watchSystemBars(systemBars)
    expect(systemBars.setStyle).toHaveBeenLastCalledWith({ style: "LIGHT" })

    document.body.classList.add("dark")
    await Promise.resolve()
    expect(systemBars.setStyle).toHaveBeenLastCalledWith({ style: "DARK" })
  })

  it("sets the style again only when it changes", async () => {
    document.head.innerHTML = `<style>.light { color-scheme: light }</style>`
    document.body.className = "light"

    stop = watchSystemBars(systemBars)
    document.body.classList.add("other")
    await Promise.resolve()

    expect(systemBars.setStyle).toHaveBeenCalledTimes(1)
  })
})
