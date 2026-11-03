/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { getRoute, Router, setRoutes } from "."

const toId = (typeName) => typeName[0].toLowerCase() + typeName.slice(1)

describe("router", () => {
  let entity
  let api

  beforeEach(() => {
    entity = {
      id: "router",
      type: "Router",
    }

    setRoutes({
      "/": "homePage",
      "/users": "userListPage",
      "/users/:id": "userPage",
      "/users/:id/posts/:postId": "postPage",
      "*": "notFoundPage",
    })

    api = {
      getEntities: vi.fn().mockReturnValue([entity]),
      getEntity: vi.fn().mockReturnValue(entity),
      notify: vi.fn(),
      getType: vi.fn(),
      setType: vi.fn(),
    }

    vi.spyOn(window, "location", "get").mockReturnValue({
      pathname: "/",
      search: "",
      hash: "",
      origin: "http://localhost:3000",
    })
    vi.spyOn(history, "pushState").mockImplementation(() => {})
    vi.spyOn(history, "replaceState").mockImplementation(() => {})
    vi.spyOn(history, "go").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("init()", () => {
    it("should initialize with the current window.location, set up a popstate listener, and set up a click listener for link interception", () => {
      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/users/123",
        search: "?sort=asc",
        hash: "#details",
        origin: "http://localhost:3000",
      })
      const windowSpy = vi.spyOn(window, "addEventListener")
      const documentSpy = vi.spyOn(document, "addEventListener")

      Router.init(entity, undefined, api)

      expect(api.notify).toHaveBeenCalledWith("#router:navigate", {
        to: "/users/123?sort=asc",
        params: { id: "123" },
        replace: true,
      })
      expect(windowSpy).toHaveBeenCalledWith("popstate", expect.any(Function))
      expect(documentSpy).toHaveBeenCalledWith("click", expect.any(Function))
    })
  })

  describe("link clicks", () => {
    const initClickListener = async () => {
      vi.resetModules()
      const { Router, setRoutes } = await import(".")
      setRoutes({ "/": "homePage", "/users": "userListPage" })
      const documentSpy = vi.spyOn(document, "addEventListener")
      Router.init(entity, undefined, api)
      const [, onClick] = documentSpy.mock.calls.find(
        ([type]) => type === "click",
      )
      api.notify.mockClear()
      return onClick
    }

    const click = (onClick, attributes = "") => {
      document.body.innerHTML = `<a href="http://localhost:3000/users?page=2" ${attributes}><span>Users</span></a>`
      const event = new MouseEvent("click", { bubbles: true, cancelable: true })
      Object.defineProperty(event, "target", {
        value: document.querySelector("span"),
      })
      onClick(event)
      return event
    }

    it("should navigate to the path of an internal link", async () => {
      const onClick = await initClickListener()

      const event = click(onClick)

      expect(event.defaultPrevented).toBe(true)
      expect(api.notify).toHaveBeenCalledWith(
        "#router:navigate",
        "/users?page=2",
      )
    })

    it("should mark the navigation of a data-is-focus-kept link", async () => {
      const onClick = await initClickListener()

      click(onClick, "data-is-focus-kept")

      expect(api.notify).toHaveBeenCalledWith("#router:navigate", {
        to: "/users?page=2",
        state: { isFocusKept: true },
      })
    })

    it("should leave a data-external link to the browser", async () => {
      const onClick = await initClickListener()

      const event = click(onClick, "data-external")

      expect(event.defaultPrevented).toBe(false)
      expect(api.notify).not.toHaveBeenCalled()
    })
  })

  describe("navigate()", () => {
    it("should navigate to a new path and update the entity", () => {
      Router.navigate(entity, "/users/456?q=test", api)

      expect(entity.path).toBe("/users/456")
      expect(entity.route).toBe("userPage")
      expect(entity.params).toEqual({ id: "456" })
      expect(entity.query).toEqual({ q: "test" })
      expect(history.pushState).toHaveBeenCalledWith(
        expect.any(Object),
        "",
        "/users/456?q=test",
      )
      expect(api.notify).toHaveBeenCalledWith("routeChange", expect.any(Object))
    })

    it("should use replaceState when replace is true", () => {
      Router.navigate(entity, { to: "/users", replace: true }, api)
      expect(history.replaceState).toHaveBeenCalled()
      expect(history.pushState).not.toHaveBeenCalled()
    })

    it("should handle numeric navigation", () => {
      Router.navigate(entity, -1, api)
      expect(history.go).toHaveBeenCalledWith(-1)
    })

    it("should build path from params", () => {
      Router.navigate(
        entity,
        { to: "/users/:id/posts/:postId", params: { id: 1, postId: 2 } },
        api,
      )
      expect(history.pushState).toHaveBeenCalledWith(
        expect.any(Object),
        "",
        "/users/1/posts/2",
      )
      expect(entity.route).toBe("postPage")
      expect(entity.params).toEqual({ id: "1", postId: "2" })
    })

    it("should use the fallback route for unknown paths", () => {
      Router.navigate(entity, "/some/unknown/path", api)
      expect(entity.route).toBe("notFoundPage")
      expect(entity.params).toEqual({})
    })

    it("should not navigate if the path is identical", () => {
      entity.path = "/users"
      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/users",
        search: "",
        hash: "",
      })

      Router.navigate(entity, "/users", api)

      expect(history.pushState).not.toHaveBeenCalled()
      expect(api.notify).not.toHaveBeenCalledWith(
        "routeChange",
        expect.any(Object),
      )
    })

    it("should navigate if the path is identical but force is true", () => {
      entity.path = "/users"
      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/users",
        search: "",
        hash: "",
      })

      Router.navigate(entity, { to: "/users", force: true }, api)

      expect(history.pushState).toHaveBeenCalled()
      expect(api.notify).toHaveBeenCalledWith("routeChange", expect.any(Object))
    })
  })

  describe("popstate()", () => {
    it("should update entity and emit routeChange for browser back/forward", async () => {
      vi.spyOn(window, "location", "get").mockReturnValue({
        pathname: "/users/789",
        search: "",
        hash: "",
        origin: "http://localhost:3000",
      })

      await Router.popstate(entity, undefined, api)

      expect(entity.path).toBe("/users/789")
      expect(entity.route).toBe("userPage")
      expect(entity.params).toEqual({ id: "789" })
      expect(api.notify).toHaveBeenCalledWith(
        "routeChange",
        expect.objectContaining({
          route: "userPage",
          path: "/users/789",
          params: { id: "789" },
        }),
      )
    })
  })

  describe("lazy route loading", () => {
    it("should load a lazy route and dispatch routeLoadSuccess with the navigation to resume", async () => {
      const mockModule = { lazyPage: { render: () => {} } }
      const lazyRoute = vi.fn().mockResolvedValue(mockModule)

      setRoutes({
        "/lazy": lazyRoute,
      })

      await Router.navigate(entity, "/lazy", api)

      expect(entity.isLoading).toBe(true)
      expect(entity.loadingPath).toBe("/lazy")
      expect(api.notify).toHaveBeenCalledWith("#router:routeLoadSuccess", {
        module: mockModule,
        route: expect.objectContaining({ pattern: "/lazy" }),
        path: "/lazy",
        resume: { event: "navigate", payload: "/lazy" },
      })
    })

    it("should not load a path that is loading already", async () => {
      const lazyRoute = vi.fn().mockResolvedValue({})
      setRoutes({ "/lazy": lazyRoute })
      entity.isLoading = true
      entity.loadingPath = "/lazy"

      await Router.navigate(entity, { to: "/lazy", force: true }, api)

      expect(lazyRoute).not.toHaveBeenCalled()
      expect(api.notify).not.toHaveBeenCalled()
    })

    it("should stop loading when another route is navigated to meanwhile", async () => {
      entity.isLoading = true
      entity.loadingPath = "/lazy"

      await Router.navigate(entity, "/users", api)

      expect(entity.isLoading).toBe(false)
      expect(entity.loadingPath).toBeNull()
      expect(entity.route).toBe("userListPage")
    })

    it("should handle lazy route loading errors", async () => {
      const error = new Error("Module load failed")
      const failingRoute = vi.fn().mockRejectedValue(error)
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      setRoutes({
        "/failing": failingRoute,
      })

      await Router.navigate(entity, "/failing", api)

      expect(api.notify).toHaveBeenCalledWith("#router:routeLoadError", {
        error,
        path: "/failing",
      })

      Router.routeLoadError(entity, { error, path: "/failing" })

      expect(entity.isLoading).toBe(false)
      expect(entity.loadingPath).toBeNull()
      expect(entity.error).toBe(error)

      consoleSpy.mockRestore()
    })
  })

  describe("routeLoadSuccess()", () => {
    const route = { pattern: "/lazy" }
    const resume = { event: "navigate", payload: "/lazy" }

    beforeEach(() => {
      entity.isLoading = true
      entity.loadingPath = "/lazy"
    })

    it("should register the loaded module type, update routeConfig and resume the navigation", () => {
      const module = { myPage: { render: () => {} } }

      Router.routeLoadSuccess(
        entity,
        { module, route, path: "/lazy", resume },
        api,
      )

      expect(api.setType).toHaveBeenCalledWith("myPage", module.myPage)
      expect(getRoute("/lazy")).toBe("router")
      expect(entity.isLoading).toBe(false)
      expect(entity.loadingPath).toBeNull()
      expect(api.notify).toHaveBeenCalledWith("#router:navigate", "/lazy")
    })

    it("should route to the default export and register the other types entities are of", () => {
      const ClientsPage = { render: () => {} }
      const module = {
        ClientsForm: { render: () => {} },
        ClientsGrid: { render: () => {} },
        ClientsPage,
        helper: () => {},
        default: ClientsPage,
      }
      api.getEntities = vi.fn((typeName) =>
        typeName === "helper" ? [] : [{ id: toId(typeName) }],
      )

      Router.routeLoadSuccess(
        entity,
        { module, route, path: "/lazy", resume },
        api,
      )

      expect(api.setType.mock.calls.map(([name]) => name)).toEqual([
        "ClientsForm",
        "ClientsGrid",
        "ClientsPage",
      ])
      expect(getRoute("/lazy")).toBe("clientsPage")
    })

    it("should not register a type again", () => {
      const module = { myPage: { render: () => {} } }
      api.getType = vi.fn().mockReturnValue({})

      Router.routeLoadSuccess(
        entity,
        { module, route, path: "/lazy", resume },
        api,
      )

      expect(api.setType).not.toHaveBeenCalled()
    })

    it("should not resume a navigation another one replaced", () => {
      const module = { myPage: { render: () => {} } }
      entity.loadingPath = "/other"

      Router.routeLoadSuccess(
        entity,
        { module, route, path: "/lazy", resume },
        api,
      )

      expect(api.setType).toHaveBeenCalled()
      expect(entity.isLoading).toBe(true)
      expect(api.notify).not.toHaveBeenCalled()
    })
  })

  describe("routeLoadError()", () => {
    it("should handle load errors", () => {
      const error = new Error("Failed")
      const payload = { error, path: "/lazy" }
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})
      entity.isLoading = true
      entity.loadingPath = "/lazy"

      Router.routeLoadError(entity, payload)

      expect(entity.path).toBe("/lazy")
      expect(entity.isLoading).toBe(false)
      expect(entity.error).toBe(error)

      consoleSpy.mockRestore()
    })
  })

  describe("history index", () => {
    const stubState = (state) => {
      vi.spyOn(history, "state", "get").mockReturnValue(state)
    }

    it("should stamp the starting entry so a reload keeps its place", () => {
      stubState(null)

      Router.init(entity, undefined, api)

      expect(history.replaceState).toHaveBeenCalledWith({ idx: 0 }, "")
      expect(entity.idx).toBe(0)
    })

    it("should keep an index the session history already carries", () => {
      stubState({ idx: 7 })

      Router.init(entity, undefined, api)

      expect(history.replaceState).not.toHaveBeenCalled()
      expect(entity.idx).toBe(7)
    })

    it("should advance the index on a push", () => {
      stubState({ idx: 3 })
      entity.idx = 3

      Router.navigate(entity, "/users", api)

      expect(history.pushState).toHaveBeenCalledWith(
        expect.objectContaining({ idx: 4 }),
        "",
        "/users",
      )
    })

    it("should hold the index on a replacement", () => {
      stubState({ idx: 3 })
      entity.idx = 3

      Router.navigate(entity, { to: "/users", replace: true }, api)

      expect(history.replaceState).toHaveBeenCalledWith(
        expect.objectContaining({ idx: 3 }),
        "",
        "/users",
      )
    })

    it("should advance its own index, not just the one it writes", () => {
      stubState({ idx: 0 })
      entity.idx = 0

      Router.navigate(entity, "/users", api)
      expect(entity.idx).toBe(1)

      Router.navigate(entity, "/posts", api)
      expect(history.pushState).toHaveBeenLastCalledWith(
        expect.objectContaining({ idx: 2 }),
        "",
        "/posts",
      )
    })

    it("should leave its own index alone on a replacement", () => {
      stubState({ idx: 3 })
      entity.idx = 3

      Router.navigate(entity, { to: "/users", replace: true }, api)
      Router.navigate(entity, { to: "/posts", replace: true }, api)

      expect(entity.idx).toBe(3)
    })

    it("should adopt the index of the entry traversed on popstate", () => {
      stubState({ idx: 1 })
      entity.idx = 5

      Router.popstate(entity, undefined, api)

      expect(entity.idx).toBe(1)
    })
  })

  describe("back()", () => {
    beforeEach(() => {
      vi.spyOn(history, "back").mockImplementation(() => {})
    })

    it("should go back when the app pushed an entry", () => {
      entity.idx = 2

      Router.back(entity, "/users", api)

      expect(history.back).toHaveBeenCalled()
      expect(api.notify).not.toHaveBeenCalled()
    })

    it("should replace the entry with the fallback on the first entry", () => {
      entity.idx = 0

      Router.back(entity, "/users", api)

      expect(history.back).not.toHaveBeenCalled()
      expect(api.notify).toHaveBeenCalledWith("#router:navigate", {
        to: "/users",
        replace: true,
      })
    })

    it("should pass navigation options through to the fallback", () => {
      entity.idx = 0

      Router.back(entity, { to: "/users/:id", params: { id: "1" } }, api)

      expect(api.notify).toHaveBeenCalledWith("#router:navigate", {
        to: "/users/:id",
        params: { id: "1" },
        replace: true,
      })
    })

    it("should do nothing on the first entry without a fallback", () => {
      entity.idx = 0

      Router.back(entity, undefined, api)

      expect(history.back).not.toHaveBeenCalled()
      expect(api.notify).not.toHaveBeenCalled()
    })
  })
})
