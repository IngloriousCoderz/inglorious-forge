/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { router, setRoutes } from "."

describe("router", () => {
  let entity
  let api

  beforeEach(() => {
    entity = {
      id: "router",
      type: "router",
    }

    setRoutes({
      "/": "homePage",
      "/users": "userListPage",
      "/users/:id": "userPage",
      "/users/:id/posts/:postId": "postPage",
      "*": "notFoundPage",
    })

    api = {
      getEntity: vi.fn().mockReturnValue(entity),
      notify: vi.fn(),
      setType: vi.fn(),
    }

    // Mock window.location and history
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

      router.init(entity, undefined, api)

      expect(api.notify).toHaveBeenCalledWith("#router:navigate", {
        to: "/users/123?sort=asc",
        params: { id: "123" },
        replace: true,
      })
      expect(windowSpy).toHaveBeenCalledWith("popstate", expect.any(Function))
      expect(documentSpy).toHaveBeenCalledWith("click", expect.any(Function))
    })
  })

  describe("navigate()", () => {
    it("should navigate to a new path and update the entity", () => {
      router.navigate(entity, "/users/456?q=test", api)

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
      router.navigate(entity, { to: "/users", replace: true }, api)
      expect(history.replaceState).toHaveBeenCalled()
      expect(history.pushState).not.toHaveBeenCalled()
    })

    it("should handle numeric navigation", () => {
      router.navigate(entity, -1, api)
      expect(history.go).toHaveBeenCalledWith(-1)
    })

    it("should build path from params", () => {
      router.navigate(
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
      router.navigate(entity, "/some/unknown/path", api)
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

      router.navigate(entity, "/users", api)

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

      router.navigate(entity, { to: "/users", force: true }, api)

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

      await router.popstate(entity, undefined, api)

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
    it("should load a lazy route and dispatch routeLoadSuccess then navigate", async () => {
      const mockModule = { lazyPage: { render: () => {} } }
      const lazyRoute = vi.fn().mockResolvedValue(mockModule)

      setRoutes({
        "/lazy": lazyRoute,
      })

      await router.navigate(entity, "/lazy", api)

      expect(entity.isLoading).toBe(true)
      expect(api.notify).toHaveBeenCalledWith("#router:routeLoadSuccess", {
        module: mockModule,
        route: expect.objectContaining({ pattern: "/lazy" }),
      })
      expect(api.notify).toHaveBeenCalledWith("#router:navigate", "/lazy")
    })

    it("should handle lazy route loading errors", async () => {
      const error = new Error("Module load failed")
      const failingRoute = vi.fn().mockRejectedValue(error)
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      setRoutes({
        "/failing": failingRoute,
      })

      await router.navigate(entity, "/failing", api)

      expect(api.notify).toHaveBeenCalledWith("#router:routeLoadError", {
        error,
        path: "/failing",
      })

      // Simulate calling the routeLoadError handler
      router.routeLoadError(entity, { error, path: "/failing" })

      expect(entity.isLoading).toBe(false)
      expect(entity.error).toBe(error)

      consoleSpy.mockRestore()
    })
  })

  describe("routeLoadSuccess()", () => {
    it("should register the loaded module type and update routeConfig", () => {
      const module = { myPage: { render: () => {} } }
      const route = { pattern: "/lazy", entityType: () => {} }
      const payload = { module, route }

      router.routeLoadSuccess(entity, payload, api)

      expect(api.setType).toHaveBeenCalledWith("myPage", module.myPage)
      expect(entity.isLoading).toBe(false)
    })
  })

  describe("routeLoadError()", () => {
    it("should handle load errors", () => {
      const error = new Error("Failed")
      const payload = { error, path: "/lazy" }
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      router.routeLoadError(entity, payload)

      expect(entity.path).toBe("/lazy")
      expect(entity.isLoading).toBe(false)
      expect(entity.error).toBe(error)

      consoleSpy.mockRestore()
    })
  })
})
