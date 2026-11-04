import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { CaptchaError, createCaptcha, isCaptchaError } from "./index.js"

const SITE_KEY = "site-key"
const LATER_MS = 280000

let widgets

function fakeTurnstile(outcome = "token") {
  let count = 0
  widgets = []
  return {
    render: vi.fn((container, options) => {
      count += 1
      const id = `widget-${count}`
      widgets.push({ id, container, options })
      queueMicrotask(() => {
        if (outcome === "token") options.callback(`token-${count}`)
        else options["error-callback"](outcome)
      })
      return id
    }),
    remove: vi.fn(),
  }
}

beforeEach(() => {
  vi.stubGlobal("document", {
    getElementById: (id) => (id === "captcha" ? { id } : null),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe("createCaptcha", () => {
  it("does nothing without a site key", async () => {
    const turnstile = fakeTurnstile()
    vi.stubGlobal("turnstile", turnstile)
    const captcha = createCaptcha({ element: "captcha" })

    captcha.prepare("login")
    expect(await captcha.token("login")).toBeUndefined()
    expect(turnstile.render).not.toHaveBeenCalled()
  })

  it("renders an invisible widget for each token and removes it", async () => {
    const turnstile = fakeTurnstile()
    vi.stubGlobal("turnstile", turnstile)
    const captcha = createCaptcha({
      siteKey: SITE_KEY,
      element: "captcha",
      language: () => "it",
    })

    expect(await captcha.token("signup")).toBe("token-1")
    expect(widgets[0].container).toEqual({ id: "captcha" })
    expect(widgets[0].options).toMatchObject({
      sitekey: SITE_KEY,
      action: "signup",
      appearance: "interaction-only",
      language: "it",
    })
    expect(turnstile.remove).toHaveBeenCalledWith("widget-1")
  })

  it("uses a prepared token once, for its own action", async () => {
    vi.stubGlobal("turnstile", fakeTurnstile())
    const captcha = createCaptcha({ siteKey: SITE_KEY, element: "captcha" })

    captcha.prepare("login")
    expect(await captcha.token("login")).toBe("token-1")
    expect(await captcha.token("login")).toBe("token-2")

    captcha.prepare("login")
    expect(await captcha.token("signup")).toBe("token-4")
  })

  it("drops a prepared token about to expire", async () => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.stubGlobal("turnstile", fakeTurnstile())
    const captcha = createCaptcha({ siteKey: SITE_KEY, element: "captcha" })

    captcha.prepare("login")
    vi.setSystemTime(Date.now() + LATER_MS)
    expect(await captcha.token("login")).toBe("token-2")
  })

  it("throws a CaptchaError when the widget fails or has nowhere to go", async () => {
    const turnstile = fakeTurnstile("110200")
    vi.stubGlobal("turnstile", turnstile)
    const captcha = createCaptcha({ siteKey: SITE_KEY, element: "captcha" })

    const error = await captcha.token("login").catch((err) => err)
    expect(error).toBeInstanceOf(CaptchaError)
    expect(error.code).toBe("110200")
    expect(turnstile.remove).toHaveBeenCalledWith("widget-1")

    const lost = createCaptcha({ siteKey: SITE_KEY, element: () => null })
    await expect(lost.token("login")).rejects.toMatchObject({
      code: "missing-element",
    })
  })

  it("falls back to a new token when the prepared one failed", async () => {
    const turnstile = fakeTurnstile("300010")
    vi.stubGlobal("turnstile", turnstile)
    const captcha = createCaptcha({ siteKey: SITE_KEY, element: "captcha" })

    captcha.prepare("login")
    await Promise.resolve()
    turnstile.render.mockImplementationOnce((container, options) => {
      queueMicrotask(() => options.callback("fresh"))
      return "widget-fresh"
    })
    expect(await captcha.token("login")).toBe("fresh")
  })
})

describe("isCaptchaError", () => {
  it("recognizes the widget's failures and Supabase Auth's refusal", () => {
    expect(isCaptchaError(new CaptchaError("timeout"))).toBe(true)
    expect(
      isCaptchaError({
        code: "captcha_failed",
        message: "captcha protection: request disallowed",
      }),
    ).toBe(true)
    expect(isCaptchaError({ code: "invalid_credentials" })).toBe(false)
    expect(isCaptchaError(null)).toBe(false)
  })
})
