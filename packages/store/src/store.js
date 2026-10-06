import { toCamelCase } from "@inglorious/utils/data-structures/string.js"
import { create } from "mutative"

import { createApi } from "./api.js"
import { augmentEntities, augmentEntity } from "./entities.js"
import { EventMap, parseEvent } from "./event-map.js"
import { applyMiddlewares } from "./middlewares.js"
import { augmentType, augmentTypes } from "./types.js"

/** Copies only the entities that change, using a draft proxy. */
const STRUCTURAL_SHARING = "structural-sharing"

/** Deep-clones the whole state and applies events to the copy, without a proxy. */
const FULL_CLONE = "full-clone"

const UPDATE_STRATEGIES = [STRUCTURAL_SHARING, FULL_CLONE]

/**
 * Creates a store to manage state and events.
 *
 * Events are queued and drained by {@link createStore|update}. The `updateStrategy` option
 * controls how the state is copied before the queued events are applied:
 *
 * - `"structural-sharing"` (default) - Applies events to a draft proxy, so only the entities
 *   that actually changed are copied. Unchanged entities keep their previous reference, which
 *   makes change detection cheap for consumers that rely on reference equality. This is the
 *   right choice for UI stores, where a small number of entities change at a time.
 * - `"full-clone"` - Deep-clones the whole state with `structuredClone` and applies events directly
 *   to the copy, without a proxy. The cost is proportional to the total state size on every
 *   update, but there is no per-entity proxy overhead, so it scales better when thousands of
 *   entities change every frame, as in a game simulation.
 *
 * Under both strategies the current state is kept intact while the queued events are applied to a
 * separate draft, and the two are swapped only once every event has been processed. Handlers and
 * systems therefore always receive the draft as their first argument and mutate it directly, and
 * subscribers are notified only after the swap. This also means that, during an update,
 * `api.getEntity()` and `api.getEntities()` read the *previous* state rather than the in-flight
 * changes, under either strategy.
 *
 * @param {StoreConfig} config - Configuration options for the store.
 * @param {Types} [config.types] - The initial types configuration.
 * @param {Entities} [config.entities] - The initial entities configuration.
 * @param {Object[]} [config.systems] - The initial systems configuration.
 * @param {Function[]} [config.middlewares] - The initial middlewares configuration.
 * @param {boolean} [config.autoCreateEntities=false] - Creates entities if not defined in `config.entities`.
 * @param {"auto" | "manual"} [config.updateMode="auto"] - Whether each event triggers an update, or updates are batched until `update()` is called.
 * @param {UpdateStrategy} [config.updateStrategy="structural-sharing"] - How the state is copied before events are applied.
 * @returns {Store} The store with methods to interact with state and events.
 * @throws {TypeError} If `updateStrategy` is not a supported strategy.
 */
export function createStore({
  types: originalTypes = {},
  entities: originalEntities = {},
  systems = [],
  middlewares = [],
  autoCreateEntities = false,
  updateMode = "auto",
  updateStrategy = STRUCTURAL_SHARING,
} = {}) {
  assertUpdateStrategy(updateStrategy)

  const listeners = new Set()

  const types = augmentTypes(originalTypes)

  let state, eventMap, incomingEvents, isProcessing, isHalted
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

  if (updateMode === "auto" && incomingEvents.length) {
    update()
  }

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
   *
   * The current state is left untouched while the queued events are applied to a separate
   * draft, according to the configured `updateStrategy`. The draft only replaces the current
   * state once every queued event has been processed, and subscribers are notified afterwards.
   *
   * @returns {Event[]} The events processed during this update.
   */
  function update() {
    if (isProcessing) {
      return []
    }

    isProcessing = true
    const processedEvents = []
    let nextState

    if (updateStrategy === STRUCTURAL_SHARING) {
      nextState = create(state, patch, {
        enableAutoFreeze: state.game?.devMode,
      })
    } else {
      const draft = structuredClone(state)

      patch(draft)
      nextState = draft
    }

    state = nextState
    isProcessing = false

    listeners.forEach((onUpdate) => onUpdate())

    return processedEvents

    /**
     * Applies every queued event to the given draft.
     *
     * The draft is either the proxy returned by `create` (structural sharing) or the
     * deep copy produced by `structuredClone` (full clone). The current state is not
     * modified, and only becomes the new state once this function returns.
     *
     * A change made by a handler is not visible to the next handler in the same pass:
     * `getState` still returns the state as it was before the pass began. This is on
     * purpose -- every event in the pass sees one consistent world, rather than some
     * changes having landed and others not -- and it means a handler that asks what is
     * left is asking about the past. Anything reacting to a change should be told the
     * change rather than go looking for it.
     *
     * @param {Entities} draft - The draft to apply the queued events to.
     * @returns {void}
     */
    function patch(draft) {
      while (incomingEvents.length) {
        const event = incomingEvents.shift()
        processedEvents.push(event)

        // Pausing and resuming are the store's own, and they keep dispatching like any
        // other event, so the game behaviour still sees them and anything else that
        // wants to react gets the same notification.
        if (event.type === "pause") {
          isHalted = true
        }

        if (event.type === "resume") {
          isHalted = false
        }

        // Handle special system events
        // `add` and `remove` change the world and are then dispatched like any
        // other event, so that whatever is watching can hear about it. They are
        // broadcast: the entity named by the payload is not the only one that wants
        // to know, and a level counting down the bricks it rolled needs to hear
        // about each of them going.
        //
        // They are not the counterpart to `create` and `destroy`, which reach only
        // the entity they are about so that those read as a constructor and a
        // destructor without every handler beginning by checking whether it is the
        // one being talked about.
        //
        // The two carry different payloads, and that is on purpose: a payload
        // carries the least that can be had. A removal needs only the id, because
        // everything else about the entity can still be looked up by it. An
        // addition carries the entity itself, because there is nothing yet to look
        // it up by -- the same asymmetry as removing a user by id but updating one
        // by the patched user.
        if (event.type === "add") {
          addEntity(draft, event.payload)
        }

        if (event.type === "remove") {
          removeEntity(draft, event.payload)
        }

        // Parse the event to get handler name
        const { event: handlerName } = parseEvent(event.type)

        // Get entities that should handle this event (filtered by EventMap)
        const entityIds = eventMap.getEntitiesForEvent(event.type)

        // A halted world stops handing out updates, because anything that moves by
        // integrating a delta time would otherwise carry on regardless. An entity that
        // sets `updatesWhilePaused` is exempt, which is how an overlay, a button or the
        // thing that takes the pause back off keeps working while the rest stands still.
        //
        // It is read off the entity rather than the type so that the type stays an index
        // signature of handlers, which is what lets it be called and indexed freely.
        const halted = isHalted && handlerName === "update"

        for (const id of entityIds) {
          const entity = draft[id]
          const type = types[entity.type]

          if (halted && !entity.updatesWhilePaused) continue

          const handle = type[handlerName]

          handle?.(entity, event.payload, api)
        }

        if (event.type.endsWith(":destroy")) {
          const [target] = event.type.split(":")
          const [, id] = target.split("#")
          const entity = draft[id]
          if (entity) {
            const type = types[entity.type]
            const typeName = entity.type
            delete draft[id]

            eventMap.removeEntity(id, type, typeName)
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
   * Two of these are the store's own. 'pause' stops the store handing out 'update'
   * events, and 'resume' starts it again, which is how anything that moves by
   * integrating a delta time stops without being told about it. A type declares
   * `updatesWhilePaused` to keep updating regardless. Both keep dispatching to types
   *
   * @param {string} type - The event type to notify.
   * @param {any} payload - The event payload. Carries the least that can be had
   *   about what happened.
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
   * @param {Type} type - The type configuration.
   * @returns {void}
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

    const entityId = toCamelCase(typeName)
    if (autoCreateEntities && !state[entityId]) {
      notify("add", {
        id: entityId,
        type: typeName,
      })
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
   * @param {Entities} nextState - The new state to set.
   * @returns {void}
   */
  function setState(nextState) {
    const oldEntities = state ?? {}
    let newEntities = augmentEntities(nextState)

    const oldEntityIds = new Set(Object.keys(oldEntities))
    const newEntityIds = new Set(Object.keys(newEntities))

    const entitiesToCreate = [...newEntityIds].filter(
      (id) => !oldEntityIds.has(id),
    )
    const entitiesToDestroy = [...oldEntityIds].filter(
      (id) => !newEntityIds.has(id),
    )
    const entitiesToUpdate = [...newEntityIds].filter((id) =>
      oldEntityIds.has(id),
    )

    state = oldEntities
    eventMap = new EventMap(types, oldEntities)
    incomingEvents = []
    isProcessing = false

    entitiesToDestroy.forEach((id) => {
      removeEntity(state, id)
    })

    entitiesToCreate.forEach((id) => {
      const entity = newEntities[id]
      addEntity(state, { id, ...entity })
    })

    entitiesToUpdate.forEach((id) => {
      const oldType = oldEntities[id].type
      const newEntity = newEntities[id]
      state[id] = newEntity

      if (newEntity.type !== oldType) {
        eventMap.removeEntity(id, types[oldType], oldType)
        eventMap.addEntity(id, types[newEntity.type], newEntity.type)
      }
    })

    if (autoCreateEntities) {
      for (const typeName of Object.keys(types)) {
        const entityId = toCamelCase(typeName)
        const hasEntity = Object.values(state).some(
          (entity) => entity.type === typeName,
        )

        if (!hasEntity) {
          addEntity(state, { id: entityId, type: typeName })
        }
      }
    }
  }

  /**
   * Resets the store to its initial state.
   * @returns {void}
   */
  function reset() {
    isHalted = false
    setState(originalEntities)
  }

  /**
   * Adds an entity to the state and registers its event handlers.
   * @param {Entities} draft - The draft (structural sharing) or the copy (full clone) to mutate.
   * @param {Entity} payload - The entity to add, including its id.
   * @returns {void}
   */
  function addEntity(draft, payload) {
    const { id, ...entity } = payload
    draft[id] = augmentEntity(id, entity)
    const type = types[entity.type]

    eventMap.addEntity(id, type, entity.type)
    incomingEvents.unshift({ type: `#${id}:create` })
  }

  /**
   * Queues the destruction of an entity. The entity is removed by the `#id:destroy` event.
   * @param {Entities} draft - The draft (structural sharing) or the copy (full clone) to mutate.
   * @param {string} id - The id of the entity to remove.
   * @returns {void}
   */
  function removeEntity(draft, id) {
    incomingEvents.unshift({ type: `#${id}:destroy` })
  }
}

/**
 * Validates the given update strategy.
 * @param {UpdateStrategy} updateStrategy - The update strategy to validate.
 * @returns {void}
 * @throws {TypeError} If the update strategy is not supported.
 */
function assertUpdateStrategy(updateStrategy) {
  if (UPDATE_STRATEGIES.includes(updateStrategy)) {
    return
  }

  throw new TypeError(
    `Unsupported update strategy: ${updateStrategy}. Expected one of: ${UPDATE_STRATEGIES.join(", ")}.`,
  )
}

/**
 * @typedef {"structural-sharing" | "full-clone"} UpdateStrategy - How the state is copied before events are applied.
 * @typedef {Object} StoreConfig - Configuration options accepted by {@link createStore}.
 * @typedef {Object.<string, any>} Type - An augmented entity type.
 * @typedef {Object.<string, Type>} Types - A collection of augmented types.
 * @typedef {Object.<string, any>} Entity - An object representing an entity.
 * @typedef {Object.<string, Entity>} Entities - A collection of entities indexed by id.
 * @typedef {(listener: () => void) => () => void} Listener - Subscribes to state updates and returns an unsubscribe function.
 * @typedef {Object} Store - The store returned by {@link createStore}.
 */
