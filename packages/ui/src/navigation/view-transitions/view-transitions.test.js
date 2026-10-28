import { createStore } from "@inglorious/store"
import { Router, setRoutes } from "@inglorious/web/router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { withTransitions } from "."

describe("view-transitions", () => {
  let startViewTransition

  beforeEach(() => {
    window.history.replaceState({ idx: 0 }, "", "/")
    startViewTransition = vi.fn((options) => {
      const update = typeof options === "function" ? options : options.update
      update()
    })
    document.startViewTransition = startViewTransition
    globalThis.ViewTransition = class ViewTransition {}
    globalThis.ViewTransition.prototype.types = []
  })

  it("throws when the store has no Router type", () => {
    const store = createStore({ types: { Counter }, entities: {} })

    expect(() => withTransitions()(store)).toThrow(/Router/)
  })

  it("returns the same store", () => {
    const store = createTestStore()

    expect(withTransitions()(store)).toBe(store)
  })

  it("works as a store middleware", () => {
    const store = createStore({
      types: { Counter, Router },
      entities: {
        counter1: { type: "Counter", value: 0 },
        router: { type: "Router" },
      },
      middlewares: [withTransitions()],
    })
    const listener = vi.fn()

    store.subscribe(listener)
    navigateTo("/events", 1)
    store.notify("#counter1:increment")

    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("throws at store creation when the store has no Router type", () => {
    expect(() =>
      createStore({
        types: { Counter },
        entities: {},
        middlewares: [withTransitions()],
      }),
    ).toThrow(/Router/)
  })

  it("notifies every listener from a single store subscription", () => {
    const store = createTestStore()
    const subscribe = spyOnSubscribe(store)
    const first = vi.fn()
    const second = vi.fn()

    withTransitions()(store).subscribe(first)
    store.subscribe(second)
    navigateTo("/events", 1)
    store.notify("#counter1:increment")

    expect(subscribe).toHaveBeenCalledTimes(1)
    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(first).toHaveBeenCalledTimes(1)
    expect(second).toHaveBeenCalledTimes(1)
  })

  it("does not transition when the path is unchanged", () => {
    const store = withTransitions()(createTestStore())
    const listener = vi.fn()

    store.subscribe(listener)
    store.notify("#counter1:increment")

    expect(startViewTransition).not.toHaveBeenCalled()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("does not transition when only the hash changes", () => {
    const store = withTransitions()(createTestStore())
    const listener = vi.fn()

    store.subscribe(listener)
    window.history.pushState({ idx: 0 }, "", "/#details")
    store.notify("#counter1:increment")

    expect(startViewTransition).not.toHaveBeenCalled()
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("transitions forward when the history index increases", () => {
    const store = withTransitions()(createTestStore())

    store.subscribe(vi.fn())
    navigateTo("/events", 1)
    store.notify("#counter1:increment")

    expect(startViewTransition).toHaveBeenCalledWith(
      expect.objectContaining({ types: ["forward"] }),
    )
  })

  it("transitions back when the history index decreases", () => {
    const store = withTransitions()(createTestStore())

    store.subscribe(vi.fn())
    navigateTo("/events", 1)
    store.notify("#counter1:increment")

    navigateTo("/", 0)
    store.notify("#counter1:increment")

    expect(startViewTransition).toHaveBeenLastCalledWith(
      expect.objectContaining({ types: ["back"] }),
    )
  })

  it("transitions as a replacement when the history index is unchanged", () => {
    const store = withTransitions()(createTestStore())

    store.subscribe(vi.fn())
    window.history.replaceState({ idx: 0 }, "", "/events")
    store.notify("#counter1:increment")

    expect(startViewTransition).toHaveBeenCalledWith(
      expect.objectContaining({ types: ["replace"] }),
    )
  })

  it("falls back to the callback form when types are unsupported", () => {
    delete globalThis.ViewTransition.prototype.types
    const store = withTransitions()(createTestStore())

    store.subscribe(vi.fn())
    navigateTo("/events", 1)
    store.notify("#counter1:increment")

    const [argument] = startViewTransition.mock.calls[0]
    expect(typeof argument).toBe("function")
  })

  it("renders without a transition when the API is unavailable", () => {
    delete document.startViewTransition
    const store = withTransitions()(createTestStore())
    const listener = vi.fn()

    store.subscribe(listener)
    navigateTo("/events", 1)
    store.notify("#counter1:increment")

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("reads the state when the update runs, not when the transition started", () => {
    let update
    document.startViewTransition = vi.fn((options) => {
      update = options.update
    })
    const store = withTransitions()(createTestStore())
    const states = []

    store.subscribe((state) => states.push(state.counter1.value))
    navigateTo("/events", 1)
    store.notify("#counter1:increment")
    /* Not a navigation, so it notifies straight away and reaches the listener
       before the transition's own update ever runs. */
    store.notify("#counter1:increment")

    expect(states).toEqual([2])
    update()
    /* The deferred update replays the value the store holds now, not the one it
       held when the transition started. */
    expect(states).toEqual([2, 2])
  })

  it("stops subscribing to the store once the last listener leaves", () => {
    const store = createTestStore()
    const subscribe = spyOnSubscribe(store)

    withTransitions()(store)
    const first = store.subscribe(vi.fn())
    const second = store.subscribe(vi.fn())
    expect(subscribe).toHaveBeenCalledTimes(1)

    first()
    first()
    second()

    store.subscribe(vi.fn())

    expect(subscribe).toHaveBeenCalledTimes(2)
  })

  it("rebases when it tears down, so a later subscriber does not animate", () => {
    const store = withTransitions()(createTestStore())

    /* The path moves while the store is subscribed but never renders, so the
       last thing onStateChange saw is the old one. Re-subscribing has to rebase
       onto the current route, or the next dispatch reads as a navigation. */
    const unsubscribe = store.subscribe(vi.fn())
    navigateTo("/events", 1)
    unsubscribe()

    store.subscribe(vi.fn())
    store.notify("#counter1:increment")

    expect(startViewTransition).not.toHaveBeenCalled()
  })

  it("baselines at the first subscribe, not when the store is wrapped", () => {
    const store = createTestStore()
    withTransitions()(store)

    /* Wrapping is not subscribing: anything that navigates in between belongs
       to the baseline rather than to a transition of its own. */
    navigateTo("/events", 1)

    store.subscribe(vi.fn())
    store.notify("#counter1:increment")

    expect(startViewTransition).not.toHaveBeenCalled()
  })

  it("does not touch the history until something subscribes", () => {
    const state = vi.spyOn(window.history, "state", "get")

    withTransitions()(createTestStore())

    expect(state).not.toHaveBeenCalled()
  })

  it("does not notify a listener added during a notification", () => {
    const store = withTransitions()(createTestStore())
    const late = vi.fn()

    store.subscribe(() => {
      store.subscribe(late)
    })
    store.notify("#counter1:increment")

    expect(late).not.toHaveBeenCalled()
    store.notify("#counter1:increment")
    expect(late).toHaveBeenCalledTimes(1)
  })

  describe("with the Router", () => {
    const Page = { render: () => "" }

    function traverseTo(state, path) {
      window.history.replaceState(state, "", path)
      window.dispatchEvent(new PopStateEvent("popstate", { state }))
    }

    function lastType() {
      return startViewTransition.mock.calls.at(-1)[0].types
    }

    it("tags a push, a traversal back, a traversal forward and a replacement", () => {
      const store = createStore({
        types: { Router, Page },
        entities: {
          router: { type: "Router" },
          page: { type: "Page" },
        },
      })
      setRoutes({ "/": "page", "/events": "page", "/events/42": "page" })

      withTransitions()(store).subscribe(vi.fn())
      store.notify("init")

      store.notify("#router:navigate", "/events")
      expect(lastType()).toEqual(["forward"])

      traverseTo({ idx: 0 }, "/")
      expect(lastType()).toEqual(["back"])

      traverseTo({ idx: 1 }, "/events")
      expect(lastType()).toEqual(["forward"])

      store.notify("#router:navigate", { to: "/events/42", replace: true })
      expect(lastType()).toEqual(["replace"])
    })

    it("keeps reading forward across consecutive pushes", () => {
      const store = createStore({
        types: { Router, Page },
        entities: {
          router: { type: "Router" },
          page: { type: "Page" },
        },
      })
      setRoutes({ "/": "page", "/events": "page", "/events/42": "page" })

      withTransitions()(store).subscribe(vi.fn())
      store.notify("init")

      store.notify("#router:navigate", "/events")
      store.notify("#router:navigate", "/events/42")

      /* A Router that stamps the index without advancing its own counter writes
         the same one twice, and the second push reads as a replacement. */
      expect(startViewTransition).toHaveBeenCalledTimes(2)
      expect(lastType()).toEqual(["forward"])
    })
  })

  describe("routes", () => {
    const View = { render: () => "" }

    function createRoutedStore() {
      const store = createStore({
        types: { Router, View },
        entities: {
          router: { type: "Router" },
          home: { type: "View" },
          list: { type: "View" },
          detail: { type: "View" },
        },
      })
      setRoutes({ "/": "home", "/list": "list", "/list/42": "detail" })
      return store
    }

    it("animates only navigations into or out of the listed routes", () => {
      const store = createRoutedStore()
      const listener = vi.fn()

      withTransitions({ routes: ["detail"] })(store).subscribe(listener)
      store.notify("init")
      startViewTransition.mockClear()

      store.notify("#router:navigate", "/list")
      expect(startViewTransition).not.toHaveBeenCalled()
      expect(listener).toHaveBeenCalled()

      store.notify("#router:navigate", "/list/42")
      expect(startViewTransition).toHaveBeenLastCalledWith(
        expect.objectContaining({ types: ["forward"] }),
      )
    })

    it("passes the direction and both sides of the navigation to a function", () => {
      const store = createRoutedStore()
      const routes = vi.fn(() => true)

      withTransitions({ routes })(store).subscribe(vi.fn())
      store.notify("init")
      store.notify("#router:navigate", "/list/42")

      expect(routes).toHaveBeenLastCalledWith({
        type: "forward",
        from: { path: "/", index: 0, route: "home" },
        to: { path: "/list/42", index: 1, route: "detail" },
      })
      expect(startViewTransition).toHaveBeenLastCalledWith(
        expect.objectContaining({ types: ["forward"] }),
      )
    })

    it("navigates without a transition when the function says no", () => {
      const store = createRoutedStore()
      const listener = vi.fn()

      withTransitions({ routes: () => false })(store).subscribe(listener)
      store.notify("init")
      store.notify("#router:navigate", "/list")

      expect(startViewTransition).not.toHaveBeenCalled()
      expect(listener).toHaveBeenCalled()
    })
  })
})

const Counter = {
  increment(entity) {
    entity.value++
  },
}

function createTestStore() {
  return createStore({
    types: { Counter, Router },
    entities: {
      counter1: { type: "Counter", value: 0 },
      router: { type: "Router" },
    },
  })
}

function navigateTo(path, idx) {
  window.history.pushState({ idx }, "", path)
}

/* Spying has to happen before wrapping: `withTransitions` replaces `subscribe`
 * with its own, so a spy installed afterwards would only count calls to the
 * wrapper and never reach the store. */
function spyOnSubscribe(store) {
  return vi.spyOn(store, "subscribe")
}
