import { create } from "mutative"

/**
 * Creates a mock API for testing event handlers in isolation.
 *
 * The mock API provides read-only access to entities and tracks all events
 * dispatched during handler execution. The entities are frozen to prevent
 * accidental mutations - handlers should only mutate the draft state passed
 * to them, not entities retrieved via `getEntity()` or `getEntities()`.
 *
 * @param {Object} entities - The entities state (will be frozen)
 *
 * @returns {Object} A mock API object with methods:
 *   - `getEntities()`: Returns all entities (frozen)
 *   - `getEntities(typeName)`: Returns entities matching that type (frozen array)
 *   - `getEntity(id)`: Returns a specific entity by ID (frozen)
 *   - `select(selector)`: Runs a selector against the entities
 *   - `dispatch(event)`: Records an event (for assertions)
 *   - `notify(type, payload)`: Convenience method that calls dispatch
 *   - `getEvents()`: Returns all events that were dispatched
 *
 * @example
 * const api = createMockApi({
 *   counter1: { type: 'counter', value: 0 }
 * })
 *
 * // In your handler
 * const entity = api.getEntity('counter1')
 * api.notify('increment', { id: 'counter1' })
 *
 * // In your test
 * expect(api.getEvents()).toEqual([
 *   { type: 'increment', payload: { id: 'counter1' } }
 * ])
 */
export function createMockApi(entities) {
  const frozenEntities = Object.freeze(entities)
  const events = []

  return {
    getEntities(typeName) {
      if (typeName == null) {
        return frozenEntities
      }

      return Object.values(frozenEntities).filter(
        (entity) => entity.type === typeName,
      )
    },
    getEntity(id) {
      return frozenEntities[id]
    },
    select(selector) {
      return selector(frozenEntities)
    },
    dispatch(event) {
      events.push(event)
    },
    notify(type, payload) {
      this.dispatch({ type, payload })
    },
    getEvents() {
      return events
    },
  }
}

/**
 * Triggers an event handler on a single entity for testing purposes.
 *
 * This function executes an event handler on a single entity with the given
 * payload, using Mutative to provide a mutable draft. The handler can read
 * other entities via the API (frozen, immutable) and mutate the draft entity.
 * All events dispatched during execution are captured and returned.
 *
 * Use this for unit testing individual entity handlers. For integration testing
 * of event cascades and the full event queue, use the actual store.
 *
 * @param {Object} entity - The entity to operate on
 * @param {Function} eventHandler - The handler function to test. Should accept
 *   (draft, payload, api) where draft is the mutable entity
 * @param {*} eventPayload - The payload to pass to the handler
 * @param {Object} [api] - Optional custom mock API. If not provided, a default
 *   mock API will be created automatically with the entity as the only entity
 *
 * @returns {Object} An object containing:
 *   - `entity`: The new immutable entity after the handler executed
 *   - `events`: Array of all events dispatched during handler execution
 *
 * @example
 * // Define your entity handler
 * const increment = (entity, payload, api) => {
 *   entity.value += payload.amount
 *   if (entity.value > 100) {
 *     api.notify('overflow', { id: entity.id })
 *   }
 * }
 *
 * // Test it
 * const { entity, events } = trigger(
 *   { type: 'counter', id: 'counter1', value: 99 },
 *   increment,
 *   { amount: 5 }
 * )
 *
 * expect(entity.value).toBe(104)
 * expect(events).toEqual([
 *   { type: 'overflow', payload: { id: 'counter1' } }
 * ])
 *
 * @example
 * // With custom mock API to access other entities
 * const api = createMockApi({
 *   counter1: { type: 'counter', value: 10 },
 *   counter2: { type: 'counter', value: 20 }
 * })
 *
 * const copyValue = (entity, payload, api) => {
 *   const source = api.getEntity(payload.sourceId)
 *   entity.value = source.value
 * }
 *
 * const { entity } = trigger(
 *   { type: 'counter', id: 'counter2', value: 20 },
 *   copyValue,
 *   { sourceId: 'counter1' },
 *   api
 * )
 *
 * expect(entity.value).toBe(10)
 */
export function trigger(entity, eventHandler, eventPayload, api) {
  api ??= createMockApi({ entities: { [entity.id]: entity } })

  return {
    entity: create(entity, (draft) => {
      eventHandler(draft, eventPayload, api)
    }),
    events: api.getEvents(),
  }
}
