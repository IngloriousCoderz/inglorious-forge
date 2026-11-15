/**
 * @vitest-environment jsdom
 */
import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createBackButton } from "./index.js"

describe("createBackButton", () => {
  let app
  let backButton
  let remove

  beforeEach(() => {
    remove = vi.fn()
    app = {
      exitApp: vi.fn(),
      addListener: vi.fn(async (event, listener) => {
        backButton = listener
        return { remove }
      }),
    }
    vi.spyOn(window.history, "back").mockImplementation(() => {})
    vi.stubGlobal("Capacitor", { isNativePlatform: () => true })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    window.history.replaceState(null, "", "/")
  })

  function storeWith(entity = {}) {
    return createStore({
      types: { BackButton: createBackButton({ plugin: app }) },
      entities: { backButton: { type: "BackButton", ...entity } },
    })
  }

  it("goes back from a page that is not a root", () => {
    window.history.replaceState(null, "", "/jobs/42")
    storeWith()

    backButton({ canGoBack: true })

    expect(app.addListener).toHaveBeenCalledWith(
      "backButton",
      expect.any(Function),
    )
    expect(window.history.back).toHaveBeenCalled()
    expect(app.exitApp).not.toHaveBeenCalled()
  })

  it("closes the app from a root path, history or not", () => {
    window.history.replaceState(null, "", "/profile")
    storeWith({ rootPaths: ["/jobs", "/profile"] })

    backButton({ canGoBack: true })

    expect(app.exitApp).toHaveBeenCalled()
    expect(window.history.back).not.toHaveBeenCalled()
  })

  it("closes the app when there is no history", () => {
    window.history.replaceState(null, "", "/jobs/42")
    storeWith()

    backButton({ canGoBack: false })

    expect(app.exitApp).toHaveBeenCalled()
  })

  it("roots at / by default", () => {
    const store = storeWith()

    backButton({ canGoBack: true })

    expect(store.getEntity("backButton").rootPaths).toStrictEqual(["/"])
    expect(app.exitApp).toHaveBeenCalled()
  })

  it("does nothing outside a native app", () => {
    vi.stubGlobal("Capacitor", undefined)

    storeWith()

    expect(app.addListener).not.toHaveBeenCalled()
  })

  it("stops listening when the entity goes", async () => {
    const store = storeWith()

    store.notify("remove", "backButton")
    await new Promise((resolve) => setTimeout(resolve))

    expect(remove).toHaveBeenCalled()
  })
})
