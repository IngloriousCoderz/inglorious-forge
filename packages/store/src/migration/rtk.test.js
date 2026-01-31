import { describe, expect, it, vi } from "vitest"

import { createMockApi, trigger } from "../test"
import { convertAsyncThunk, convertSlice, createRTKCompatDispatch } from "./rtk"

describe("RTK Adapter", () => {
  describe("convertAsyncThunk", () => {
    it("should convert a basic async thunk to handleAsync handlers", () => {
      const payloadCreator = vi.fn(async (userId) => {
        return { id: userId, name: "Test User" }
      })

      const handlers = convertAsyncThunk("fetchUser", payloadCreator, {
        onPending: (entity) => {
          entity.loading = true
        },
        onFulfilled: (entity, user) => {
          entity.loading = false
          entity.user = user
        },
        onRejected: (entity, error) => {
          entity.loading = false
          entity.error = error.message
        },
      })

      // Should have all the async handlers
      expect(handlers.fetchUser).toBeDefined()
      expect(handlers.fetchUserStart).toBeDefined()
      expect(handlers.fetchUserRun).toBeDefined()
      expect(handlers.fetchUserSuccess).toBeDefined()
      expect(handlers.fetchUserError).toBeDefined()
    })

    it("should execute the full async lifecycle", async () => {
      const payloadCreator = async (userId) => {
        return { id: userId, name: "John Doe" }
      }

      const handlers = convertAsyncThunk("fetchUser", payloadCreator, {
        onPending: (entity) => {
          entity.loading = true
        },
        onFulfilled: (entity, user) => {
          entity.loading = false
          entity.user = user
        },
      })

      const entity = {
        type: "userProfile",
        id: "profile1",
        loading: false,
        user: null,
      }

      const api = createMockApi({ profile1: entity })

      // Start
      const { entity: entity1 } = trigger(
        entity,
        handlers.fetchUserStart,
        123,
        api,
      )
      expect(entity1.loading).toBe(true)

      // Run
      await handlers.fetchUserRun(entity1, 123, api)

      // Success
      const { entity: entity2 } = trigger(
        entity1,
        handlers.fetchUserSuccess,
        { id: 123, name: "John Doe" },
        api,
      )
      expect(entity2.loading).toBe(false)
      expect(entity2.user).toEqual({ id: 123, name: "John Doe" })
    })

    it("should work without optional handlers", () => {
      const payloadCreator = async () => ({ data: "test" })

      const handlers = convertAsyncThunk("fetch", payloadCreator)

      // Should still have run handlers
      expect(handlers.fetch).toBeDefined()
      expect(handlers.fetchRun).toBeDefined()

      // Should not have start since onPending not provided
      expect(handlers.fetchStart).toBeUndefined()
    })
  })

  describe("convertSlice", () => {
    it("should convert a simple RTK slice to Inglorious type", () => {
      // Mock RTK slice
      const todosSlice = {
        name: "todos",
        getInitialState: () => ({
          items: [],
          filter: "all",
        }),
        caseReducers: {
          addTodo: (state, action) => {
            state.items.push({
              id: Date.now(),
              text: action.payload,
              completed: false,
            })
          },
          toggleTodo: (state, action) => {
            const todo = state.items.find((t) => t.id === action.payload)
            if (todo) {
              todo.completed = !todo.completed
            }
          },
          setFilter: (state, action) => {
            state.filter = action.payload
          },
        },
      }

      const todoType = convertSlice(todosSlice)

      // Should have init
      expect(todoType.init).toBeDefined()

      // Should have all reducers as handlers
      expect(todoType.addTodo).toBeDefined()
      expect(todoType.toggleTodo).toBeDefined()
      expect(todoType.setFilter).toBeDefined()
    })

    it("should initialize entity with initialState", () => {
      const counterSlice = {
        name: "counter",
        getInitialState: () => ({
          value: 0,
          step: 1,
        }),
        caseReducers: {},
      }

      const counterType = convertSlice(counterSlice)

      const entity = { type: "counter", id: "counter1" }
      const api = createMockApi({ counter1: entity })

      const { entity: initialized } = trigger(entity, counterType.init, {}, api)

      expect(initialized.value).toBe(0)
      expect(initialized.step).toBe(1)
    })

    it("should execute reducers as event handlers", () => {
      const counterSlice = {
        name: "counter",
        getInitialState: () => ({ value: 0 }),
        caseReducers: {
          increment: (state, action) => {
            state.value += action.payload || 1
          },
          decrement: (state) => {
            state.value -= 1
          },
        },
      }

      const counterType = convertSlice(counterSlice)

      let entity = { type: "counter", id: "counter1", value: 5 }
      const api = createMockApi({ counter1: entity })

      // Increment
      const { entity: entity1 } = trigger(entity, counterType.increment, 3, api)
      expect(entity1.value).toBe(8)

      // Decrement
      const { entity: entity2 } = trigger(
        entity1,
        counterType.decrement,
        undefined,
        api,
      )
      expect(entity2.value).toBe(7)
    })

    it("should convert async thunks", () => {
      const todosSlice = {
        name: "todos",
        getInitialState: () => ({ items: [], status: "idle" }),
        caseReducers: {
          addTodo: (state, action) => {
            state.items.push(action.payload)
          },
        },
      }

      const todoType = convertSlice(todosSlice, {
        asyncThunks: {
          fetchTodos: {
            payloadCreator: async () => {
              return [{ id: 1, text: "Test" }]
            },
            onPending: (entity) => {
              entity.status = "loading"
            },
            onFulfilled: (entity, todos) => {
              entity.status = "success"
              entity.items = todos
            },
          },
        },
      })

      // Should have sync handlers
      expect(todoType.addTodo).toBeDefined()

      // Should have async handlers
      expect(todoType.fetchTodos).toBeDefined()
      expect(todoType.fetchTodosStart).toBeDefined()
      expect(todoType.fetchTodosRun).toBeDefined()
      expect(todoType.fetchTodosSuccess).toBeDefined()
    })
  })

  describe("createRTKCompatDispatch", () => {
    it("should convert RTK actions to Inglorious events", () => {
      const api = createMockApi({})

      const dispatch = createRTKCompatDispatch(api, "todos")

      // Dispatch RTK-style action
      dispatch({
        type: "todos/addTodo",
        payload: "Buy milk",
      })

      expect(api.getEvents()).toEqual([
        {
          type: "#todos:addTodo",
          payload: "Buy milk",
        },
      ])
    })

    it("should handle actions without payload", () => {
      const api = createMockApi({})

      const dispatch = createRTKCompatDispatch(api, "counter")

      dispatch({ type: "counter/increment" })

      expect(api.getEvents()).toEqual([
        {
          type: "#counter:increment",
          payload: undefined,
        },
      ])
    })

    it("should warn on thunk dispatch", () => {
      const api = createMockApi({})
      const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {})

      const dispatch = createRTKCompatDispatch(api, "todos")

      // Try to dispatch a thunk
      dispatch(() => {})

      expect(consoleWarn).toHaveBeenCalledWith(
        "Thunks are not supported in RTK compat mode",
      )

      consoleWarn.mockRestore()
    })
  })

  describe("Real-world migration example", () => {
    it("should migrate a complete RTK slice to Inglorious", async () => {
      // Original RTK slice
      const todosSlice = {
        name: "todos",
        getInitialState: () => ({
          items: [],
          status: "idle",
          error: null,
        }),
        caseReducers: {
          addTodo: (state, action) => {
            state.items.push({
              id: Date.now(),
              text: action.payload,
              completed: false,
            })
          },
          toggleTodo: (state, action) => {
            const todo = state.items.find((t) => t.id === action.payload)
            if (todo) {
              todo.completed = !todo.completed
            }
          },
          removeTodo: (state, action) => {
            state.items = state.items.filter((t) => t.id !== action.payload)
          },
        },
      }

      // Convert to Inglorious
      const todoList = convertSlice(todosSlice, {
        asyncThunks: {
          fetchTodos: {
            payloadCreator: async () => {
              // Simulate API call
              return [
                { id: 1, text: "Buy milk", completed: false },
                { id: 2, text: "Walk dog", completed: true },
              ]
            },
            onPending: (entity) => {
              entity.status = "loading"
            },
            onFulfilled: (entity, todos) => {
              entity.status = "success"
              entity.items = todos
            },
            onRejected: (entity, error) => {
              entity.status = "error"
              entity.error = error.message
            },
          },
        },
      })

      // Initialize entity
      let entity = { type: "todoList", id: "todos" }
      const api = createMockApi({ todos: entity })

      // Init
      const { entity: entity1 } = trigger(entity, todoList.init, {}, api)
      expect(entity1.items).toEqual([])
      expect(entity1.status).toBe("idle")

      // Add todo
      const { entity: entity2 } = trigger(
        entity1,
        todoList.addTodo,
        "New todo",
        api,
      )
      expect(entity2.items).toHaveLength(1)
      expect(entity2.items[0].text).toBe("New todo")

      // Fetch todos
      const { entity: entity3 } = trigger(
        entity2,
        todoList.fetchTodosStart,
        {},
        api,
      )
      expect(entity3.status).toBe("loading")

      await todoList.fetchTodosRun(entity3, {}, api)

      const { entity: entity4 } = trigger(
        entity3,
        todoList.fetchTodosSuccess,
        [
          { id: 1, text: "Buy milk", completed: false },
          { id: 2, text: "Walk dog", completed: true },
        ],
        api,
      )

      expect(entity4.status).toBe("success")
      expect(entity4.items).toHaveLength(2)
      expect(entity4.items[0].text).toBe("Buy milk")

      // Toggle todo
      const { entity: entity5 } = trigger(entity4, todoList.toggleTodo, 1, api)
      expect(entity5.items[0].completed).toBe(true)

      // Remove todo
      const { entity: entity6 } = trigger(entity5, todoList.removeTodo, 1, api)
      expect(entity6.items).toHaveLength(1)
      expect(entity6.items[0].id).toBe(2)
    })
  })
})
