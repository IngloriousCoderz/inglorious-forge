import { render } from "@inglorious/web/test"
import { describe, expect, it, vi } from "vitest"

import { Lightbox } from "."

const images = ["/a.jpg", { src: "/b.jpg", alt: "The venue" }, "/c.jpg"]

function renderLightbox(props) {
  const container = document.createElement("div")
  document.body.append(container)
  render(Lightbox.render({ images, ...props }), container)
  return container.querySelector("dialog")
}

describe("lightbox", () => {
  it("shows the image at the index, wrapping around", () => {
    const dialog = renderLightbox({ index: 4, onStep: vi.fn() })

    const image = dialog.querySelector("img")
    expect(image.getAttribute("src")).toBe("/b.jpg")
    expect(image.alt).toBe("The venue")
    expect(
      dialog.querySelector(".iw-lightbox-counter").textContent.trim(),
    ).toBe("2/3")
  })

  it("steps with the arrows and the arrow keys", () => {
    const onStep = vi.fn()
    const dialog = renderLightbox({ onStep })

    dialog.querySelector(".iw-lightbox-next").click()
    dialog.querySelector(".iw-lightbox-previous").click()
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }))

    expect(onStep.mock.calls).toEqual([[1], [-1], [1]])
  })

  it("has no navigation for a single image", () => {
    const dialog = renderLightbox({ images: ["/a.jpg"], onStep: vi.fn() })

    expect(dialog.querySelector(".iw-lightbox-nav")).toBeNull()
    expect(dialog.querySelector(".iw-lightbox-counter")).toBeNull()
  })

  it("steps on a horizontal swipe, not on a short one", () => {
    const onStep = vi.fn()
    const dialog = renderLightbox({ onStep })

    dialog.dispatchEvent(new MouseEvent("pointerdown", { clientX: 200 }))
    dialog.dispatchEvent(new MouseEvent("pointerup", { clientX: 100 }))
    dialog.dispatchEvent(new MouseEvent("pointerdown", { clientX: 100 }))
    dialog.dispatchEvent(new MouseEvent("pointerup", { clientX: 120 }))

    expect(onStep.mock.calls).toEqual([[1]])
  })

  it("closes on a press outside the image, not on the image", () => {
    const onClose = vi.fn()
    const dialog = renderLightbox({ onClose })

    dialog.querySelector(".iw-lightbox-stage").click()
    expect(onClose).not.toHaveBeenCalled()

    dialog.click()
    expect(onClose).toHaveBeenCalledOnce()
  })

  it("renders nothing without images", () => {
    expect(renderLightbox({ images: [] })).toBeNull()
  })
})
