import { describe, expect, it, vi } from "vitest"

import { createMockApi, trigger } from "../test.js"
import { handleAsync } from "./async.js"

describe("handleAsync", () => {
  describe("basic async lifecycle", () => {
    it("should execute run, success, and finally handlers on success", async () => {
      const handlers = {
        run: vi.fn(async (payload) => {
          return { data: payload.value * 2 }
        }),
        success: vi.fn((entity, result) => {
          entity.result = result.data
        }),
        finally: vi.fn((entity) => {
          entity.completed = true
        }),
      }

      const asyncHandlers = handleAsync("fetchData", handlers)

      const entity = {
        type: "DataFetcher",
        id: "fetcher1",
        result: null,
        completed: false,
      }

      const api = createMockApi({ fetcher1: entity })

      const { entity: entity1, events: events1 } = trigger(
        entity,
        asyncHandlers.fetchData,
        { value: 10 },
        api,
      )

      expect(events1).toEqual([
        { type: "#fetcher1:fetchDataRun", payload: { value: 10 } },
      ])

      await asyncHandlers.fetchDataRun(entity1, { value: 10 }, api)

      expect(handlers.run).toHaveBeenCalledWith({ value: 10 }, api)
      expect(api.getEvents()).toContainEqual({
        type: "#fetcher1:fetchDataSuccess",
        payload: { data: 20 },
      })
      expect(api.getEvents()).toContainEqual({
        type: "#fetcher1:fetchDataFinally",
        payload: undefined,
      })

      const { entity: entity2 } = trigger(
        entity1,
        asyncHandlers.fetchDataSuccess,
        { data: 20 },
        api,
      )

      expect(entity2.result).toBe(20)

      const { entity: entity3 } = trigger(
        entity2,
        asyncHandlers.fetchDataFinally,
        undefined,
        api,
      )

      expect(entity3.completed).toBe(true)
    })

    it("should execute run, error, and finally handlers on failure", async () => {
      const testError = new Error("Network error")

      const handlers = {
        run: vi.fn(async () => {
          throw testError
        }),
        error: vi.fn((entity, error) => {
          entity.error = error.message
        }),
        finally: vi.fn((entity) => {
          entity.completed = true
        }),
      }

      const asyncHandlers = handleAsync("fetchData", handlers)

      const entity = {
        type: "DataFetcher",
        id: "fetcher1",
        error: null,
        completed: false,
      }

      const api = createMockApi({ fetcher1: entity })

      await asyncHandlers.fetchDataRun(entity, {}, api)

      expect(api.getEvents()).toContainEqual({
        type: "#fetcher1:fetchDataError",
        payload: testError,
      })
      expect(api.getEvents()).toContainEqual({
        type: "#fetcher1:fetchDataFinally",
        payload: undefined,
      })

      const { entity: entity1 } = trigger(
        entity,
        asyncHandlers.fetchDataError,
        testError,
        api,
      )

      expect(entity1.error).toBe("Network error")

      const { entity: entity2 } = trigger(
        entity1,
        asyncHandlers.fetchDataFinally,
        undefined,
        api,
      )

      expect(entity2.completed).toBe(true)
    })
  })

  describe("start handler", () => {
    it("should execute start handler before run", () => {
      const handlers = {
        start: vi.fn((entity) => {
          entity.loading = true
        }),
        run: vi.fn(async () => ({ data: "test" })),
        success: vi.fn((entity, result) => {
          entity.data = result.data
          entity.loading = false
        }),
      }

      const asyncHandlers = handleAsync("fetchData", handlers)

      const entity = {
        type: "DataFetcher",
        id: "fetcher1",
        loading: false,
        data: null,
      }

      const api = createMockApi({ fetcher1: entity })

      const { events } = trigger(
        entity,
        asyncHandlers.fetchData,
        { id: 123 },
        api,
      )

      expect(events).toEqual([
        { type: "#fetcher1:fetchDataStart", payload: { id: 123 } },
        { type: "#fetcher1:fetchDataRun", payload: { id: 123 } },
      ])

      const startApi = createMockApi({ fetcher1: entity })
      const { entity: entity1 } = trigger(
        entity,
        asyncHandlers.fetchDataStart,
        { id: 123 },
        startApi,
      )

      expect(entity1.loading).toBe(true)
    })

    it("should not create start handler if not provided", () => {
      const handlers = {
        run: vi.fn(async () => ({})),
      }

      const asyncHandlers = handleAsync("fetchData", handlers)

      expect(asyncHandlers.fetchDataStart).toBeUndefined()
    })
  })

  describe("scope options", () => {
    it("should use entity scope by default", () => {
      const handlers = {
        run: vi.fn(async () => ({ data: "test" })),
      }

      const asyncHandlers = handleAsync("fetchData", handlers)

      const entity = { type: "DataFetcher", id: "fetcher1" }
      const api = createMockApi({ fetcher1: entity })

      trigger(entity, asyncHandlers.fetchData, {}, api)

      expect(api.getEvents()).toContainEqual({
        type: "#fetcher1:fetchDataRun",
        payload: {},
      })
    })

    it("should use type scope when specified", () => {
      const handlers = {
        run: vi.fn(async () => ({ data: "test" })),
      }

      const asyncHandlers = handleAsync("fetchData", handlers, {
        scope: "type",
      })

      const entity = { type: "DataFetcher", id: "fetcher1" }
      const api = createMockApi({ fetcher1: entity })

      trigger(entity, asyncHandlers.fetchData, {}, api)

      expect(api.getEvents()).toContainEqual({
        type: "DataFetcher:fetchDataRun",
        payload: {},
      })
    })

    it("should use global scope when specified", () => {
      const handlers = {
        run: vi.fn(async () => ({ data: "test" })),
      }

      const asyncHandlers = handleAsync("fetchData", handlers, {
        scope: "global",
      })

      const entity = { type: "DataFetcher", id: "fetcher1" }
      const api = createMockApi({ fetcher1: entity })

      trigger(entity, asyncHandlers.fetchData, {}, api)

      expect(api.getEvents()).toContainEqual({
        type: "fetchDataRun",
        payload: {},
      })
    })
  })

  describe("optional lifecycle handlers", () => {
    it("should work with only run and success handlers", async () => {
      const handlers = {
        run: vi.fn(async () => ({ value: 42 })),
        success: vi.fn((entity, result) => {
          entity.value = result.value
        }),
      }

      const asyncHandlers = handleAsync("fetchData", handlers)

      const entity = { type: "DataFetcher", id: "fetcher1", value: 0 }
      const api = createMockApi({ fetcher1: entity })

      await asyncHandlers.fetchDataRun(entity, {}, api)

      expect(handlers.run).toHaveBeenCalled()
      expect(api.getEvents()).toContainEqual({
        type: "#fetcher1:fetchDataSuccess",
        payload: { value: 42 },
      })
    })

    it("should work with only run handler", async () => {
      const handlers = {
        run: vi.fn(async () => ({ value: 42 })),
      }

      const asyncHandlers = handleAsync("fetchData", handlers)

      const entity = { type: "DataFetcher", id: "fetcher1" }
      const api = createMockApi({ fetcher1: entity })

      await asyncHandlers.fetchDataRun(entity, {}, api)

      expect(handlers.run).toHaveBeenCalled()
      expect(asyncHandlers.fetchDataSuccess).toBeDefined()
    })

    it("should not call success handler when not provided", async () => {
      const handlers = {
        run: vi.fn(async () => ({ value: 42 })),
        finally: vi.fn((entity) => {
          entity.completed = true
        }),
      }

      const asyncHandlers = handleAsync("fetchData", handlers)

      const entity = {
        type: "DataFetcher",
        id: "fetcher1",
        completed: false,
      }
      const api = createMockApi({ fetcher1: entity })

      await asyncHandlers.fetchDataRun(entity, {}, api)

      const { entity: finalEntity } = trigger(
        entity,
        asyncHandlers.fetchDataFinally,
        undefined,
        api,
      )

      expect(handlers.finally).toHaveBeenCalled()
      expect(finalEntity.completed).toBe(true)
    })
  })

  describe("real-world example: fetch todos", () => {
    it("should handle a complete fetch todos flow", async () => {
      const mockTodos = [
        { id: 1, text: "Buy milk", completed: false },
        { id: 2, text: "Walk dog", completed: true },
      ]

      globalThis.fetch = vi.fn(async () => ({
        ok: true,
        json: async () => mockTodos,
      }))

      const handlers = {
        start: (entity) => {
          entity.status = "loading"
        },
        run: async () => {
          const response = await fetch("/api/todos")
          return response.json()
        },
        success: (entity, todos) => {
          entity.status = "success"
          entity.todos = todos
        },
        error: (entity, error) => {
          entity.status = "error"
          entity.error = error.message
        },
        finally: (entity) => {
          entity.lastFetched = Date.now()
        },
      }

      const asyncHandlers = handleAsync("fetchTodos", handlers)

      const entity = {
        type: "TodoList",
        id: "todos1",
        status: "idle",
        todos: [],
        error: null,
        lastFetched: null,
      }

      const api = createMockApi({ todos1: entity })

      const { entity: entity1, events } = trigger(
        entity,
        asyncHandlers.fetchTodos,
        {},
        api,
      )

      expect(events).toContainEqual({
        type: "#todos1:fetchTodosStart",
        payload: {},
      })
      expect(events).toContainEqual({
        type: "#todos1:fetchTodosRun",
        payload: {},
      })

      const { entity: entity2 } = trigger(
        entity1,
        asyncHandlers.fetchTodosStart,
        {},
        api,
      )

      expect(entity2.status).toBe("loading")

      await asyncHandlers.fetchTodosRun(entity2, {}, api)

      expect(globalThis.fetch).toHaveBeenCalledWith("/api/todos")
      expect(api.getEvents()).toContainEqual({
        type: "#todos1:fetchTodosSuccess",
        payload: mockTodos,
      })

      const { entity: entity3 } = trigger(
        entity2,
        asyncHandlers.fetchTodosSuccess,
        mockTodos,
        api,
      )

      expect(entity3.status).toBe("success")
      expect(entity3.todos).toEqual(mockTodos)

      const { entity: entity4 } = trigger(
        entity3,
        asyncHandlers.fetchTodosFinally,
        undefined,
        api,
      )

      expect(entity4.lastFetched).toBeGreaterThan(0)

      delete globalThis.fetch
    })

    it("should handle fetch errors gracefully", async () => {
      globalThis.fetch = vi.fn(async () => {
        throw new Error("Network error")
      })

      const handlers = {
        start: (entity) => {
          entity.status = "loading"
        },
        run: async () => {
          const response = await fetch("/api/todos")
          return response.json()
        },
        error: (entity, error) => {
          entity.status = "error"
          entity.error = error.message
        },
      }

      const asyncHandlers = handleAsync("fetchTodos", handlers)

      const entity = {
        type: "TodoList",
        id: "todos1",
        status: "idle",
        error: null,
      }

      const api = createMockApi({ todos1: entity })

      await asyncHandlers.fetchTodosRun(entity, {}, api)

      expect(api.getEvents()).toContainEqual({
        type: "#todos1:fetchTodosError",
        payload: expect.objectContaining({ message: "Network error" }),
      })

      const { entity: errorEntity } = trigger(
        entity,
        asyncHandlers.fetchTodosError,
        new Error("Network error"),
        api,
      )

      expect(errorEntity.status).toBe("error")
      expect(errorEntity.error).toBe("Network error")

      delete globalThis.fetch
    })
  })

  describe("integration with entity type", () => {
    it("should integrate cleanly into an entity type definition", async () => {
      const todoList = {
        init(entity) {
          entity.todos = []
          entity.status = "idle"
        },

        addTodo(entity, text) {
          entity.todos.push({
            id: Date.now(),
            text,
            completed: false,
          })
        },

        ...handleAsync("fetchTodos", {
          start: (entity) => {
            entity.status = "loading"
          },
          run: async () => {
            const response = await fetch("/api/todos")
            return response.json()
          },
          success: (entity, todos) => {
            entity.status = "success"
            entity.todos = todos
          },
          error: (entity, error) => {
            entity.status = "error"
            entity.error = error.message
          },
        }),
      }

      expect(todoList.fetchTodos).toBeDefined()
      expect(todoList.fetchTodosStart).toBeDefined()
      expect(todoList.fetchTodosRun).toBeDefined()
      expect(todoList.fetchTodosSuccess).toBeDefined()
      expect(todoList.fetchTodosError).toBeDefined()
      expect(todoList.fetchTodosFinally).toBeDefined()

      expect(todoList.init).toBeDefined()
      expect(todoList.addTodo).toBeDefined()
    })
  })

  describe("edge cases", () => {
    it("should handle payload correctly through the chain", async () => {
      const payloadLog = []

      const handlers = {
        start: (entity, payload) => {
          payloadLog.push({ handler: "start", payload })
        },
        run: async (payload) => {
          payloadLog.push({ handler: "run", payload })
          return { result: payload.value * 2 }
        },
        success: (entity, result) => {
          payloadLog.push({ handler: "success", result })
        },
      }

      const asyncHandlers = handleAsync("process", handlers)

      const entity = { type: "Processor", id: "proc1" }
      const api = createMockApi({ proc1: entity })

      const originalPayload = { value: 10, extra: "data" }

      trigger(entity, asyncHandlers.process, originalPayload, api)
      trigger(entity, asyncHandlers.processStart, originalPayload, api)
      await asyncHandlers.processRun(entity, originalPayload, api)

      trigger(entity, asyncHandlers.processSuccess, { result: 20 }, api)

      expect(payloadLog).toEqual([
        { handler: "start", payload: originalPayload },
        { handler: "run", payload: originalPayload },
        { handler: "success", result: { result: 20 } },
      ])
    })

    it("should call finally even when success/error handlers throw", async () => {
      const handlers = {
        run: async () => ({ data: "test" }),
        success: () => {
          throw new Error("Success handler error")
        },
        finally: vi.fn((entity) => {
          entity.cleanedUp = true
        }),
      }

      const asyncHandlers = handleAsync("fetchData", handlers)

      const entity = { type: "DataFetcher", id: "fetcher1" }
      const api = createMockApi({ fetcher1: entity })

      await asyncHandlers.fetchDataRun(entity, {}, api)

      expect(api.getEvents()).toContainEqual({
        type: "#fetcher1:fetchDataFinally",
        payload: undefined,
      })
    })

    it("should handle multiple async operations on same entity", async () => {
      const handlers1 = {
        run: vi.fn(async () => ({ data: "op1" })),
      }
      const handlers2 = {
        run: vi.fn(async () => ({ data: "op2" })),
      }

      const asyncHandlers1 = handleAsync("operation1", handlers1)
      const asyncHandlers2 = handleAsync("operation2", handlers2)

      const type = {
        ...asyncHandlers1,
        ...asyncHandlers2,
      }

      expect(type.operation1).toBeDefined()
      expect(type.operation1Run).toBeDefined()
      expect(type.operation2).toBeDefined()
      expect(type.operation2Run).toBeDefined()

      const entity = { type: "Multi", id: "multi1" }
      const api = createMockApi({ multi1: entity })

      await type.operation1Run(entity, {}, api)
      await type.operation2Run(entity, {}, api)

      expect(handlers1.run).toHaveBeenCalled()
      expect(handlers2.run).toHaveBeenCalled()
    })
  })
})
