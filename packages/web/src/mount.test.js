/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

const { renderSpy } = vi.hoisted(() => ({
  renderSpy: vi.fn(),
}))

const { hydrateSpy } = vi.hoisted(() => ({
  hydrateSpy: vi.fn(),
}))

vi.mock("lit-html", () => ({
  html: (strings, ...values) => ({ strings, values }),
  render: renderSpy,
}))

vi.mock("@lit-labs/ssr-client", () => ({
  hydrate: hydrateSpy,
}))

import { mount } from "./mount.js"

describe("mount", () => {
  let element
  let entity
  let types
  let api
  let listener
  let store
  let componentType

  beforeEach(() => {
    element = document.createElement("div")
    entity = {
      id: "dashboard-entity",
      type: "Dashboard",
    }
    componentType = {
      render: vi.fn(() => "dashboard-template"),
    }
    types = {}
    listener = undefined

    api = {
      getEntity: vi.fn(() => entity),
      getType: vi.fn((typeName) => types[typeName]),
      setType: vi.fn((typeName, type) => {
        types[typeName] = type
      }),
    }

    store = {
      _api: api,
      getType: vi.fn((typeName) => types[typeName]),
      subscribe: vi.fn((callback) => {
        listener = callback
        return vi.fn()
      }),
      notify: vi.fn((type) => {
        if (type === "init") {
          listener?.()
        }
      }),
    }

    renderSpy.mockReset()
    hydrateSpy.mockReset()
  })

  it("marks the document as native inside a Capacitor app", async () => {
    globalThis.Capacitor = { isNativePlatform: () => true }

    await mount(store, () => "template", element)

    expect(document.documentElement.classList.contains("iw-native")).toBe(true)
    delete globalThis.Capacitor
  })

  it("leaves the document unmarked in a browser", async () => {
    document.documentElement.classList.add("iw-native")

    await mount(store, () => "template", element)

    expect(document.documentElement.classList.contains("iw-native")).toBe(false)
  })

  it("lazily registers a missing type passed to api.render", async () => {
    await mount(
      store,
      (renderApi) =>
        renderApi.render("dashboard-entity", "Dashboard", componentType),
      element,
    )

    expect(api.getType).toHaveBeenCalledWith("Dashboard")
    expect(api.setType).toHaveBeenCalledWith("Dashboard", componentType)
    expect(componentType.render).toHaveBeenCalledWith(
      entity,
      expect.objectContaining({
        getEntity: expect.any(Function),
        getType: expect.any(Function),
        setType: expect.any(Function),
        render: expect.any(Function),
      }),
    )
    expect(renderSpy).toHaveBeenCalledWith("dashboard-template", element)
  })

  it("does not re-register a type that already exists", async () => {
    types.Dashboard = componentType

    await mount(
      store,
      (renderApi) =>
        renderApi.render("dashboard-entity", "Dashboard", componentType),
      element,
    )

    expect(api.setType).not.toHaveBeenCalled()
    expect(componentType.render).toHaveBeenCalledWith(
      entity,
      expect.objectContaining({
        getEntity: expect.any(Function),
        getType: expect.any(Function),
        setType: expect.any(Function),
        render: expect.any(Function),
      }),
    )
    expect(renderSpy).toHaveBeenCalledWith("dashboard-template", element)
  })

  it("hydrates existing markup by default", async () => {
    element.innerHTML = "<span>server-rendered</span>"

    await mount(
      store,
      (renderApi) =>
        renderApi.render("dashboard-entity", "Dashboard", componentType),
      element,
    )

    expect(hydrateSpy).toHaveBeenCalledWith("dashboard-template", element)
  })

  it("catches a throwing root render instead of crashing the subscription", async () => {
    const error = new Error("root boom")
    const onError = vi.fn()

    // subscribe fires the listener on notify("init"); the throwing renderFn
    // must not propagate out of it.
    await expect(
      mount(
        store,
        () => {
          throw error
        },
        element,
        { onError },
      ),
    ).resolves.toBeInstanceOf(Function)

    expect(onError).toHaveBeenCalledWith(error, expect.any(Object))
    // No fallback provided → nothing is committed, but no throw either.
    expect(renderSpy).not.toHaveBeenCalled()
  })

  it("renders the provided fallback when the root render throws", async () => {
    const error = new Error("root boom")
    const fallback = vi.fn(() => "root-fallback")

    await mount(
      store,
      () => {
        throw error
      },
      element,
      { onError: vi.fn(), fallback },
    )

    expect(fallback).toHaveBeenCalledWith(error, expect.any(Object))
    expect(renderSpy).toHaveBeenCalledWith("root-fallback", element)
  })

  it("falls back to a client render instead of hydrating when hydrate-path render throws", async () => {
    element.innerHTML = "<span>server-rendered</span>"
    const error = new Error("hydrate boom")
    const fallback = vi.fn(() => "root-fallback")

    await mount(
      store,
      () => {
        throw error
      },
      element,
      { onError: vi.fn(), fallback },
    )

    expect(hydrateSpy).not.toHaveBeenCalled()
    expect(renderSpy).toHaveBeenCalledWith("root-fallback", element)
  })

  describe("accessible navigation", () => {
    const navigate = (path) => {
      window.history.pushState(null, "", path)
      listener()
    }

    const getAnnouncer = () => document.getElementById("iw-route-announcer")

    beforeEach(() => {
      window.history.replaceState(null, "", "/")
      document.title = "Home"
      getAnnouncer()?.remove()
    })

    it("announces navigations in an app with the Router type", async () => {
      types.Router = {}
      await mount(store, () => "template", element)
      document.title = "About"

      navigate("/about")

      expect(getAnnouncer().textContent).toBe("About")
    })

    it("announces the name getPageName gives", async () => {
      types.Router = {}
      await mount(store, () => "template", element, {
        getPageName: () => "Post",
      })

      navigate("/posts/1")

      expect(getAnnouncer().textContent).toBe("Post")
    })

    it("leaves an app without the Router type alone", async () => {
      await mount(store, () => "template", element)

      expect(getAnnouncer()).toBeNull()
    })

    it("can be turned off", async () => {
      types.Router = {}
      await mount(store, () => "template", element, {
        hasAccessibleNavigation: false,
      })

      expect(getAnnouncer()).toBeNull()
    })
  })
})
