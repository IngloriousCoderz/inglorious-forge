import { describe, expect, it, vi } from "vitest"

import { pageRouteChange } from "./page-route.js"

describe("pageRouteChange", () => {
  const api = {}
  const entity = { id: "event" }

  it("opens the page with what select picks from the route", () => {
    const open = vi.fn()
    const close = vi.fn()
    const routeChange = pageRouteChange({
      select: (payload) => payload.params.eventId,
      open,
      close,
    })

    routeChange(entity, { route: "event", params: { eventId: "42" } }, api)

    expect(open).toHaveBeenCalledWith(entity, "42", api)
    expect(close).not.toHaveBeenCalled()
  })

  it("opens the page with nothing selected when there is no select", () => {
    const open = vi.fn()
    const routeChange = pageRouteChange({ open })

    routeChange(entity, { route: "event", params: {} }, api)

    expect(open).toHaveBeenCalledWith(entity, undefined, api)
  })

  it("closes the page when the route names another one", () => {
    const open = vi.fn()
    const close = vi.fn()
    const routeChange = pageRouteChange({ open, close })

    routeChange(entity, { route: "profile", params: {} }, api)

    expect(close).toHaveBeenCalledWith(entity, api)
    expect(open).not.toHaveBeenCalled()
  })

  it("skips the steps it is not given", () => {
    const routeChange = pageRouteChange()

    expect(() => {
      routeChange(entity, { route: "event", params: {} }, api)
      routeChange(entity, { route: "profile", params: {} }, api)
    }).not.toThrow()
  })
})
