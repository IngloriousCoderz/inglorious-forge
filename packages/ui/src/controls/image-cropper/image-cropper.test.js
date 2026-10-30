import { html } from "@inglorious/web"
import { createMockApi, render } from "@inglorious/web/test"
import { describe, expect, it } from "vitest"

import { ImageCropper } from "."

function setup(overrides = {}) {
  const entity = {
    id: "crop",
    type: "ImageCropper",
    src: "photo.jpg",
    alt: "Photo",
    rect: { x: 0.2, y: 0.2, w: 0.4, h: 0.4 },
    naturalWidth: 800,
    naturalHeight: 400,
    step: 0.1,
    ...overrides,
  }
  const api = createMockApi({ [entity.id]: entity })
  api.getType = () => ImageCropper
  const container = document.createElement("div")

  render(ImageCropper.render(entity, api), container)

  return { entity, api, container }
}

function press(container, key, options = {}) {
  container
    .querySelector(".iw-image-cropper")
    .dispatchEvent(new KeyboardEvent("keydown", { key, ...options }))
}

describe("image-cropper", () => {
  it("renders the image and positions the frame from the rect", () => {
    const { container } = setup()

    const image = container.querySelector(".iw-image-cropper-image")
    expect(image.getAttribute("src")).toBe("photo.jpg")
    expect(image.getAttribute("alt")).toBe("Photo")

    const frame = container.querySelector(".iw-image-cropper-frame")
    expect(frame.style.left).toBe("20%")
    expect(frame.style.top).toBe("20%")
    expect(frame.style.width).toBe("40%")
    expect(frame.style.height).toBe("40%")
    expect(container.querySelectorAll(".iw-image-cropper-handle").length).toBe(
      8,
    )
  })

  it("takes the proportions of the loaded image", () => {
    const { container } = setup()

    const root = container.querySelector(".iw-image-cropper")
    expect(root.style.getPropertyValue("--iw-image-cropper-aspect")).toBe("2")
    expect(root.getAttribute("role")).toBe("group")
    expect(root.getAttribute("aria-label")).toBe("Crop area")
  })

  it("hides the frame until the image has loaded", () => {
    const { container, api } = setup({ naturalWidth: 0, naturalHeight: 0 })

    expect(container.querySelector(".iw-image-cropper-frame")).toBeNull()
    press(container, "ArrowRight")
    expect(api.getEvents()).toEqual([])
  })

  it("reports the natural size when the image loads", () => {
    const { container, api } = setup({ naturalWidth: 0, naturalHeight: 0 })

    const image = container.querySelector(".iw-image-cropper-image")
    Object.defineProperty(image, "naturalWidth", { value: 1200 })
    Object.defineProperty(image, "naturalHeight", { value: 600 })
    image.dispatchEvent(new Event("load"))

    expect(api.getEvents()).toEqual([
      { type: "#crop:imageLoad", payload: { width: 1200, height: 600 } },
    ])
  })

  it("moves the frame with the arrow keys", () => {
    const { container, api } = setup()

    press(container, "ArrowRight")

    const [event] = api.getEvents()
    expect(event.type).toBe("#crop:rectChange")
    expect(event.payload.x).toBeCloseTo(0.3)
    expect(event.payload.w).toBeCloseTo(0.4)
  })

  it("resizes with Shift and the arrow keys", () => {
    const { container, api } = setup()

    press(container, "ArrowDown", { shiftKey: true })

    const [event] = api.getEvents()
    expect(event.payload.y).toBeCloseTo(0.2)
    expect(event.payload.h).toBeCloseTo(0.5)
    expect(event.payload.w).toBeCloseTo(0.4)
  })

  it("keeps the aspect ratio while resizing", () => {
    const { container, api } = setup({
      aspectRatio: 1,
      rect: { x: 0.2, y: 0.2, w: 0.2, h: 0.4 },
    })

    press(container, "ArrowRight", { shiftKey: true })

    const [event] = api.getEvents()
    expect(event.payload.w / event.payload.h).toBeCloseTo(0.5)
  })

  it("resets to the largest frame that fits with Home", () => {
    const { container, api } = setup({ aspectRatio: 1 })

    press(container, "Home")

    const [event] = api.getEvents()
    expect(event.payload.x).toBeCloseTo(0.25)
    expect(event.payload.w).toBeCloseTo(0.5)
    expect(event.payload.h).toBeCloseTo(1)
  })

  it("does not respond when disabled", () => {
    const { container, api } = setup({ isDisabled: true })

    press(container, "ArrowRight")

    const root = container.querySelector(".iw-image-cropper")
    expect(api.getEvents()).toEqual([])
    expect(root.getAttribute("tabindex")).toBe("-1")
    expect(root.classList.contains("iw-image-cropper-disabled")).toBe(true)
  })

  it("lets consumers override the handles", () => {
    const entity = {
      id: "crop",
      src: "photo.jpg",
      naturalWidth: 100,
      naturalHeight: 100,
    }
    const api = createMockApi({ [entity.id]: entity })
    const CustomCropper = {
      ...ImageCropper,
      renderHandle: (_, handle) => html`<i class="my-handle">${handle}</i>`,
    }
    const container = document.createElement("div")

    render(CustomCropper.render(entity, api), container)

    expect(container.querySelectorAll(".my-handle").length).toBe(8)
    expect(container.querySelector(".iw-image-cropper-handle")).toBeNull()
  })
})

describe("image-cropper handlers", () => {
  it("create initializes defaults", () => {
    const entity = { id: "crop" }

    ImageCropper.create(entity)

    expect(entity.rect).toEqual({ x: 0, y: 0, w: 1, h: 1 })
    expect(entity.aspectRatio).toBeNull()
    expect(entity.minSize).toBe(0.1)
    expect(entity.naturalWidth).toBe(0)
  })

  it("imageLoad fits the frame to a locked aspect", () => {
    const entity = {
      id: "crop",
      aspectRatio: 1,
      rect: { x: 0, y: 0, w: 1, h: 1 },
    }

    ImageCropper.imageLoad(entity, { width: 2000, height: 1000 })

    expect(entity.naturalWidth).toBe(2000)
    expect(entity.rect.x).toBeCloseTo(0.25)
    expect(entity.rect.w).toBeCloseTo(0.5)
  })

  it("imageLoad keeps a frame that already has the aspect", () => {
    const rect = { x: 0.1, y: 0.2, w: 0.25, h: 0.5 }
    const entity = { id: "crop", aspectRatio: 1, rect }

    ImageCropper.imageLoad(entity, { width: 2000, height: 1000 })

    expect(entity.rect).toEqual(rect)
  })

  it("imageLoad without a size is an error", () => {
    const entity = { id: "crop" }

    ImageCropper.imageLoad(entity, {})

    expect(entity.hasError).toBe(true)
  })

  it("rectChange clamps and ignores updates while disabled", () => {
    const entity = { id: "crop", rect: { x: 0, y: 0, w: 1, h: 1 } }

    ImageCropper.rectChange(entity, { x: 0.9, y: 0, w: 0.5, h: 0.5 })
    expect(entity.rect).toEqual({ x: 0.5, y: 0, w: 0.5, h: 0.5 })

    entity.isDisabled = true
    ImageCropper.rectChange(entity, { x: 0, y: 0, w: 1, h: 1 })
    expect(entity.rect.w).toBe(0.5)
  })

  it("srcChange starts over until the new image loads", () => {
    const entity = {
      id: "crop",
      src: "a.jpg",
      naturalWidth: 100,
      naturalHeight: 100,
      rect: { x: 0.1, y: 0.1, w: 0.2, h: 0.2 },
    }

    ImageCropper.srcChange(entity, "b.jpg")

    expect(entity.src).toBe("b.jpg")
    expect(entity.naturalWidth).toBe(0)
    expect(entity.rect).toEqual({ x: 0, y: 0, w: 1, h: 1 })
  })

  it("srcChange with the same image refits right away", () => {
    const entity = {
      id: "crop",
      src: "a.jpg",
      aspectRatio: 1,
      naturalWidth: 200,
      naturalHeight: 100,
      rect: { x: 0, y: 0, w: 0.5, h: 1 },
    }

    ImageCropper.srcChange(entity, "a.jpg")

    expect(entity.naturalWidth).toBe(200)
    expect(entity.rect.w).toBeCloseTo(0.5)
    expect(entity.rect.x).toBeCloseTo(0.25)
  })
})
