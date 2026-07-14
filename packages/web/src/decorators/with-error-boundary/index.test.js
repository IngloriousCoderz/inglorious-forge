import { withErrorBoundary } from "@inglorious/web/decorators/with-error-boundary"
import { afterEach, describe, expect, it, vi } from "vitest"

describe("withErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns the base render output when it does not throw", () => {
    const type = { render: vi.fn(() => "ok") }
    const fallback = vi.fn()

    const behavior = withErrorBoundary(fallback)(type)
    const entity = { id: "e1" }
    const api = {}

    expect(behavior.render(entity, api)).toBe("ok")
    expect(type.render).toHaveBeenCalledWith(entity, api)
    expect(fallback).not.toHaveBeenCalled()
  })

  it("renders the fallback with the error, entity and api when render throws", () => {
    const error = new Error("boom")
    const type = {
      render: () => {
        throw error
      },
    }
    const fallback = vi.fn(() => "fallback")

    const behavior = withErrorBoundary(fallback)(type)
    const entity = { id: "e2" }
    const api = { getEntity: vi.fn() }

    expect(behavior.render(entity, api)).toBe("fallback")
    expect(fallback).toHaveBeenCalledWith(error, entity, api)
  })

  it("does not swallow non-render properties of the base type", () => {
    const onClick = vi.fn()
    const type = { render: () => "ok", onClick }

    const behavior = withErrorBoundary(() => "fallback")(type)

    // The decorator only contributes `render`; other handlers stay on the
    // base type and are merged by the store's type composition.
    expect(Object.keys(behavior)).toEqual(["render"])
  })

  it("logs and renders nothing by default when no fallback is provided", () => {
    const error = new Error("boom")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    const type = {
      render: () => {
        throw error
      },
    }

    const behavior = withErrorBoundary()(type)

    expect(behavior.render({ id: "e3" }, {})).toBe("")
    expect(consoleError).toHaveBeenCalledWith(
      "[withErrorBoundary] render failed:",
      error,
    )
  })

  it("returns an empty string when the base type has no render", () => {
    const behavior = withErrorBoundary(() => "fallback")({})

    expect(behavior.render({ id: "e4" }, {})).toBe("")
  })
})
