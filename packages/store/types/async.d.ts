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
> {
  /**
   * Called synchronously before the async operation starts
   * Use for setting loading states
   */
  start?: (entity: TEntity, payload: TPayload, api: Api) => void

  /**
   * The async operation to perform
   * Receives payload and api (NOT entity - entity state should be modified in other handlers)
   * @returns Promise or synchronous result
   */
  run: (payload: TPayload, api: Api) => Promise<TResult> | TResult

  /**
   * Called when the operation succeeds
   * Receives the entity, the result from run(), and api
   */
  success?: (entity: TEntity, result: TResult, api: Api) => void

  /**
   * Called when the operation fails
   * Receives the entity, the error, and api
   */
  error?: (entity: TEntity, error: any, api: Api) => void

  /**
   * Called after the operation completes (success or failure)
   * Use for cleanup, resetting loading states, etc.
   */
  finally?: (entity: TEntity, api: Api) => void
}

/**
 * Generated event handlers returned by handleAsync
 * Contains handlers for all lifecycle stages
 */
export interface AsyncEventHandlers<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
> {
  /**
   * Main trigger handler
   * Dispatches start (if defined) and run events
   */
  [key: string]: (
    entity: TEntity,
    payload: TPayload,
    api: Api,
  ) => void | Promise<void>
}

/**
 * Creates a set of event handlers for managing an asynchronous operation lifecycle.
 *
 * Generates handlers for: trigger, start, run, success, error, finally
 * These can be spread into an entity type definition.
 *
 * @template TEntity - The entity type (must extend BaseEntity)
 * @template TPayload - The payload type passed to the operation
 * @template TResult - The result type returned by the async operation
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
 *   type: 'todoList'
 *   todos: Todo[]
 *   status: 'idle' | 'loading' | 'success' | 'error'
 *   error?: string
 * }
 *
 * const todoList = {
 *   init(entity: TodoListEntity) {
 *     entity.todos = []
 *     entity.status = 'idle'
 *   },
 *
 *   ...handleAsync<TodoListEntity, void, Todo[]>('fetchTodos', {
 *     start(entity) {
 *       entity.status = 'loading'
 *     },
 *     async run(_, api) {
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
 * }
 * ```
 */
export function handleAsync<
  TEntity extends BaseEntity = BaseEntity,
  TPayload = any,
  TResult = any,
>(
  type: string,
  handlers: AsyncHandlers<TEntity, TPayload, TResult>,
  options?: AsyncOptions,
): AsyncEventHandlers<TEntity, TPayload, TResult>
