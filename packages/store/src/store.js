import { create } from "mutative"

import { createApi } from "./api.js"
import { augmentEntities, augmentEntity } from "./entities.js"
import { EventMap, parseEvent } from "./event-map.js"
import { applyMiddlewares } from "./middlewares.js"
import { augmentType, augmentTypes } from "./types.js"

/**
 * Creates a store to manage state and events.
 * @param {Object} config - Configuration options for the store.
 * @param {Object} [config.types] - The initial types configuration.
 * @param {Object} [config.entities] - The initial entities configuration.
 * @param {Array} [config.systems] - The initial systems configuration.
 * @param {Array} [config.middlewares] - The initial middlewares configuration.
 * @param {boolean} [config.autoCreateEntities] - Creates entities if not defined in `config.entities`.
 * @param {"auto" | "manual"} [config.updateMode] - The update mode (defaults to "auto").
 * @returns {Object} The store with methods to interact with state and events.
 */
export function createStore({
  types: originalTypes = {},
  entities: originalEntities = {},
  systems = [],
  middlewares = [],
  autoCreateEntities = false,
  updateMode = "auto",
} = {}) {
  const listeners = new Set()

  const types = augmentTypes(originalTypes)

  let state, eventMap, incomingEvents, isProcessing
  reset()

  const baseStore = {
    subscribe,
    update,
    notify,
    dispatch, // needed for compatibility with Redux
    getTypes,
    getType,
    setType,
    getState,
    setState,
    reset,
  }

  const store = middlewares.length
    ? applyMiddlewares(...middlewares)(baseStore)
    : baseStore
  const api = createApi(store, store.extras)
  store._api = api
  return store

  /**
   * Subscribes a listener to state updates.
   * @param {Function} listener - The listener function to call on updates.
   * @returns {Function} A function to unsubscribe the listener.
   */
  function subscribe(listener) {
    listeners.add(listener)

    return function unsubscribe() {
      listeners.delete(listener)
    }
  }

  /**
   * Updates the state based on elapsed time and processes events.
   */
  function update() {
    if (isProcessing) {
      return []
    }

    isProcessing = true
    const processedEvents = []

    state = create(state, patcher, {
      enableAutoFreeze: state.game?.devMode,
    })

    isProcessing = false

    listeners.forEach((onUpdate) => onUpdate())

    return processedEvents

    function patcher(draft) {
      while (incomingEvents.length) {
        const event = incomingEvents.shift()
        processedEvents.push(event)

        // Handle special system events
        if (event.type === "add") {
          const { id, ...entity } = event.payload
          draft[id] = augmentEntity(id, entity)
          const type = types[entity.type]

          eventMap.addEntity(id, type, entity.type)
          incomingEvents.unshift({ type: `#${id}:create` })
          continue
        }

        if (event.type === "remove") {
          const id = event.payload
          const entity = draft[id]
          const type = types[entity.type]
          const typeName = entity.type
          delete draft[id]

          eventMap.removeEntity(id, type, typeName)
          incomingEvents.unshift({ type: `#${id}:destroy` })
          continue
        }

        // Parse the event to get handler name
        const { event: handlerName } = parseEvent(event.type)

        // Get entities that should handle this event (filtered by EventMap)
        const entityIds = eventMap.getEntitiesForEvent(event.type)

        for (const id of entityIds) {
          const entity = draft[id]
          const type = types[entity.type]
          const handle = type[handlerName]

          if (handle) {
            handle(entity, event.payload, api)
          }
        }

        // Systems process events by handler name (not scoped)
        systems.forEach((system) => {
          const handle = system[handlerName]
          handle?.(draft, event.payload, api)
        })
      }
    }
  }

  /**
   * Notifies the store of a new event.
   * Supports scoped events:
   * - 'submit' - broadcast to all entities with submit handler
   * - 'form:submit' - only form entities
   * - 'form[loginForm]:submit' - only loginForm entity
   *
   * @param {string} type - The event type to notify.
   * @param {any} payload - The event payload.
   */
  function notify(type, payload) {
    // NOTE: it's important to invoke store.dispatch instead of dispatch, otherwise we cannot override it
    store.dispatch({ type, payload })
  }

  /**
   * Dispatches an event to be processed in the next update cycle.
   * @param {Object} event - The event object.
   * @param {string} event.type - The type of the event.
   * @param {any} [event.payload] - The payload of the event.
   */
  function dispatch(event) {
    incomingEvents.push(event)
    if (updateMode === "auto") {
      update()
    }
  }

  /**
   * Retrieves the augmented types configuration.
   * This includes composed behaviors and event handlers wrapped for immutability.
   * @returns {Object} The augmented types configuration.
   */
  function getTypes() {
    return types
  }

  /**
   * Retrieves an augmented type configuration given its name.
   * @param {string} typeName - The type of the entity.
   * @returns {Object} The augmented type configuration.
   */
  function getType(typeName) {
    return types[typeName]
  }

  /**
   * Sets an augmented type configuration given its name.
   * @param {string} typeName - The name of the type to set.
   * @param {Object} type - The type configuration.
   */
  function setType(typeName, type) {
    const oldType = types[typeName]

    originalTypes[typeName] = type
    types[typeName] = augmentType(type)
    const newType = types[typeName]

    for (const [id, entity] of Object.entries(state)) {
      if (entity.type === typeName) {
        eventMap.removeEntity(id, oldType, typeName)
        eventMap.addEntity(id, newType, typeName)
      }
    }
  }

  /**
   * Retrieves the current state.
   * @returns {Object} The current state.
   */
  function getState() {
    return state
  }

  /**
   * Sets the entire state of the store.
   * This is useful for importing state or setting initial state from a server.
   * @param {Object} nextState - The new state to set.
   */
  function setState(nextState) {
    const oldEntities = state ?? {}
    const newEntities = augmentEntities(nextState)

    if (autoCreateEntities) {
      for (const typeName of Object.keys(types)) {
        // Check if entity already exists
        const hasEntity = Object.values(newEntities).some(
          (entity) => entity.type === typeName,
        )

        if (!hasEntity) {
          // No entity for this type → auto-create minimal entity
          newEntities[typeName] = {
            id: typeName,
            type: typeName,
          }
        }
      }
    }

    state = newEntities
    eventMap = new EventMap(types, newEntities)
    incomingEvents = []
    isProcessing = false

    const oldEntityIds = new Set(Object.keys(oldEntities))
    const newEntityIds = new Set(Object.keys(newEntities))

    const entitiesToCreate = [...newEntityIds].filter(
      (id) => !oldEntityIds.has(id),
    )
    const entitiesToDestroy = [...oldEntityIds].filter(
      (id) => !newEntityIds.has(id),
    )

    entitiesToCreate.forEach((id) => {
      incomingEvents.push({ type: `#${id}:create` })
    })

    entitiesToDestroy.forEach((id) => {
      incomingEvents.push({ type: `#${id}:destroy` })
    })
  }

  /**
   * Resets the store to its initial state.
   */
  function reset() {
    setState(originalEntities)
  }
}
