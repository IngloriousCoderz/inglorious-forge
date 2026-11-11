/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { watchKeyboard } from "./index.js"

const SCREEN = 800
const KEYBOARD = 300

describe("watchKeyboard", () => {
  let viewport
  let stop

  beforeEach(() => {
    viewport = Object.assign(new EventTarget(), {
      height: SCREEN,
      offsetTop: 0,
    })
    vi.stubGlobal("visualViewport", viewport)
    vi.stubGlobal("innerHeight", SCREEN)
    vi.stubGlobal("requestAnimationFrame", (callback) => callback())
    document.body.innerHTML = '<input id="name" /><button id="go"></button>'
  })

  afterEach(() => {
    stop?.()
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
  })

  const root = () => document.documentElement
  const height = () => root().style.getPropertyValue("--iw-keyboard-height")

  function openKeyboard(id = "name") {
    document.getElementById(id).focus()
    viewport.height = SCREEN - KEYBOARD
    viewport.dispatchEvent(new Event("resize"))
  }

  it("publishes the height the keyboard covers while an input has focus", () => {
    stop = watchKeyboard()
    const input = document.getElementById("name")
    input.scrollIntoView = vi.fn()

    openKeyboard()

    expect(height()).toBe(`${KEYBOARD}px`)
    expect(root().classList.contains("iw-keyboard-open")).toBe(true)
    expect(input.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" })
  })

  it("subtracts how far the page scrolled to show the input", () => {
    stop = watchKeyboard()
    document.getElementById("name").focus()
    viewport.height = SCREEN - KEYBOARD
    viewport.offsetTop = 100
    viewport.dispatchEvent(new Event("scroll"))

    expect(height()).toBe("200px")
  })

  it("closes when the keyboard goes, not when the input loses focus", () => {
    stop = watchKeyboard()
    openKeyboard()

    document.getElementById("go").focus()
    expect(height()).toBe(`${KEYBOARD}px`)

    viewport.height = SCREEN
    viewport.dispatchEvent(new Event("resize"))
    expect(height()).toBe("0px")
    expect(root().classList.contains("iw-keyboard-open")).toBe(false)
  })

  it("ignores a smaller viewport when nothing takes typing", () => {
    stop = watchKeyboard()
    openKeyboard("go")

    expect(height()).toBe("")
  })

  it("ignores the browser's toolbars", () => {
    stop = watchKeyboard()
    document.getElementById("name").focus()
    viewport.height = SCREEN - 60
    viewport.dispatchEvent(new Event("resize"))

    expect(root().classList.contains("iw-keyboard-open")).toBe(false)
  })

  it("cleans up when stopped", () => {
    stop = watchKeyboard()
    openKeyboard()

    stop()
    stop = null

    expect(height()).toBe("")
    expect(root().classList.contains("iw-keyboard-open")).toBe(false)
  })
})
