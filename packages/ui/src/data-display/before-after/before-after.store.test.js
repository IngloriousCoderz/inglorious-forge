import { createStore } from "@inglorious/store"
import { mount } from "@inglorious/web"
import { describe, expect, it } from "vitest"

import { BeforeAfter } from "."

// Exercises the real entity/event loop: a scoped `#<id>:positionChange` event
// runs the handler, mutates the single piece of state (`position`), and the
// mounted view re-renders from it.
describe("before-after (store integration)", () => {
  function mountBeforeAfter(overrides = {}) {
    const store = createStore({
      types: { BeforeAfter },
      entities: {
        beforeAfter: {
          id: "beforeAfter",
          type: "BeforeAfter",
          before: { src: "before.jpg", alt: "Before" },
          after: { src: "after.jpg", alt: "After" },
          position: 50,
          ...overrides,
        },
      },
    })

    const container = document.createElement("div")
    mount(store, (api) => api.render("beforeAfter"), container)

    return { store, container }
  }

  it("renders the control from a live entity", () => {
    const { container } = mountBeforeAfter()

    const root = container.querySelector(".iw-before-after")
    expect(root).not.toBeNull()
    expect(root.style.getPropertyValue("--iw-before-after-position")).toBe(
      "50%",
    )
    expect(container.querySelectorAll(".iw-before-after img").length).toBe(2)
  })

  it("updates position through a scoped positionChange event", () => {
    const { store, container } = mountBeforeAfter()

    store._api.notify("#beforeAfter:positionChange", 30)

    expect(store._api.getEntity("beforeAfter").position).toBe(30)
    expect(
      container
        .querySelector(".iw-before-after")
        .style.getPropertyValue("--iw-before-after-position"),
    ).toBe("30%")
  })

  it("clamps out-of-range positions coming through the event loop", () => {
    const { store } = mountBeforeAfter()

    store._api.notify("#beforeAfter:positionChange", 999)
    expect(store._api.getEntity("beforeAfter").position).toBe(100)

    store._api.notify("#beforeAfter:positionChange", -50)
    expect(store._api.getEntity("beforeAfter").position).toBe(0)
  })
})
