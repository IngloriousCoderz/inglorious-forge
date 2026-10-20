import { Api } from "./api"
import { BaseEntity } from "./store"

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
    payload: TPayload,
    api: TApi,
  ) => void
} & {
  [K in `${TType}Run`]: (
    entity: TEntity,
    payload: TPayload,
    api: TApi,
  ) => Promise<void>
} & {
  [K in `${TType}Success`]: (
    entity: TEntity,
    result: TResult,
    api: TApi,
  ) => void
} & {
  [K in `${TType}Error`]: (entity: TEntity, error: any, api: TApi) => void
} & {
  [K in `${TType}Finally`]: (entity: TEntity, payload: void, api: TApi) => void
}

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
