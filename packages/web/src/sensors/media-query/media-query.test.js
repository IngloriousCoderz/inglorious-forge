/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { MediaQuery } from "."

describe("media query", () => {
  let api
  let entity
  let mediaQueryList

  beforeEach(() => {
    entity = {
      id: "media-query",
      type: "MediaQuery",
      media: "(min-width: 600px)",
    }
    api = { notify: vi.fn() }

    mediaQueryList = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    }

    globalThis.matchMedia = vi.fn().mockReturnValue(mediaQueryList)
  })

  afterEach(() => {
    delete globalThis.matchMedia
  })

  it("should initialize entity state and start watching", () => {
    MediaQuery.create(entity, undefined, api)

    expect(entity).toEqual({
      id: "media-query",
      type: "MediaQuery",
      media: "(min-width: 600px)",
      isSupported: true,
      matches: true,
      isWatching: true,
    })
    expect(globalThis.matchMedia).toHaveBeenCalledWith("(min-width: 600px)")
    expect(mediaQueryList.addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    )
  })

  it("should notify mediaQueryChange when the media query changes", () => {
    MediaQuery.create(entity, undefined, api)

    const listener = mediaQueryList.addEventListener.mock.calls[0][1]
    listener({ matches: false })

    expect(api.notify).toHaveBeenCalledWith("#media-query:mediaQueryChange", {
      matches: false,
    })
  })

  it("should target the entity that owns the media query", () => {
    const otherEntity = {
      id: "other-media-query",
      type: "MediaQuery",
      media: "(prefers-color-scheme: dark)",
    }
    const otherMediaQueryList = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    globalThis.matchMedia.mockImplementation((media) =>
      media === entity.media ? mediaQueryList : otherMediaQueryList,
    )

    MediaQuery.create(entity, undefined, api)
    MediaQuery.create(otherEntity, undefined, api)

    const otherListener = otherMediaQueryList.addEventListener.mock.calls[0][1]
    otherListener({ matches: true })

    expect(api.notify).toHaveBeenLastCalledWith(
      "#other-media-query:mediaQueryChange",
      { matches: true },
    )
  })

  it("should unwatch by removing the listener", () => {
    MediaQuery.create(entity, undefined, api)
    MediaQuery.mediaQueryUnwatch(entity)

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    )
    expect(entity.isWatching).toBe(false)
  })
})
