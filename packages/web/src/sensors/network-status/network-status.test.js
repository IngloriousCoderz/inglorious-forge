/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { NetworkStatus } from "."

describe("network status", () => {
  let api
  let entity
  let windowMock

  beforeEach(() => {
    entity = { id: "network-status", type: "NetworkStatus" }
    api = { notify: vi.fn() }

    windowMock = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      navigator: { onLine: true },
    }

    globalThis.window = windowMock
    globalThis.navigator = windowMock.navigator
  })

  afterEach(() => {
    delete globalThis.window
    delete globalThis.navigator
  })

  it("should initialize entity state and start watching", () => {
    NetworkStatus.create(entity, undefined, api)

    expect(entity).toEqual({
      id: "network-status",
      type: "NetworkStatus",
      isSupported: true,
      isOnline: true,
      isWatching: true,
    })
    expect(windowMock.addEventListener).toHaveBeenCalledWith(
      "online",
      expect.any(Function),
    )
    expect(windowMock.addEventListener).toHaveBeenCalledWith(
      "offline",
      expect.any(Function),
    )
  })

  it("should notify networkStatusChange when online fires", () => {
    NetworkStatus.create(entity, undefined, api)

    const onlineListener = windowMock.addEventListener.mock.calls.find(
      ([eventName]) => eventName === "online",
    )[1]

    onlineListener()

    expect(api.notify).toHaveBeenCalledWith(
      "#network-status:networkStatusChange",
      true,
    )
  })

  it("should notify networkStatusChange when offline fires", () => {
    NetworkStatus.create(entity, undefined, api)

    const offlineListener = windowMock.addEventListener.mock.calls.find(
      ([eventName]) => eventName === "offline",
    )[1]

    offlineListener()

    expect(api.notify).toHaveBeenCalledWith(
      "#network-status:networkStatusChange",
      false,
    )
  })

  it("should stop listening when unwatched", () => {
    NetworkStatus.create(entity, undefined, api)
    NetworkStatus.networkStatusUnwatch(entity)

    expect(windowMock.removeEventListener).toHaveBeenCalledWith(
      "online",
      expect.any(Function),
    )
    expect(windowMock.removeEventListener).toHaveBeenCalledWith(
      "offline",
      expect.any(Function),
    )
    expect(entity.isWatching).toBe(false)
  })
})
