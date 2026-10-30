import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { describe, expect, it } from "vitest"

import { ImageCropper } from "."

describe("image-cropper (store integration)", () => {
  function mountCropper(overrides = {}) {
    const store = createStore({
      types: { ImageCropper },
      entities: {
        cropper: {
          id: "cropper",
          type: "ImageCropper",
          src: "photo.jpg",
          ...overrides,
        },
      },
    })

    const container = document.createElement("div")
    mount(store, (api) => api.render("cropper"), container)

    return { store, container }
  }

  it("shows the frame once the image reports its size", () => {
    const { store, container } = mountCropper()

    expect(container.querySelector(".iw-image-cropper-frame")).toBeNull()

    store._api.notify("#cropper:imageLoad", { width: 1600, height: 900 })

    expect(container.querySelector(".iw-image-cropper-frame")).not.toBeNull()
  })

  it("locks the frame to the aspect ratio from load onwards", () => {
    const { store } = mountCropper({ aspectRatio: 1 })

    store._api.notify("#cropper:imageLoad", { width: 2000, height: 1000 })
    store._api.notify("#cropper:rectChange", { x: 0, y: 0, w: 1, h: 0.8 })

    const { rect } = store._api.getEntity("cropper")
    expect(rect.h).toBeCloseTo(0.8)
    expect(rect.w).toBeCloseTo(0.4)
  })

  it("moves the frame through a scoped rectChange event", () => {
    const { store, container } = mountCropper()

    store._api.notify("#cropper:imageLoad", { width: 1000, height: 1000 })
    store._api.notify("#cropper:rectChange", {
      x: 0.5,
      y: 0.25,
      w: 0.5,
      h: 0.5,
    })

    const frame = container.querySelector(".iw-image-cropper-frame")
    expect(frame.style.left).toBe("50%")
    expect(frame.style.top).toBe("25%")
  })
})
