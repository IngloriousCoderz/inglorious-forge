/**
 * @vitest-environment jsdom
 */
import { render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { template } from "./template.js"

const FACES = [
  { image: "I", eye: true },
  { image: "C", reverse: true },
]

describe("template", () => {
  it("tilts the head towards the position, in degrees", () => {
    const transform = renderLogo({
      position: [100, 100],
    }).style.getPropertyValue("--transform")

    expect(transform).toContain("rotateX(-45.73deg)")
    expect(transform).toContain("rotateY(-39.27deg)")
  })

  it("starts from the default rotation without a position", () => {
    const transform = renderLogo().style.getPropertyValue("--transform")

    expect(transform).toContain("rotateX(-40deg)")
    expect(transform).toContain("rotateY(-45deg)")
  })

  it("links the element to its entity for pointer tracking", () => {
    expect(renderLogo({ id: "icy" }).dataset.entityId).toBe("icy")
  })
})

function renderLogo(props = {}) {
  const root = document.createElement("div")
  render(template.render({ size: 256, faces: FACES, ...props }), root)
  return root.querySelector(".iw-logo")
}
