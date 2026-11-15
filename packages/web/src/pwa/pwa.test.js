import { createStore } from "@inglorious/store"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { applyPwaUpdate, createPwaUpdate } from "."

describe("pwa update", () => {
  let doc
  let registration

  beforeEach(() => {
    vi.useFakeTimers()
    doc = {
      hidden: false,
      listeners: [],
      addEventListener(type, handler) {
        this.listeners.push(handler)
      },
      removeEventListener(type, handler) {
        this.listeners = this.listeners.filter((h) => h !== handler)
      },
    }
    registration = createRegistration()
    vi.stubGlobal("document", doc)
    vi.stubGlobal("location", { reload: vi.fn() })
    vi.stubGlobal("navigator", {
      serviceWorker: { controller: {}, ready: Promise.resolve(registration) },
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  async function storeWith(config) {
    const store = createStore({
      types: { PwaUpdate: createPwaUpdate(config) },
      entities: { pwaUpdate: { type: "PwaUpdate" } },
    })
    await vi.advanceTimersByTimeAsync(0)
    return store
  }

  const entityOf = (store) => store.getEntity("pwaUpdate")

  describe("createPwaUpdate", () => {
    it("checks every interval and on coming back to the foreground, not while hidden", async () => {
      await storeWith({ checkEveryMs: 1000 })

      await vi.advanceTimersByTimeAsync(2000)
      expect(registration.update).toHaveBeenCalledTimes(2)

      setHidden(false)
      expect(registration.update).toHaveBeenCalledTimes(3)

      setHidden(true)
      expect(registration.update).toHaveBeenCalledTimes(3)
    })

    it("applies a version already waiting at boot, without announcing it", async () => {
      const worker = createWorker()
      registration.waiting = worker
      const store = await storeWith()

      expect(worker.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" })
      expect(entityOf(store).isUpdateReady).toBe(false)
    })

    it("announces a version that lands mid-session", async () => {
      const store = await storeWith()

      const worker = installWorker(registration)
      worker.emit("statechange")

      expect(entityOf(store).isUpdateReady).toBe(true)
    })

    it("stays silent on a first-ever install: no old version to move from", async () => {
      vi.stubGlobal("navigator", {
        serviceWorker: {
          controller: null,
          ready: Promise.resolve(registration),
        },
      })
      const store = await storeWith()

      installWorker(registration)

      expect(entityOf(store).isUpdateReady).toBe(false)
    })

    it("applies a waiting version on the way to the background", async () => {
      await storeWith()
      const worker = installWorker(registration)

      setHidden(true)

      expect(worker.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" })
    })

    it("applies once per trip, and does not check while the reload is on its way", async () => {
      await storeWith()
      const worker = installWorker(registration)

      setHidden(true)
      setHidden(false)

      expect(worker.postMessage).toHaveBeenCalledOnce()
      expect(registration.update).not.toHaveBeenCalled()
    })

    it("moves over at once on pwaUpdateApply", async () => {
      const store = await storeWith()
      const worker = installWorker(registration)
      worker.postMessage.mockImplementation(() => {
        worker.state = "activated"
        worker.emit("statechange")
      })
      vi.stubGlobal("navigator", {
        serviceWorker: { getRegistration: async () => registration },
      })

      store.notify("#pwaUpdate:pwaUpdateApply")
      await vi.advanceTimersByTimeAsync(0)

      expect(location.reload).toHaveBeenCalledOnce()
    })

    it("stops checking when the entity goes", async () => {
      const store = await storeWith({ checkEveryMs: 1000 })

      store.notify("remove", "pwaUpdate")
      await vi.advanceTimersByTimeAsync(5000)
      setHidden(false)

      expect(registration.update).not.toHaveBeenCalled()
    })

    it("does nothing in a native app", async () => {
      vi.stubGlobal("Capacitor", { isNativePlatform: () => true })

      await storeWith({ checkEveryMs: 1000 })
      await vi.advanceTimersByTimeAsync(2000)

      expect(registration.update).not.toHaveBeenCalled()
    })
  })

  describe("applyPwaUpdate", () => {
    it("reloads once the waiting worker has taken over", async () => {
      const worker = createWorker()
      worker.postMessage.mockImplementation(() => {
        worker.state = "activated"
        worker.emit("statechange")
      })

      await applyPwaUpdate(createRegistration(worker))

      expect(location.reload).toHaveBeenCalledOnce()
    })

    it("reloads anyway when the worker never reports back", async () => {
      const applying = applyPwaUpdate(createRegistration(createWorker()))
      expect(location.reload).not.toHaveBeenCalled()

      await vi.runAllTimersAsync()
      await applying

      expect(location.reload).toHaveBeenCalledOnce()
    })

    it("looks the registration up, and reloads straight away with nothing waiting", async () => {
      vi.stubGlobal("navigator", {
        serviceWorker: { getRegistration: async () => createRegistration() },
      })

      await applyPwaUpdate()

      expect(location.reload).toHaveBeenCalledOnce()
    })
  })

  function setHidden(hidden) {
    doc.hidden = hidden
    for (const handler of doc.listeners) handler()
  }
})

function createWorker(state = "installed") {
  return {
    state,
    postMessage: vi.fn(),
    ...createEmitter(),
  }
}

function createRegistration(waiting = null) {
  return {
    waiting,
    installing: null,
    update: vi.fn(async () => {}),
    ...createEmitter(),
  }
}

function installWorker(registration) {
  const worker = createWorker()
  registration.installing = worker
  registration.emit("updatefound")
  registration.installing = null
  registration.waiting = worker
  worker.emit("statechange")
  return worker
}

function createEmitter() {
  const handlers = {}
  return {
    addEventListener(type, handler) {
      ;(handlers[type] ??= []).push(handler)
    },
    emit(type) {
      for (const handler of handlers[type] ?? []) handler()
    },
  }
}
