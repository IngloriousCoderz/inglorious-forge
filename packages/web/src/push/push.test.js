import { createStore } from "@inglorious/store"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createPushPrompt } from "./index.js"

const DECLINE_KEY = "test-push-declined"

let stored
let adapter

beforeEach(() => {
  stored = new Map()
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key) => stored.get(key) ?? null,
      setItem: (key, value) => stored.set(key, value),
    },
  })
  adapter = {
    isSupported: vi.fn(async () => true),
    permission: vi.fn(async () => "prompt"),
    request: vi.fn(async () => "granted"),
    register: vi.fn(async () => {}),
  }
})

function storeWith(type) {
  return createStore({
    types: { PushPrompt: type },
    entities: { pushPrompt: { type: "PushPrompt" } },
  })
}

// Starts the prompt and lets the device answer whether it may show pushes.
async function start(
  type = createPushPrompt({ adapter, declineKey: DECLINE_KEY }),
) {
  const store = storeWith(type)
  store.notify("#pushPrompt:pushStart")
  await settle()
  return store
}

function settle() {
  return new Promise((resolve) => setTimeout(resolve))
}

const isOpen = (store) => store.getState().pushPrompt.isOpen

describe("pushStart", () => {
  it("opens the prompt while the device has not been answered", async () => {
    expect(isOpen(await start())).toBe(true)
  })

  it("registers without asking once allowed", async () => {
    adapter.permission.mockResolvedValueOnce("granted")
    const store = await start()
    expect(isOpen(store)).toBe(false)
    expect(adapter.register).toHaveBeenCalled()
  })

  // The decline is about the prompt, not about pushes: allowing them later in
  // the system's settings still registers the device.
  it("registers once allowed, even after a decline", async () => {
    stored.set(DECLINE_KEY, "true")
    adapter.permission.mockResolvedValueOnce("granted")
    await start()
    expect(adapter.register).toHaveBeenCalled()
  })

  it("stays quiet after a decline, or a refusal on the device", async () => {
    stored.set(DECLINE_KEY, "true")
    expect(isOpen(await start())).toBe(false)

    stored.clear()
    adapter.permission.mockResolvedValueOnce("denied")
    expect(isOpen(await start())).toBe(false)
  })

  it("stays quiet where pushes are not supported", async () => {
    adapter.isSupported.mockResolvedValueOnce(false)
    expect(isOpen(await start())).toBe(false)
    expect(adapter.permission).not.toHaveBeenCalled()
  })

  it("stays quiet for a stop that lands before the answer", async () => {
    const store = storeWith(createPushPrompt({ adapter }))
    store.notify("#pushPrompt:pushStart")
    store.notify("#pushPrompt:pushStop")
    await settle()
    expect(isOpen(store)).toBe(false)
  })
})

describe("pushAsk", () => {
  it("registers when the device allows it", async () => {
    const store = await start()
    store.notify("#pushPrompt:pushAsk")
    expect(isOpen(store)).toBe(false)
    await vi.waitFor(() => expect(adapter.register).toHaveBeenCalled())
  })

  it("goes quiet when the device refuses", async () => {
    adapter.request.mockResolvedValueOnce("denied")
    const store = await start()
    store.notify("#pushPrompt:pushAsk")
    await settle()
    expect(adapter.request).toHaveBeenCalled()
    expect(isOpen(store)).toBe(false)
    expect(adapter.register).not.toHaveBeenCalled()
  })
})

describe("pushDecline", () => {
  it("closes the prompt for good on this device", async () => {
    const store = await start()
    store.notify("#pushPrompt:pushDecline")
    expect(isOpen(store)).toBe(false)
    expect(stored.get(DECLINE_KEY)).toBe("true")
    expect(isOpen(await start())).toBe(false)
  })
})

describe("pushStop", () => {
  it("takes the prompt down", async () => {
    const store = await start()
    store.notify("#pushPrompt:pushStop")
    expect(isOpen(store)).toBe(false)
  })
})

describe("taps", () => {
  it("opens a tapped push's screen through the router, once", () => {
    let tap
    adapter.onTap = vi.fn((listener) => {
      tap = listener
    })
    const navigate = vi.fn()
    const type = createPushPrompt({ adapter, onTap: navigate })
    storeWith(type)
    storeWith(type)

    expect(adapter.onTap).toHaveBeenCalledTimes(1)
    tap("/events/e1")
    expect(navigate).toHaveBeenCalledWith("/events/e1", expect.anything())
  })
})
