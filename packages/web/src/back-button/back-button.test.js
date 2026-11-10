/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { watchBackButton } from "./index.js"

describe("watchBackButton", () => {
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

  it("goes back from a page that is not a root", () => {
    window.history.replaceState(null, "", "/jobs/42")
    watchBackButton(app)

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
    watchBackButton(app, { rootPaths: ["/jobs", "/profile"] })

    backButton({ canGoBack: true })

    expect(app.exitApp).toHaveBeenCalled()
    expect(window.history.back).not.toHaveBeenCalled()
  })

  it("closes the app when there is no history", () => {
    window.history.replaceState(null, "", "/jobs/42")
    watchBackButton(app)

    backButton({ canGoBack: false })

    expect(app.exitApp).toHaveBeenCalled()
  })

  it("roots at / by default", () => {
    watchBackButton(app)

    backButton({ canGoBack: true })

    expect(app.exitApp).toHaveBeenCalled()
  })

  it("does nothing outside a native app", () => {
    vi.stubGlobal("Capacitor", undefined)

    watchBackButton(app)

    expect(app.addListener).not.toHaveBeenCalled()
  })

  it("stops listening", async () => {
    const stop = watchBackButton(app)

    await stop()

    expect(remove).toHaveBeenCalled()
  })
})
