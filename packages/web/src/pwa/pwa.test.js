import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { applyPwaUpdate, PwaUpdate, watchPwaUpdate } from "."

describe("pwa update", () => {
  let doc
  let store

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
    vi.stubGlobal("document", doc)
    vi.stubGlobal("location", { reload: vi.fn() })
    vi.stubGlobal("navigator", { serviceWorker: { controller: {} } })
    store = { notify: vi.fn() }
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  describe("watchPwaUpdate", () => {
    it("checks every interval and on coming back to the foreground, not while hidden", () => {
      const registration = createRegistration()
      watchPwaUpdate(registration, store, { checkEveryMs: 1000 })

      vi.advanceTimersByTime(2000)
      expect(registration.update).toHaveBeenCalledTimes(2)

      setHidden(false)
      expect(registration.update).toHaveBeenCalledTimes(3)

      setHidden(true)
      expect(registration.update).toHaveBeenCalledTimes(3)
    })

    it("applies a version already waiting at boot, without announcing it", () => {
      const worker = createWorker()
      watchPwaUpdate(createRegistration(worker), store)

      expect(worker.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" })
      expect(store.notify).not.toHaveBeenCalled()
    })

    it("announces a version that lands mid-session, once per worker", () => {
      const registration = createRegistration()
      watchPwaUpdate(registration, store)

      const worker = installWorker(registration)
      worker.emit("statechange")

      expect(store.notify).toHaveBeenCalledOnce()
      expect(store.notify).toHaveBeenCalledWith("#pwaUpdate:pwaUpdateReady")
    })

    it("announces to the entity it is given", () => {
      const registration = createRegistration()
      watchPwaUpdate(registration, store, { id: "update" })

      installWorker(registration)

      expect(store.notify).toHaveBeenCalledWith("#update:pwaUpdateReady")
    })

    it("stays silent on a first-ever install: no old version to move from", () => {
      vi.stubGlobal("navigator", { serviceWorker: { controller: null } })
      const registration = createRegistration()
      watchPwaUpdate(registration, store)

      installWorker(registration)

      expect(store.notify).not.toHaveBeenCalled()
    })

    it("applies a waiting version on the way to the background", () => {
      const registration = createRegistration()
      watchPwaUpdate(registration, store)
      const worker = installWorker(registration)

      setHidden(true)

      expect(worker.postMessage).toHaveBeenCalledWith({ type: "SKIP_WAITING" })
    })

    it("applies once per trip, and does not check while the reload is on its way", () => {
      const registration = createRegistration()
      watchPwaUpdate(registration, store)
      const worker = installWorker(registration)

      setHidden(true)
      setHidden(false)

      expect(worker.postMessage).toHaveBeenCalledOnce()
      expect(registration.update).not.toHaveBeenCalled()
    })

    it("applies silently without a store", () => {
      const registration = createRegistration()
      watchPwaUpdate(registration)
      const worker = installWorker(registration)

      setHidden(true)

      expect(worker.postMessage).toHaveBeenCalledOnce()
    })

    it("announces again after the previous version took over", () => {
      const registration = createRegistration()
      watchPwaUpdate(registration, store)
      const first = installWorker(registration)
      first.state = "activated"
      first.emit("statechange")
      registration.waiting = null

      installWorker(registration)

      expect(store.notify).toHaveBeenCalledTimes(2)
    })

    it("stops checking once stopped", () => {
      const registration = createRegistration()
      const stop = watchPwaUpdate(registration, store, { checkEveryMs: 1000 })

      stop()
      vi.advanceTimersByTime(5000)
      setHidden(false)

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

  describe("PwaUpdate", () => {
    it("starts with no update ready, and raises the flag when one lands", () => {
      const entity = { id: "pwaUpdate", type: "PwaUpdate" }

      PwaUpdate.create(entity)
      expect(entity.isUpdateReady).toBe(false)

      PwaUpdate.pwaUpdateReady(entity)
      expect(entity.isUpdateReady).toBe(true)
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
