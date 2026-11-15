/**
 * @vitest-environment jsdom
 */
import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { Keyboard } from "./index.js"

const SCREEN = 800
const KEYBOARD = 300

describe("Keyboard", () => {
  let viewport
  let store

  beforeEach(() => {
    viewport = Object.assign(new EventTarget(), {
      height: SCREEN,
      offsetTop: 0,
    })
    vi.stubGlobal("visualViewport", viewport)
    vi.stubGlobal("innerHeight", SCREEN)
    vi.stubGlobal("requestAnimationFrame", (callback) => callback())
    document.body.innerHTML = '<input id="name" /><button id="go"></button>'
    store = createStore({
      types: { Keyboard },
      entities: { keyboard: { type: "Keyboard" } },
    })
  })

  afterEach(() => {
    store.notify("remove", "keyboard")
    document.body.innerHTML = ""
    vi.unstubAllGlobals()
  })

  const root = () => document.documentElement
  const height = () => root().style.getPropertyValue("--iw-keyboard-height")
  const entity = () => store.getEntity("keyboard")

  function shrinkPage(by) {
    vi.stubGlobal("innerHeight", SCREEN - by)
    viewport.height = SCREEN - by
    window.dispatchEvent(new Event("resize"))
  }

  function openKeyboard(id = "name") {
    document.getElementById(id).focus()
    viewport.height = SCREEN - KEYBOARD
    viewport.dispatchEvent(new Event("resize"))
  }

  it("starts closed and supported", () => {
    expect(entity()).toMatchObject({
      isSupported: true,
      isOpen: false,
      height: 0,
    })
  })

  it("holds the height the keyboard covers while an input has focus", () => {
    const input = document.getElementById("name")
    input.scrollIntoView = vi.fn()

    openKeyboard()

    expect(entity()).toMatchObject({ isOpen: true, height: KEYBOARD })
    expect(height()).toBe(`${KEYBOARD}px`)
    expect(root().classList.contains("iw-keyboard-open")).toBe(true)
    expect(input.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" })
  })

  it("subtracts how far the page scrolled to show the input", () => {
    document.getElementById("name").focus()
    viewport.height = SCREEN - KEYBOARD
    viewport.offsetTop = 100
    viewport.dispatchEvent(new Event("scroll"))

    expect(entity().height).toBe(200)
  })

  it("closes when the keyboard goes, not when the input loses focus", () => {
    openKeyboard()

    document.getElementById("go").focus()
    expect(entity().isOpen).toBe(true)

    viewport.height = SCREEN
    viewport.dispatchEvent(new Event("resize"))
    expect(entity()).toMatchObject({ isOpen: false, height: 0 })
    expect(root().classList.contains("iw-keyboard-open")).toBe(false)
  })

  it("ignores a smaller viewport when nothing takes typing", () => {
    openKeyboard("go")

    expect(entity().isOpen).toBe(false)
  })

  it("ignores the browser's toolbars", () => {
    document.getElementById("name").focus()
    viewport.height = SCREEN - 60
    viewport.dispatchEvent(new Event("resize"))

    expect(entity().isOpen).toBe(false)
  })

  it("knows the keyboard is up where the page shrinks for it", () => {
    document.getElementById("name").focus()
    shrinkPage(KEYBOARD)

    expect(entity()).toMatchObject({ isOpen: true, height: 0 })

    shrinkPage(0)
    expect(entity().isOpen).toBe(false)
  })

  it("starts over when the phone turns", () => {
    vi.stubGlobal("innerWidth", SCREEN)
    vi.stubGlobal("innerHeight", SCREEN - KEYBOARD)
    viewport.height = SCREEN - KEYBOARD
    document.getElementById("name").focus()
    window.dispatchEvent(new Event("resize"))

    expect(entity().isOpen).toBe(false)
  })

  it("cleans up when the entity goes", () => {
    openKeyboard()

    store.notify("remove", "keyboard")

    expect(height()).toBe("")
    expect(root().classList.contains("iw-keyboard-open")).toBe(false)
  })

  it("is unsupported without a visual viewport", () => {
    vi.stubGlobal("visualViewport", undefined)
    const other = createStore({
      types: { Keyboard },
      entities: { keyboard: { type: "Keyboard" } },
    })

    expect(other.getEntity("keyboard").isSupported).toBe(false)
  })
})
