import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { Icon } from "."

describe("icon", () => {
  it("renders content", () => {
    const props = { id: "ic", children: "★" }
    const container = document.createElement("div")

    render(Icon.render(props), container)

    expect(container.querySelector(".iw-icon").textContent).toBe("★")
  })

  it("applies size, color style, and click handler", () => {
    let isClicked = false
    const props = {
      id: "ic",
      children: "★",
      size: "lg",
      color: "red",
      onClick: () => (isClicked = true),
    }
    const container = document.createElement("div")

    render(Icon.render(props), container)

    const element = container.querySelector(".iw-icon")
    expect(element.classList.contains("iw-icon-lg")).toBe(true)
    expect(element.getAttribute("style")).toContain("color: red")
    element.click()
    expect(isClicked).toBe(true)
  })

  describe("icon", () => {
    const arrowBack = {
      width: 24,
      height: 24,
      body: '<path fill="currentColor" d="m7.825 13l5.6 5.6L12 20l-8-8l8-8l1.425 1.4l-5.6 5.6H20v2z"/>',
    }

    it("draws an Iconify icon as an inline SVG one em square", () => {
      const container = document.createElement("div")

      render(Icon.render({ icon: arrowBack }), container)

      const svg = container.querySelector(".iw-icon svg")
      expect(svg.getAttribute("viewBox")).toBe("0 0 24 24")
      expect(svg.getAttribute("width")).toBe("1em")
      expect(svg.querySelector("path").getAttribute("d")).toContain("m7.825")
    })

    it("defaults to Iconify's 16 by 16 box", () => {
      const container = document.createElement("div")

      render(Icon.render({ icon: { body: "<circle r='8'/>" } }), container)

      expect(container.querySelector("svg").getAttribute("viewBox")).toBe(
        "0 0 16 16",
      )
    })

    it("mirrors in right-to-left text", () => {
      const container = document.createElement("div")

      render(Icon.render({ icon: arrowBack }), container)
      expect(container.querySelector(".iw-icon-rtl")).toBeNull()

      render(Icon.render({ icon: arrowBack, direction: "rtl" }), container)
      expect(container.querySelector(".iw-icon-rtl")).not.toBeNull()
    })

    it("is decorative without a label, and an image with one", () => {
      const container = document.createElement("div")

      render(Icon.render({ icon: arrowBack }), container)
      const decorative = container.querySelector(".iw-icon")
      expect(decorative.getAttribute("aria-hidden")).toBe("true")
      expect(decorative.hasAttribute("role")).toBe(false)

      render(Icon.render({ icon: arrowBack, label: "Back" }), container)
      const labelled = container.querySelector(".iw-icon")
      expect(labelled.getAttribute("role")).toBe("img")
      expect(labelled.getAttribute("aria-label")).toBe("Back")
      expect(labelled.hasAttribute("aria-hidden")).toBe(false)
    })
  })
})
