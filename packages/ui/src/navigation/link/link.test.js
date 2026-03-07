import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { link } from "."

describe("link", () => {
  it("renders label and href", () => {
    const container = document.createElement("div")

    render(link.render({ href: "/docs", label: "Docs" }), container)

    const anchor = container.querySelector(".iw-link")
    expect(anchor.getAttribute("href")).toBe("/docs")
    expect(anchor.textContent.trim()).toBe("Docs")
  })

  it("sets external attributes", () => {
    const container = document.createElement("div")

    render(
      link.render({ href: "https://example.com", label: "X", external: true }),
      container,
    )

    const anchor = container.querySelector(".iw-link")
    expect(anchor.getAttribute("target")).toBe("_blank")
    expect(anchor.getAttribute("rel")).toBe("noreferrer noopener")
  })
})
