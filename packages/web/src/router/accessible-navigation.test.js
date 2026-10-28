/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createAccessibleNavigation } from "./accessible-navigation"

describe("createAccessibleNavigation", () => {
  // Navigates the way the router does: the history entry first, then the render.
  const navigate = (afterRender, path, state = null) => {
    window.history.pushState(state, "", path)
    afterRender()
  }

  const renderRoot = (html) => {
    document.getElementById("root").innerHTML = html
  }

  // The announcement lands a moment after the render.
  const getAnnouncement = () => {
    vi.runAllTimers()
    return document.getElementById("iw-route-announcer").textContent
  }

  beforeEach(() => {
    vi.useFakeTimers()
    window.history.replaceState(null, "", "/")
    document.title = "Home"
    document.body.innerHTML = `<div id="root"><a href="/about">About</a></div>`
  })

  afterEach(() => {
    vi.useRealTimers()
    document.getElementById("iw-route-announcer")?.remove()
  })

  it("should add a live region up front", () => {
    createAccessibleNavigation()

    const announcer = document.getElementById("iw-route-announcer")
    expect(announcer.getAttribute("aria-live")).toBe("assertive")
    expect(announcer.getAttribute("aria-atomic")).toBe("true")
    expect(announcer.textContent).toBe("")
  })

  it("should announce the page navigated to", () => {
    const afterRender = createAccessibleNavigation()
    document.title = "About"

    navigate(afterRender, "/about")

    expect(getAnnouncement()).toBe("About")
  })

  it("should fall back to the first heading, then to the path", () => {
    const afterRender = createAccessibleNavigation()
    document.title = ""

    renderRoot(`<h1>Team</h1>`)
    navigate(afterRender, "/team")
    expect(getAnnouncement()).toBe("Team")

    renderRoot("")
    navigate(afterRender, "/contact")
    expect(getAnnouncement()).toBe("/contact")
  })

  it("should not announce renders that are not navigations", () => {
    const afterRender = createAccessibleNavigation()

    afterRender()
    navigate(afterRender, "/?tab=team")

    expect(getAnnouncement()).toBe("")
  })

  it("should wait until getPageName knows the name", () => {
    let name = null
    const afterRender = createAccessibleNavigation({ getPageName: () => name })

    navigate(afterRender, "/posts/hello")
    expect(getAnnouncement()).toBe("")

    name = "Hello"
    afterRender()
    expect(getAnnouncement()).toBe("Hello")
  })

  it("should move focus back to the top of the document", () => {
    const afterRender = createAccessibleNavigation()
    document.querySelector("a").focus()

    navigate(afterRender, "/about")

    expect(document.activeElement).toBe(document.body)
    expect(document.body.hasAttribute("tabindex")).toBe(false)
  })

  it("should focus an autofocus element of the page navigated to", () => {
    const afterRender = createAccessibleNavigation()
    renderRoot(`<input autofocus>`)

    navigate(afterRender, "/search")

    expect(document.activeElement).toBe(document.querySelector("input"))
  })

  it("should announce a page with the same name as the last one again", () => {
    const afterRender = createAccessibleNavigation()
    const announcer = document.getElementById("iw-route-announcer")

    navigate(afterRender, "/one")
    expect(getAnnouncement()).toBe("Home")

    navigate(afterRender, "/two")
    expect(announcer.textContent).toBe("")
    expect(getAnnouncement()).toBe("Home")
  })

  it("should keep focus when the history state asks to", () => {
    const afterRender = createAccessibleNavigation()
    const link = document.querySelector("a")
    link.focus()

    navigate(afterRender, "/about", { isFocusKept: true })

    expect(document.activeElement).toBe(link)
    expect(getAnnouncement()).toBe("Home")
  })
})
