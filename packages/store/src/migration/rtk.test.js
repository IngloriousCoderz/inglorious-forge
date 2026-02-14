import {
  asyncThunkCreator,
  buildCreateSlice,
  createAction,
  createSlice,
} from "@reduxjs/toolkit"
import { describe, expect, it, vi } from "vitest"

import { createMockApi, trigger } from "../test"
import { convertAsyncThunk, convertSlice, createRTKCompatDispatch } from "./rtk"

const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
})

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

    it("should provide thunkAPI.dispatch to payloadCreator", async () => {
      const payloadCreator = vi.fn(async (_, thunkAPI) => {
        thunkAPI.dispatch({ type: "todos/addTodo", payload: "Buy milk" })
        return { ok: true }
      })

      const handlers = convertAsyncThunk("fetchTodos", payloadCreator)
      const entity = { type: "todos", id: "todos1" }
      const api = createMockApi({ todos1: entity })

      await handlers.fetchTodosRun(entity, null, api)

      expect(payloadCreator).toHaveBeenCalled()
      expect(api.getEvents()).toContainEqual({
        type: "todos/addTodo",
        payload: "Buy milk",
      })
    })
  })

  describe("convertSlice", () => {
    it("should convert a simple RTK slice to Inglorious type", () => {
      const todosSlice = createSlice({
        name: "todos",
        initialState: {
          items: [],
          filter: "all",
        },
        reducers: {
          addTodo(state, action) {
            state.items.push({
              id: Date.now(),
              text: action.payload,
              completed: false,
            })
          },
          toggleTodo(state, action) {
            const todo = state.items.find((t) => t.id === action.payload)
            if (todo) {
              todo.completed = !todo.completed
            }
          },
          setFilter(state, action) {
            state.filter = action.payload
          },
        },
      })

      const todoType = convertSlice(todosSlice)

      // Should have create
      expect(todoType.create).toBeDefined()

      // Should have all reducers as handlers
      expect(todoType.addTodo).toBeDefined()
      expect(todoType.toggleTodo).toBeDefined()
      expect(todoType.setFilter).toBeDefined()
    })

    it("should initialize entity with initialState", () => {
      const counterSlice = createSlice({
        name: "counter",
        initialState: {
          value: 0,
          step: 1,
        },
        reducers: {},
      })

      const counterType = convertSlice(counterSlice)

      const entity = { type: "counter", id: "counter1" }
      const api = createMockApi({ counter1: entity })

      const { entity: initialized } = trigger(
        entity,
        counterType.create,
        {},
        api,
      )

      expect(initialized.value).toBe(0)
      expect(initialized.step).toBe(1)
    })

    it("should preserve preloaded fields when create runs", () => {
      const todosSlice = createSlice({
        name: "todos",
        initialState: {
          items: [],
          filter: "all",
        },
        reducers: {},
      })

      const todoType = convertSlice(todosSlice)
      const api = createMockApi({
        todos: {
          type: "todoList",
          id: "todos",
          items: [{ id: 1, text: "Keep me" }],
        },
      })

      const { entity } = trigger(
        {
          type: "todoList",
          id: "todos",
          items: [{ id: 1, text: "Keep me" }],
        },
        todoType.create,
        undefined,
        api,
      )

      expect(entity.items).toEqual([{ id: 1, text: "Keep me" }])
      expect(entity.filter).toBe("all")
    })

    it("should execute reducers as event handlers", () => {
      const counterSlice = createSlice({
        name: "counter",
        initialState: { value: 0 },
        reducers: {
          increment(state, action) {
            state.value += action.payload || 1
          },
          decrement(state) {
            state.value -= 1
          },
        },
      })

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

    it("should expose RTK action-type aliases for reducers", () => {
      const counterSlice = createSlice({
        name: "counter",
        initialState: { value: 0 },
        reducers: {
          increment(state, action) {
            state.value += action.payload || 1
          },
        },
      })

      const counterType = convertSlice(counterSlice)
      const api = createMockApi({
        counter1: { type: "counter", id: "counter1", value: 1 },
      })

      const { entity } = trigger(
        { type: "counter", id: "counter1", value: 1 },
        counterType["counter/increment"],
        2,
        api,
      )
      expect(entity.value).toBe(3)
    })

    it("should map createAction + extraReducers via extraActions option", () => {
      const formSubmit = createAction("formSubmit")
      const clearClick = createAction("clearClick")

      const listSlice = createSlice({
        name: "list",
        initialState: { tasks: [] },
        reducers: {},
        extraReducers: (builder) => {
          builder
            .addCase(formSubmit, (state, action) => {
              state.tasks.push({ id: 1, text: action.payload })
            })
            .addCase(clearClick, (state) => {
              state.tasks = state.tasks.filter((task) => !task.completed)
            })
        },
      })

      const listType = convertSlice(listSlice, {
        extraActions: [formSubmit, clearClick],
      })
      const api = createMockApi({
        list1: { type: "list", id: "list1", tasks: [] },
      })

      const { entity: entity1 } = trigger(
        { type: "list", id: "list1", tasks: [] },
        listType.formSubmit,
        "Buy milk",
        api,
      )
      expect(entity1.tasks).toEqual([{ id: 1, text: "Buy milk" }])

      const { entity: entity2 } = trigger(
        {
          type: "list",
          id: "list1",
          tasks: [
            { id: 1, text: "Buy milk", completed: true },
            { id: 2, text: "Walk dog", completed: false },
          ],
        },
        listType.clearClick,
        undefined,
        api,
      )
      expect(entity2.tasks).toEqual([
        { id: 2, text: "Walk dog", completed: false },
      ])
    })

    it("should convert async thunks", () => {
      const todosSlice = createSlice({
        name: "todos",
        initialState: { items: [], status: "idle" },
        reducers: {
          addTodo(state, action) {
            state.items.push(action.payload)
          },
        },
      })

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

    it("should convert create.asyncThunk lifecycle reducers", () => {
      const todosSlice = createAppSlice({
        name: "todos",
        initialState: {
          loading: false,
          todos: [],
        },
        reducers: (create) => ({
          deleteTodo: create.reducer((state, action) => {
            state.todos.splice(action.payload, 1)
          }),
          addTodo: create.preparedReducer(
            (text) => ({ payload: { id: "id-1", text } }),
            (state, action) => {
              state.todos.push(action.payload)
            },
          ),
          fetchTodo: create.asyncThunk(
            async (id) => ({ id, text: `todo-${id}` }),
            {
              pending: (state) => {
                state.loading = true
              },
              rejected: (state) => {
                state.loading = false
              },
              fulfilled: (state, action) => {
                state.loading = false
                state.todos.push(action.payload)
              },
            },
          ),
        }),
      })

      const todoType = convertSlice(todosSlice)
      expect(todoType.addTodo).toBeDefined()
      expect(todoType.fetchTodoPending).toBeDefined()
      expect(todoType.fetchTodoFulfilled).toBeDefined()
      expect(todoType.fetchTodoRejected).toBeDefined()

      const api = createMockApi({ todos: { type: "todoList", id: "todos" } })
      const { entity: e1 } = trigger(
        { type: "todoList", id: "todos", loading: false, todos: [] },
        todoType.fetchTodoPending,
        "1",
        api,
      )
      expect(e1.loading).toBe(true)

      const { entity: e2 } = trigger(
        e1,
        todoType.fetchTodoFulfilled,
        { id: "1", text: "todo-1" },
        api,
      )
      expect(e2.loading).toBe(false)
      expect(e2.todos).toEqual([{ id: "1", text: "todo-1" }])

      const { entity: e3 } = trigger(
        { type: "todoList", id: "todos", loading: false, todos: [] },
        todoType["todos/fetchTodo/pending"],
        "1",
        api,
      )
      expect(e3.loading).toBe(true)
    })

    it("should run create.asyncThunk with payloadCreator override", async () => {
      const fetchTodoPayloadCreator = async (id) => ({ id, text: `todo-${id}` })
      const todosSlice = createAppSlice({
        name: "todos",
        initialState: {
          loading: false,
          todos: [],
        },
        reducers: (create) => ({
          fetchTodo: create.asyncThunk(fetchTodoPayloadCreator, {
            pending: (state) => {
              state.loading = true
            },
            rejected: (state) => {
              state.loading = false
            },
            fulfilled: (state, action) => {
              state.loading = false
              state.todos.push(action.payload)
            },
          }),
        }),
      })

      const todoType = convertSlice(todosSlice, {
        asyncThunks: {
          fetchTodo: {
            payloadCreator: fetchTodoPayloadCreator,
          },
        },
      })

      expect(todoType.fetchTodo).toBeDefined()
      expect(todoType.fetchTodoStart).toBeDefined()
      expect(todoType.fetchTodoRun).toBeDefined()
      expect(todoType.fetchTodoSuccess).toBeDefined()

      const api = createMockApi({ todos: { type: "todoList", id: "todos" } })

      const { entity: e1 } = trigger(
        { type: "todoList", id: "todos", loading: false, todos: [] },
        todoType.fetchTodoStart,
        "1",
        api,
      )
      expect(e1.loading).toBe(true)

      await todoType.fetchTodoRun(e1, "1", api)

      const { entity: e2 } = trigger(
        e1,
        todoType.fetchTodoSuccess,
        { id: "1", text: "todo-1" },
        api,
      )
      expect(e2.loading).toBe(false)
      expect(e2.todos).toEqual([{ id: "1", text: "todo-1" }])
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
      const todosSlice = createSlice({
        name: "todos",
        initialState: {
          items: [],
          status: "idle",
          error: null,
        },
        reducers: {
          addTodo(state, action) {
            state.items.push({
              id: Date.now(),
              text: action.payload,
              completed: false,
            })
          },
          toggleTodo(state, action) {
            const todo = state.items.find((t) => t.id === action.payload)
            if (todo) {
              todo.completed = !todo.completed
            }
          },
          removeTodo(state, action) {
            state.items = state.items.filter((t) => t.id !== action.payload)
          },
        },
      })

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

      // Create
      const { entity: entity1 } = trigger(entity, todoList.create, {}, api)
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
