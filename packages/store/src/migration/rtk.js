/**
 * @fileoverview Adapter for migrating Redux Toolkit code to Inglorious Store
 *
 * This module provides utilities to convert RTK slices and async thunks into
 * Inglorious types, enabling gradual migration from RTK to Inglorious Store.
 */

import { extend } from "@inglorious/utils/data-structures/objects.js"

import { handleAsync } from "../async"

const SEP_LENGTH = 50
const INDENT_SPACES = 2
const SLICE_PLUS_ACTION = 2
const THUNK_STAGES = ["pending", "fulfilled", "rejected", "settled"]

/**
 * Converts an RTK createAsyncThunk to Inglorious handleAsync handlers
 *
 * @param {string} name - The thunk name (e.g., 'fetchTodos')
 * @param {Function} payloadCreator - The async function that performs the operation
 * @param {Object} [options] - Options for the conversion
 * @param {Function} [options.onPending] - Handler for pending state (maps to start)
 * @param {Function} [options.onFulfilled] - Handler for fulfilled state (maps to success)
 * @param {Function} [options.onRejected] - Handler for rejected state (maps to error)
 * @param {Function} [options.onSettled] - Handler called after completion (maps to finally)
 * @param {"entity"|"type"|"global"} [options.scope] - Event scope
 *
 * @returns {Object} Inglorious handleAsync handlers
 *
 * @example
 * // RTK async thunk
 * const fetchTodos = createAsyncThunk(
 *   'todos/fetch',
 *   async (userId) => {
 *     const response = await fetch(`/api/users/${userId}/todos`)
 *     return response.json()
 *   }
 * )
 *
 * // Convert to Inglorious
 * const todoHandlers = convertAsyncThunk('fetchTodos', fetchTodos.payloadCreator, {
 *   onPending: (entity) => { entity.status = 'loading' },
 *   onFulfilled: (entity, todos) => {
 *     entity.status = 'success'
 *     entity.todos = todos
 *   },
 *   onRejected: (entity, error) => {
 *     entity.status = 'error'
 *     entity.error = error.message
 *   }
 * })
 *
 * // Use in type
 * const todoList = {
 *   create(entity) { entity.todos = []; entity.status = 'idle' },
 *   ...todoHandlers
 * }
 */
export function convertAsyncThunk(name, payloadCreator, options = {}) {
  const {
    onPending,
    onFulfilled,
    onRejected,
    onSettled,
    scope = "entity",
  } = options

  return handleAsync(
    name,
    {
      start: onPending
        ? (entity, payload, api) => {
            onPending(entity, payload, api)
          }
        : undefined,

      run: async (payload, api) => {
        // RTK payloadCreator signature: (arg, thunkAPI)
        // Use dispatch for action compatibility, with notify fallback in tests/minimal APIs.
        const dispatch = api.dispatch
          ? api.dispatch.bind(api)
          : (action) => {
              if (typeof action === "object" && action !== null) {
                api.notify(action.type, action.payload)
              }
            }

        return await payloadCreator(payload, { dispatch })
      },

      success: onFulfilled
        ? (entity, result, api) => {
            onFulfilled(entity, result, api)
          }
        : undefined,

      error: onRejected
        ? (entity, error, api) => {
            onRejected(entity, error, api)
          }
        : undefined,

      finally: onSettled
        ? (entity, api) => {
            onSettled(entity, api)
          }
        : undefined,
    },
    { scope },
  )
}

/**
 * Converts an RTK slice to an Inglorious type
 *
 * This is a helper for gradual migration. It converts RTK reducers to Inglorious
 * event handlers while preserving the same mutation-based syntax (both use Immer/Mutative).
 *
 * @param {Object} slice - RTK slice created with createSlice
 * @param {Object} [options] - Conversion options
 * @param {Object} [options.asyncThunks] - Map of async thunk handlers
 *   Keys are thunk names, values are objects with onPending/onFulfilled/onRejected
 * @param {Object} [options.extraHandlers] - Additional event handlers not from the slice
 *
 * @returns {Object} Inglorious type definition
 *
 * @example
 * // RTK slice
 * const todosSlice = createSlice({
 *   name: 'todos',
 *   initialState: { items: [], filter: 'all' },
 *   reducers: {
 *     addTodo: (state, action) => {
 *       state.items.push({ id: Date.now(), text: action.payload })
 *     },
 *     toggleTodo: (state, action) => {
 *       const todo = state.items.find(t => t.id === action.payload)
 *       if (todo) todo.completed = !todo.completed
 *     },
 *     setFilter: (state, action) => {
 *       state.filter = action.payload
 *     }
 *   }
 * })
 *
 * const fetchTodos = createAsyncThunk('todos/fetch', async () => {
 *   const response = await fetch('/api/todos')
 *   return response.json()
 * })
 *
 * // Convert to Inglorious
 * const todoList = convertSlice(todosSlice, {
 *   asyncThunks: {
 *     fetchTodos: {
 *       onPending: (entity) => { entity.status = 'loading' },
 *       onFulfilled: (entity, todos) => { entity.items = todos },
 *       onRejected: (entity, error) => { entity.error = error.message }
 *     }
 *   }
 * })
 *
 * // Use in store
 * const store = createStore({
 *   types: { todoList },
 *   entities: { todos: { type: 'todoList', id: 'todos' } }
 * })
 */
export function convertSlice(slice, options = {}) {
  const { asyncThunks = {}, extraHandlers = {}, extraActions = [] } = options

  const type = {
    // Convert initialState to create handler.
    // Preserve explicitly preloaded fields from entities (common in tests/SSR hydration).
    create(entity) {
      const initialState = slice.getInitialState()
      Object.assign(entity, extend(initialState, entity))
    },
  }

  // Convert each reducer to an event handler
  for (const [actionName, reducer] of Object.entries(slice.caseReducers)) {
    const thunkConfig = asyncThunks[actionName]
    const isAsyncThunkReducer =
      reducer &&
      typeof reducer === "object" &&
      THUNK_STAGES.some((stage) => typeof reducer[stage] === "function")

    if (isAsyncThunkReducer) {
      const pending = toLifecycleHandler(
        slice.name,
        actionName,
        "pending",
        reducer.pending,
      )
      const fulfilled = toLifecycleHandler(
        slice.name,
        actionName,
        "fulfilled",
        reducer.fulfilled,
      )
      const rejected = toLifecycleHandler(
        slice.name,
        actionName,
        "rejected",
        reducer.rejected,
      )
      const settled = toLifecycleHandler(
        slice.name,
        actionName,
        "settled",
        reducer.settled,
      )

      if (thunkConfig?.payloadCreator) {
        const asyncHandlers = convertAsyncThunk(
          actionName,
          thunkConfig.payloadCreator,
          {
            onPending: thunkConfig.onPending || pending,
            onFulfilled: thunkConfig.onFulfilled || fulfilled,
            onRejected: thunkConfig.onRejected || rejected,
            onSettled: thunkConfig.onSettled || settled,
            scope: thunkConfig.scope,
          },
        )

        Object.assign(type, asyncHandlers)
      } else {
        if (pending) {
          type[`${actionName}Pending`] = pending
          type[`${slice.name}/${actionName}/pending`] = pending
        }
        if (fulfilled) {
          type[`${actionName}Fulfilled`] = fulfilled
          type[`${slice.name}/${actionName}/fulfilled`] = fulfilled
        }
        if (rejected) {
          type[`${actionName}Rejected`] = rejected
          type[`${slice.name}/${actionName}/rejected`] = rejected
        }
        if (settled) {
          type[`${actionName}Settled`] = settled
          type[`${slice.name}/${actionName}/settled`] = settled
        }
      }

      continue
    }

    const handler = (entity, payload) => {
      // Create a mock action object for the RTK reducer
      const action = { type: `${slice.name}/${actionName}`, payload }

      // RTK reducers expect to mutate state directly (via Immer)
      // Inglorious handlers do the same (via Mutative)
      // So we can call the reducer directly on the entity
      reducer(entity, action)
    }

    // Expose both Inglorious-style event names and RTK action-type aliases.
    // This enables direct dispatch of RTK slice actions without extra bridge wiring.
    type[actionName] = handler
    type[`${slice.name}/${actionName}`] = handler
  }

  // Convert explicitly configured async thunks that are not embedded in slice reducers.
  for (const [thunkName, thunkHandlers] of Object.entries(asyncThunks)) {
    if (thunkHandlers?.payloadCreator && !type[thunkName]) {
      const asyncHandlers = convertAsyncThunk(
        thunkName,
        thunkHandlers.payloadCreator,
        {
          onPending: thunkHandlers.onPending,
          onFulfilled: thunkHandlers.onFulfilled,
          onRejected: thunkHandlers.onRejected,
          onSettled: thunkHandlers.onSettled,
          scope: thunkHandlers.scope,
        },
      )

      Object.assign(type, asyncHandlers)
    }
  }

  // Register additional RTK action types (e.g. createAction + extraReducers).
  // RTK does not expose extraReducers through slice.caseReducers, so callers can
  // provide the action creators/types explicitly and we route them through slice.reducer.
  for (const action of extraActions) {
    const actionType = typeof action === "string" ? action : action?.type
    if (typeof actionType !== "string" || type[actionType]) continue

    type[actionType] = (entity, payload) => {
      applySliceReducer(entity, slice, actionType, payload)
    }
  }

  // Add any extra handlers
  Object.assign(type, extraHandlers)

  return type
}

/**
 * Creates a migration guide for a slice
 *
 * Analyzes an RTK slice and generates a readable migration guide showing
 * the equivalent Inglorious code.
 *
 * @param {Object} slice - RTK slice
 * @returns {string} Migration guide text
 *
 * @example
 * const guide = createMigrationGuide(todosSlice)
 * console.log(guide)
 * // Outputs:
 * // Migration Guide for 'todos' slice
 * //
 * // RTK:
 * //   dispatch(addTodo('Buy milk'))
 * //
 * // Inglorious:
 * //   api.notify('#todos:addTodo', 'Buy milk')
 */
export function createMigrationGuide(slice) {
  const lines = []

  lines.push(`Migration Guide for '${slice.name}' slice`)
  lines.push("")
  lines.push("=".repeat(SEP_LENGTH))
  lines.push("")

  // Show state structure
  lines.push("STATE STRUCTURE:")
  lines.push("RTK:")
  lines.push(
    `  state.${slice.name} = ${JSON.stringify(slice.getInitialState(), null, INDENT_SPACES)}`,
  )
  lines.push("")
  lines.push("Inglorious:")
  lines.push(`  entities.${slice.name} = {`)
  lines.push(`    type: '${slice.name}',`)
  lines.push(`    id: '${slice.name}',`)
  const initialState = slice.getInitialState()
  for (const [key, value] of Object.entries(initialState)) {
    lines.push(`    ${key}: ${JSON.stringify(value)},`)
  }
  lines.push("  }")
  lines.push("")
  lines.push("=".repeat(SEP_LENGTH))
  lines.push("")

  // Show each reducer conversion
  lines.push("ACTIONS / EVENTS:")
  for (const actionName of Object.keys(slice.caseReducers)) {
    lines.push("")
    lines.push(`${actionName}:`)
    lines.push("  RTK:")
    lines.push(`    dispatch(${actionName}(payload))`)
    lines.push("  Inglorious:")
    lines.push(`    api.notify('#${slice.name}:${actionName}', payload)`)
  }

  lines.push("")
  lines.push("=".repeat(SEP_LENGTH))
  lines.push("")

  // Show selector conversion
  lines.push("SELECTORS:")
  lines.push("RTK:")
  lines.push(
    `  const data = useSelector(state => state.${slice.name}.someField)`,
  )
  lines.push("Inglorious:")
  lines.push(`  const { someField } = api.getEntity('${slice.name}')`)
  lines.push("  // or")
  lines.push(
    `  const data = useSelector(state => state.entities.${slice.name}.someField)`,
  )

  return lines.join("\n")
}

/**
 * Helper to create a compatibility layer for existing RTK code
 *
 * This allows RTK-style dispatch calls to work with Inglorious Store
 * during the migration period.
 *
 * @param {Object} api - Inglorious API
 * @param {string} entityId - The entity ID to target
 * @returns {Function} A dispatch function compatible with RTK actions
 *
 * @example
 * const dispatch = createRTKCompatDispatch(api, 'todos')
 *
 * // RTK-style action
 * dispatch({ type: 'todos/addTodo', payload: 'Buy milk' })
 *
 * // Translates to:
 * // api.notify('#todos:addTodo', 'Buy milk')
 */
export function createRTKCompatDispatch(api, entityId) {
  return (action) => {
    if (typeof action === "function") {
      // Thunk - not supported in compat mode
      console.warn("Thunks are not supported in RTK compat mode")
      return
    }

    // Extract action type and payload
    const { type, payload } = action

    // Convert RTK action type to Inglorious event
    // RTK: 'todos/addTodo' -> Inglorious: '#todos:addTodo'
    const parts = type.split("/")
    if (parts.length === SLICE_PLUS_ACTION) {
      const [, actionName] = parts
      api.notify(`#${entityId}:${actionName}`, payload)
    } else {
      // Fallback for non-standard action types
      api.notify(`#${entityId}:${type}`, payload)
    }
  }
}

function createActionObject(sliceName, actionName, stage, payload) {
  const action = {
    type: `${sliceName}/${actionName}/${stage}`,
    payload,
    meta: { arg: payload },
  }

  if (stage === "pending") {
    action.payload = undefined
  }

  if (stage === "rejected") {
    action.error = payload
  }

  return action
}

function toLifecycleHandler(sliceName, actionName, stage, reducer) {
  if (typeof reducer !== "function") return undefined

  return (entity, payload) => {
    reducer(entity, createActionObject(sliceName, actionName, stage, payload))
  }
}

function applySliceReducer(entity, slice, actionType, payload) {
  const action = { type: actionType, payload }
  const nextState = slice.reducer(toPlainState(entity), action)

  for (const key of Object.keys(entity)) {
    delete entity[key]
  }

  Object.assign(entity, nextState)
}

function toPlainState(entity) {
  return JSON.parse(JSON.stringify(entity))
}
