/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest"

import { handlers, startInteraction, stopInteraction } from "./handlers.js"

const LOGO_BOX = { left: 100, top: 100, width: 200, height: 200 }

describe("handlers", () => {
  afterEach(() => {
    stopInteraction()
    document.body.innerHTML = ""
  })

  describe("coordsChange", () => {
    it("stores the pointer offset as the position the template reads", () => {
      const entity = { id: "logo" }

      handlers.coordsChange(entity, { x: 10, y: -20 })

      expect(entity.position).toEqual([10, -20])
    })
  })

  describe("startInteraction", () => {
    it("measures the pointer from the center of the entity's logo", () => {
      addLogo("logo")
      const api = createApi({ logo: { id: "logo" } })

      startInteraction({ id: "logo" }, api)
      move(document.body, 250, 150)

      expect(api.notify).toHaveBeenCalledWith("#logo:coordsChange", {
        x: 50,
        y: -50,
      })
    })

    it("follows touches too", () => {
      addLogo("logo")
      const api = createApi({ logo: { id: "logo" } })

      startInteraction({ id: "logo" }, api)
      const event = new Event("touchmove", { bubbles: true })
      event.touches = [{ pageX: 150, pageY: 250 }]
      document.body.dispatchEvent(event)

      expect(api.notify).toHaveBeenCalledWith("#logo:coordsChange", {
        x: -50,
        y: 50,
      })
    })

    it("clamps the offset", () => {
      addLogo("logo")
      const api = createApi({ logo: { id: "logo" } })

      startInteraction({ id: "logo" }, api)
      move(document.body, 5000, -5000)

      expect(api.notify).toHaveBeenCalledWith("#logo:coordsChange", {
        x: 400,
        y: -400,
      })
    })

    it("ignores moves while the logo isn't on the page", () => {
      const api = createApi({ logo: { id: "logo" } })

      startInteraction({ id: "logo" }, api)
      move(document, 250, 150)

      expect(api.notify).not.toHaveBeenCalled()
    })

    it("lets several logos follow the pointer independently", () => {
      addLogo("first")
      addLogo("second")
      const api = createApi({
        first: { id: "first" },
        second: { id: "second" },
      })

      startInteraction({ id: "first" }, api)
      startInteraction({ id: "second" }, api)
      move(document.body, 200, 200)

      expect(api.notify).toHaveBeenCalledWith(
        "#first:coordsChange",
        expect.any(Object),
      )
      expect(api.notify).toHaveBeenCalledWith(
        "#second:coordsChange",
        expect.any(Object),
      )
    })

    it("prevents scrolling only when the move starts on the logo", () => {
      const logo = addLogo("logo")
      const api = createApi({ logo: { id: "logo", isScrollPrevented: true } })

      startInteraction({ id: "logo", isScrollPrevented: true }, api)
      const onLogo = move(logo, 200, 200)
      const elsewhere = move(document.body, 200, 200)

      expect(onLogo.defaultPrevented).toBe(true)
      expect(elsewhere.defaultPrevented).toBe(false)
    })
  })

  describe("stopInteraction", () => {
    it("stops only the given entity's logo", () => {
      addLogo("first")
      addLogo("second")
      const api = createApi({
        first: { id: "first" },
        second: { id: "second" },
      })

      startInteraction({ id: "first" }, api)
      startInteraction({ id: "second" }, api)
      stopInteraction({ id: "first" })
      move(document.body, 200, 200)

      expect(api.notify).toHaveBeenCalledTimes(1)
      expect(api.notify).toHaveBeenCalledWith(
        "#second:coordsChange",
        expect.any(Object),
      )
    })

    it("stops every logo when called without an entity", () => {
      addLogo("first")
      addLogo("second")
      const api = createApi({
        first: { id: "first" },
        second: { id: "second" },
      })

      startInteraction({ id: "first" }, api)
      startInteraction({ id: "second" }, api)
      stopInteraction()
      move(document.body, 200, 200)

      expect(api.notify).not.toHaveBeenCalled()
    })
  })
})

function addLogo(entityId) {
  const logo = document.createElement("div")
  logo.className = "iw-logo"
  logo.dataset.entityId = entityId
  logo.getBoundingClientRect = () => LOGO_BOX
  document.body.appendChild(logo)
  return logo
}

function createApi(entities) {
  return { getEntity: (id) => entities[id], notify: vi.fn() }
}

function move(target, pageX, pageY) {
  const event = new MouseEvent("mousemove", { bubbles: true, cancelable: true })
  Object.defineProperties(event, {
    pageX: { value: pageX },
    pageY: { value: pageY },
  })
  target.dispatchEvent(event)
  return event
}
