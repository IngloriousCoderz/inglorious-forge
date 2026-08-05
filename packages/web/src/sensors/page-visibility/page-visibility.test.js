/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { PageVisibility } from "."

describe("page visibility", () => {
  let api
  let entity
  let doc

  beforeEach(() => {
    api = { notify: vi.fn() }
    entity = { id: "page-visibility", type: "PageVisibility" }

    doc = {
      visibilityState: "visible",
      hidden: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    globalThis.document = doc
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete globalThis.document
  })

  it("should initialize entity state and start watching", () => {
    PageVisibility.create(entity, undefined, api)

    expect(entity).toEqual({
      id: "page-visibility",
      type: "PageVisibility",
      isSupported: true,
      isVisible: true,
      isWatching: true,
    })

    expect(document.addEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    )
  })

  it("should notify pageVisibilityChange when visibility changes", () => {
    PageVisibility.create(entity, undefined, api)

    const listener = document.addEventListener.mock.calls.find(
      ([name]) => name === "visibilitychange",
    )[1]

    doc.hidden = true
    doc.visibilityState = "hidden"
    listener()

    expect(api.notify).toHaveBeenCalledWith(
      "#page-visibility:pageVisibilityChange",
      false,
    )
  })

  it("should update isVisible when pageVisibilityChange is called", () => {
    PageVisibility.create(entity, undefined, api)

    PageVisibility.pageVisibilityChange(entity, false)

    expect(entity.isVisible).toBe(false)
  })

  it("should remove the listener when unwatched", () => {
    PageVisibility.create(entity, undefined, api)
    PageVisibility.pageVisibilityUnwatch(entity)

    expect(document.removeEventListener).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    )
    expect(entity.isWatching).toBe(false)
  })

  it("should not watch when visibility is unsupported", () => {
    delete globalThis.document.visibilityState

    PageVisibility.create(entity, undefined, api)

    expect(entity.isSupported).toBe(false)
    expect(entity.isWatching).toBe(false)
  })
})
