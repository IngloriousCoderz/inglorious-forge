import { Api } from "../api"
import { BaseEntity } from "../store"

/**
 * Scope option for async handler events
 * - "entity": Events scoped to specific entity (#entityId:event)
 * - "type": Events scoped to entity type (typeName:event)
 * - "global": Global events (event)
 */
export type AsyncScope = "entity" | "type" | "global"

/**
 * Configuration options for async handlers
 */
export interface AsyncOptions {
  /**
   * Controls how lifecycle events are routed
   * @default "entity"
   */
  scope?: AsyncScope
}

/**
 * Handler functions for async operation lifecycle
 */
export interface AsyncHandlers<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
  TApi extends Api = Api,
> {
  /**
   * Called synchronously before the async operation starts
   * Use for setting loading states
   */
  start?: (entity: TEntity, payload: TPayload, api: TApi) => void

  /**
   * The async operation to perform
   * Receives payload and api (NOT entity - entity state should be modified in other handlers)
   * @returns Promise or synchronous result
   */
  run: (payload: TPayload, api: TApi) => Promise<TResult> | TResult

  /**
   * Called when the operation succeeds
   * Receives the entity, the result from run(), and api
   */
  success?: (entity: TEntity, result: TResult, api: TApi) => void

  /**
   * Called when the operation fails
   * Receives the entity, the error, and api
   */
  error?: (entity: TEntity, error: any, api: TApi) => void

  /**
   * Called after the operation completes (success or failure)
   * Use for cleanup, resetting loading states, etc.
   */
  finally?: (entity: TEntity, api: TApi) => void
}

/**
 * The events `handleAsync(type, ...)` generates, by name: `type`, `typeRun`,
 * `typeSuccess`, `typeError`, `typeFinally` and, when a `start` handler is
 * given, `typeStart`. A type alias can list them all in one go:
 *
 * ```ts
 * type TodoListType = {
 *   render: (entity: TodoListEntity, api: AppApi) => TemplateResult
 * } & AsyncEvents<"fetchTodos", TodoListEntity, void, Todo[], AppApi>
 * ```
 *
 * The `scope` option changes where the events are sent, not their names.
 *
 * Each call gets a `callId` that all its events carry, so that a wrapper such
 * as `optimistic` can tell overlapping calls apart.
 */
export type AsyncEvents<
  TType extends string,
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
  TApi extends Api = Api,
> = {
  [K in TType]: (entity: TEntity, payload: TPayload, api: TApi) => void
} & {
  [K in `${TType}Start`]?: (
    entity: TEntity,
    event: AsyncCall<{ payload: TPayload }>,
    api: TApi,
  ) => void
} & {
  [K in `${TType}Run`]: (
    entity: TEntity,
    event: AsyncCall<{ payload: TPayload }>,
    api: TApi,
  ) => Promise<void>
} & {
  [K in `${TType}Success`]: (
    entity: TEntity,
    event: AsyncCall<{ result: TResult }>,
    api: TApi,
  ) => void
} & {
  [K in `${TType}Error`]: (
    entity: TEntity,
    event: AsyncCall<{ error: any }>,
    api: TApi,
  ) => void
} & {
  [K in `${TType}Finally`]: (
    entity: TEntity,
    event: AsyncCall,
    api: TApi,
  ) => void
}

/** What an event of one call of an async behavior carries: its `callId`. */
export type AsyncCall<T = {}> = T & { callId: number }

/**
 * Creates a set of event handlers for managing an asynchronous operation lifecycle.
 *
 * Generates handlers for: trigger, start, run, success, error, finally
 * These can be spread into an entity type definition.
 *
 * The event name, the entity, the payload, the result and the api are inferred
 * from `type` and from the handlers' parameters, or from the type the handlers
 * are spread into (`satisfies EntityType<TodoListEntity, AppApi>`). Explicit
 * type arguments still work, but the event names are then plain strings.
 *
 * @template TEntity - The entity type (must extend BaseEntity)
 * @template TPayload - The payload type passed to the operation
 * @template TResult - The result type returned by the async operation
 * @template TApi - The api the handlers receive, such as the app's own
 * @template TType - The base event name, inferred from `type`
 *
 * @param type - The base event name (e.g., 'fetchTodos')
 * @param handlers - Handler functions for each lifecycle stage
 * @param options - Configuration options
 * @returns Object containing all generated event handlers
 *
 * @example
 * ```typescript
 * interface Todo {
 *   id: number
 *   text: string
 *   completed: boolean
 * }
 *
 * interface TodoListEntity extends BaseEntity {
 *   type: 'TodoList'
 *   todos: Todo[]
 *   status: 'idle' | 'loading' | 'success' | 'error'
 *   error?: string
 * }
 *
 * const TodoList = {
 *   create(entity) {
 *     entity.todos = []
 *     entity.status = 'idle'
 *   },
 *
 *   ...handleAsync('fetchTodos', {
 *     start(entity) {
 *       entity.status = 'loading'
 *     },
 *     async run(_: void, api): Promise<Todo[]> {
 *       const response = await fetch('/api/todos')
 *       return response.json()
 *     },
 *     success(entity, todos) {
 *       entity.status = 'success'
 *       entity.todos = todos
 *     },
 *     error(entity, error) {
 *       entity.status = 'error'
 *       entity.error = error.message
 *     }
 *   })
 * } satisfies EntityType<TodoListEntity, AppApi>
 * ```
 */
export function handleAsync<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
  TApi extends Api = Api,
  TType extends string = string,
>(
  type: TType,
  handlers: AsyncHandlers<TEntity, TPayload, TResult, TApi>,
  options?: AsyncOptions,
): AsyncEvents<TType, TEntity, TPayload, TResult, TApi>

/** Where a request is: `"loading"`, then `"success"` or `"error"`. */
export type RequestStatus = "loading" | "success" | "error"

export interface RequestOptions<TError = string> extends AsyncOptions {
  /** The field for the status, when the entity has several requests. @default "status" */
  status?: string
  /** The field for the error. @default "error" */
  error?: string
  /** What to store as the error, such as a translation key. Defaults to its message. */
  toError?: (error: unknown) => TError
  /** Whether a call replaced by a newer one is ignored. @default true */
  isLatestOnly?: boolean
}

/**
 * Handler functions for a request: those of `handleAsync`, whose `error`
 * receives the error as `toError` turned it, after the entity's error field is
 * set.
 */
export interface RequestHandlers<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
  TApi extends Api = Api,
  TError = string,
> extends Omit<AsyncHandlers<TEntity, TPayload, TResult, TApi>, "error"> {
  error?: (entity: TEntity, error: TError, api: TApi) => void
}

/**
 * The handlers of a request: a call whose progress the entity shows. The
 * entity's `status` is `"loading"` from the start, then `"success"` or
 * `"error"`, and its `error` holds what went wrong. Only the latest call
 * counts: the answer of a call that a newer one replaced is dropped. Prefer it
 * to `handleAsync` whenever the entity shows that something is happening.
 *
 * @example
 * ```typescript
 * const JobList = {
 *   ...handleRequest("search", {
 *     run: (query: string) => searchJobs(query),
 *     success(entity, jobs) {
 *       entity.jobs = jobs
 *     },
 *   }),
 * } satisfies EntityType<JobListEntity, AppApi>
 *
 * const types = { JobList: [JobList, withDebounce(300, ["search"])] }
 * ```
 */
export function handleRequest<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
  TApi extends Api = Api,
  TType extends string = string,
  TError = string,
>(
  type: TType,
  handlers: RequestHandlers<TEntity, TPayload, TResult, TApi, TError>,
  options?: RequestOptions<TError>,
): AsyncEvents<TType, TEntity, TPayload, TResult, TApi>
