import { Api, BaseEntity } from "../store"

/**
 * RTK-compatible thunk API
 * Minimal subset needed for payload creators
 */
export interface ThunkAPI {
  dispatch: Api["notify"]
  // Add other thunk API properties as needed
  // getState, extra, requestId, signal, rejectWithValue, fulfillWithValue
}

/**
 * RTK async thunk payload creator function
 */
export type PayloadCreator<TPayload = any, TResult = any> = (
  arg: TPayload,
  thunkAPI: ThunkAPI,
) => Promise<TResult> | TResult

/**
 * Options for converting an async thunk
 */
export interface ConvertAsyncThunkOptions<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
> {
  /**
   * Handler for pending state (RTK: addCase(thunk.pending))
   * Maps to handleAsync 'start'
   */
  onPending?: (entity: TEntity, payload: TPayload, api: Api) => void

  /**
   * Handler for fulfilled state (RTK: addCase(thunk.fulfilled))
   * Maps to handleAsync 'success'
   */
  onFulfilled?: (entity: TEntity, result: TResult, api: Api) => void

  /**
   * Handler for rejected state (RTK: addCase(thunk.rejected))
   * Maps to handleAsync 'error'
   */
  onRejected?: (entity: TEntity, error: any, api: Api) => void

  /**
   * Handler called after operation completes (success or failure)
   * Maps to handleAsync 'finally'
   */
  onSettled?: (entity: TEntity, api: Api) => void

  /**
   * Event scope for lifecycle handlers
   * @default "entity"
   */
  scope?: "entity" | "type" | "global"
}

/**
 * RTK slice reducer function
 */
export type SliceReducer<TState = any, TPayload = any> = (
  state: TState,
  action: { type: string; payload: TPayload },
) => void

/**
 * RTK slice structure (minimal subset)
 */
export interface RTKSlice<TState = any> {
  /**
   * Slice name (used in action types)
   */
  name: string

  /**
   * Function that returns initial state
   */
  getInitialState: () => TState

  /**
   * Map of case reducers
   */
  caseReducers: Record<string, SliceReducer<TState, any>>

  /**
   * Optional: The combined reducer function
   */
  reducer?: (state: TState, action: any) => TState
}

/**
 * Async thunk configuration for slice conversion
 */
export interface AsyncThunkConfig<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
> {
  /**
   * The async operation to perform
   */
  payloadCreator?: PayloadCreator<TPayload, TResult>

  /**
   * Handler for pending state
   */
  onPending?: (entity: TEntity, payload: TPayload, api: Api) => void

  /**
   * Handler for fulfilled state
   */
  onFulfilled?: (entity: TEntity, result: TResult, api: Api) => void

  /**
   * Handler for rejected state
   */
  onRejected?: (entity: TEntity, error: any, api: Api) => void

  /**
   * Handler called after completion
   */
  onSettled?: (entity: TEntity, api: Api) => void

  /**
   * Event scope
   */
  scope?: "entity" | "type" | "global"
}

/**
 * Options for converting a slice
 */
export interface ConvertSliceOptions<TEntity extends BaseEntity = BaseEntity> {
  /**
   * Map of async thunks to convert
   * Key is the thunk name, value is the thunk configuration
   */
  asyncThunks?: Record<string, AsyncThunkConfig<TEntity, any, any>>

  /**
   * Additional event handlers not from the slice
   * These will be merged into the resulting type
   */
  extraHandlers?: Record<
    string,
    (entity: TEntity, payload?: any, api?: Api) => void
  >

  /**
   * Additional RTK actions to map (useful for createAction + extraReducers).
   * Accepts action creators (with a `type` field) or raw action type strings.
   */
  extraActions?: Array<string | { type: string }>
}

/**
 * Inglorious type definition (minimal structure)
 */
export interface InglorisousType<TEntity extends BaseEntity = BaseEntity> {
  /**
   * Initialization handler
   */
  create?: (entity: TEntity, payload?: any, api?: Api) => void

  /**
   * Other event handlers
   */
  [key: string]:
    | ((entity: TEntity, payload?: any, api?: Api) => void | Promise<void>)
    | undefined
}

/**
 * Converts an RTK createAsyncThunk to Inglorious handleAsync handlers
 *
 * This function adapts RTK's pending/fulfilled/rejected lifecycle to
 * Inglorious's start/run/success/error/finally lifecycle.
 *
 * @template TEntity - The entity type
 * @template TPayload - The payload type
 * @template TResult - The result type returned by the async operation
 *
 * @param name - The thunk name (e.g., 'fetchTodos')
 * @param payloadCreator - The async function that performs the operation
 * @param options - Lifecycle handlers and configuration
 * @returns Inglorious handleAsync event handlers
 *
 * @example
 * ```typescript
 * interface User {
 *   id: number
 *   name: string
 * }
 *
 * interface UserEntity extends BaseEntity {
 *   type: 'user'
 *   currentUser: User | null
 *   loading: boolean
 *   error: string | null
 * }
 *
 * const userHandlers = convertAsyncThunk<UserEntity, number, User>(
 *   'fetchUser',
 *   async (userId, thunkAPI) => {
 *     const response = await fetch(`/api/users/${userId}`)
 *     return response.json()
 *   },
 *   {
 *     onPending: (entity) => {
 *       entity.loading = true
 *       entity.error = null
 *     },
 *     onFulfilled: (entity, user) => {
 *       entity.loading = false
 *       entity.currentUser = user
 *     },
 *     onRejected: (entity, error) => {
 *       entity.loading = false
 *       entity.error = error.message
 *     }
 *   }
 * )
 * ```
 */
export function convertAsyncThunk<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
>(
  name: string,
  payloadCreator: PayloadCreator<TPayload, TResult>,
  options?: ConvertAsyncThunkOptions<TEntity, TPayload, TResult>,
): InglorisousType<TEntity>

/**
 * Converts an RTK slice to an Inglorious type
 *
 * This function converts RTK reducers to Inglorious event handlers while
 * preserving the same mutation-based syntax (both use Immer/Mutative).
 * The resulting type can be used directly in an Inglorious store.
 *
 * @template TEntity - The entity type (should match slice state + BaseEntity fields)
 * @template TState - The slice state type
 *
 * @param slice - RTK slice created with createSlice
 * @param options - Async thunks and additional handlers
 * @returns Inglorious type definition
 *
 * @example
 * ```typescript
 * interface Todo {
 *   id: number
 *   text: string
 *   completed: boolean
 * }
 *
 * interface TodoState {
 *   items: Todo[]
 *   filter: 'all' | 'active' | 'completed'
 *   status: 'idle' | 'loading' | 'success' | 'error'
 * }
 *
 * interface TodoListEntity extends BaseEntity, TodoState {
 *   type: 'todoList'
 * }
 *
 * // RTK slice
 * const todosSlice = createSlice({
 *   name: 'todos',
 *   initialState: { items: [], filter: 'all', status: 'idle' } as TodoState,
 *   reducers: {
 *     addTodo: (state, action: PayloadAction<string>) => {
 *       state.items.push({
 *         id: Date.now(),
 *         text: action.payload,
 *         completed: false
 *       })
 *     },
 *     toggleTodo: (state, action: PayloadAction<number>) => {
 *       const todo = state.items.find(t => t.id === action.payload)
 *       if (todo) todo.completed = !todo.completed
 *     }
 *   }
 * })
 *
 * // Convert to Inglorious
 * const todoList = convertSlice<TodoListEntity, TodoState>(todosSlice, {
 *   asyncThunks: {
 *     fetchTodos: {
 *       payloadCreator: async () => {
 *         const response = await fetch('/api/todos')
 *         return response.json()
 *       },
 *       onPending: (entity) => {
 *         entity.status = 'loading'
 *       },
 *       onFulfilled: (entity, todos: Todo[]) => {
 *         entity.status = 'success'
 *         entity.items = todos
 *       },
 *       onRejected: (entity, error) => {
 *         entity.status = 'error'
 *       }
 *     }
 *   }
 * })
 * ```
 */
export function convertSlice<
  TEntity extends BaseEntity = BaseEntity,
  TState = any,
>(
  slice: RTKSlice<TState>,
  options?: ConvertSliceOptions<TEntity>,
): InglorisousType<TEntity>

/**
 * Creates a migration guide for a slice
 *
 * Analyzes an RTK slice and generates a readable migration guide showing
 * the equivalent Inglorious code. Useful for documentation and planning.
 *
 * @param slice - RTK slice
 * @returns Migration guide as formatted text
 *
 * @example
 * ```typescript
 * const guide = createMigrationGuide(todosSlice)
 * console.log(guide)
 * ```
 */
export function createMigrationGuide(slice: RTKSlice): string

/**
 * Creates a compatibility layer for existing RTK code
 *
 * This allows RTK-style dispatch calls to work with Inglorious Store
 * during the migration period. The returned dispatch function translates
 * RTK action objects to Inglorious notify calls.
 *
 * @param api - Inglorious API
 * @param entityId - The entity ID to target
 * @returns A dispatch function compatible with RTK actions
 *
 * @example
 * ```typescript
 * const dispatch = createRTKCompatDispatch(api, 'todos')
 *
 * // RTK-style action still works
 * dispatch({
 *   type: 'todos/addTodo',
 *   payload: 'Buy milk'
 * })
 *
 * // Translates to: api.notify('#todos:addTodo', 'Buy milk')
 * ```
 */
export function createRTKCompatDispatch(
  api: Api,
  entityId: string,
): (action: { type: string; payload?: any } | Function) => void

/**
 * RTK Action type for type safety
 */
export interface RTKAction<TPayload = any> {
  type: string
  payload?: TPayload
  error?: any
  meta?: any
}

/**
 * Helper type to extract state from RTK slice
 */
export type SliceState<T extends RTKSlice> = ReturnType<T["getInitialState"]>

/**
 * Helper type to create entity from slice state
 */
export type EntityFromSlice<
  T extends RTKSlice,
  TType extends string = string,
> = SliceState<T> & BaseEntity & { type: TType }

/**
 * Type-safe wrapper for convertSlice with inferred types
 *
 * @example
 * ```typescript
 * const todosSlice = createSlice({ ... })
 *
 * // Type is automatically inferred
 * const todoList = convertSliceTyped(todosSlice, 'todoList', {
 *   asyncThunks: { ... }
 * })
 * ```
 */
export function convertSliceTyped<
  TSlice extends RTKSlice,
  TType extends string,
>(
  slice: TSlice,
  typeName: TType,
  options?: ConvertSliceOptions<EntityFromSlice<TSlice, TType>>,
): InglorisousType<EntityFromSlice<TSlice, TType>>
