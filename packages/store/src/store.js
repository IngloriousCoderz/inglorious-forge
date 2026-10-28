import { clone } from "@inglorious/utils/data-structures/object.js"
import { toCamelCase } from "@inglorious/utils/data-structures/string.js"
import { create } from "mutative"

import { createApi } from "./api.js"
import { augmentEntities, augmentEntity } from "./entities.js"
import { EventMap, parseEvent } from "./event-map.js"
import { applyMiddlewares } from "./middlewares.js"
import { augmentType, augmentTypes } from "./types.js"

/** Copies only the entities that change, using a draft proxy. */
const STRUCTURAL_SHARING = "structural-sharing"

/** Deep-copies each entity as it is handed out, and applies events to the copy, without a proxy. */
const COPY_ON_DISPATCH = "copy-on-dispatch"

const UPDATE_STRATEGIES = [STRUCTURAL_SHARING, COPY_ON_DISPATCH]

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
 * - `"copy-on-dispatch"` - Deep-copies each entity the first time it is handed to a handler or read by
 *   a system, and applies events directly to the copy, without a proxy. Entities nothing touches
 *   are not copied, and there is no per-entity proxy overhead, so it scales better when
 *   thousands of entities change every frame, as in a game simulation.
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
 * @param {Function[]} [config.middlewares] - Functions that each take the store and return it,
 *   changed or wrapped. The first wraps all the others, so events pass through them in order.
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
    getEntity,
    setState,
    reset,
  }

  const store = applyMiddlewares(baseStore, middlewares)
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

    // Nothing queued means nothing to apply and nothing to publish: skipping the draft
    // entirely, rather than copying the world just to arrive back where it started.
    // This is what keeps a loop that pumps every animation frame cheap on the frames
    // where neither the game nor the player had anything to say.
    if (!incomingEvents.length) {
      return []
    }

    isProcessing = true
    const processedEvents = []
    let nextState

    if (updateStrategy === STRUCTURAL_SHARING) {
      nextState = create(state, (draft) => patch(writeThrough(draft)), {
        enableAutoFreeze: state.game?.devMode,
      })
    } else {
      const draft = copyOnDispatch(state)

      patch(draft)
      nextState = draft.entities
    }

    state = nextState
    isProcessing = false

    listeners.forEach((onUpdate) => onUpdate())

    return processedEvents

    /**
     * Applies every queued event to the given draft.
     *
     * The draft wraps either the proxy returned by `create` (structural sharing) or a
     * copy of the entity map whose entities are copied as they are handed out (copy on
     * dispatch). The current state is not modified, and only becomes the new state once
     * this function returns.
     *
     * A change made by a handler is not visible to the next handler in the same pass:
     * `getState` still returns the state as it was before the pass began. This is on
     * purpose -- every event in the pass sees one consistent world, rather than some
     * changes having landed and others not -- and it means a handler that asks what is
     * left is asking about the past. Anything reacting to a change should be told the
     * change rather than go looking for it.
     *
     * @param {Draft} draft - The draft to apply the queued events to.
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
        // to know, and something counting down what it put up needs to hear about
        // each of them going.
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

        // A thing that stands through a change of state can still be told a different
        // configuration, in either of the two ways the world offers.
        //
        // `patch` changes some of it and leaves the rest alone, which is how a screen
        // takes over one field of something it shares with the screen before it. A field
        // named as `undefined` is set to nothing rather than being left alone, which is
        // how a key is taken off a mapping.
        //
        // `replace` installs what it is given and drops everything it does not mention,
        // which is how the whole of something is said to be different.
        //
        // Neither takes the thing out of the world, so neither runs `create` or `destroy`:
        // it never stopped standing, and a thing that was never removed cannot have been
        // destroyed. This is the same pair the world has to hand for anything else --
        // `add` and `remove` beside them, and post/delete/put/patch before that.
        if (event.type === "patch") {
          patchEntity(draft, event.payload)
        }

        if (event.type === "replace") {
          replaceEntity(draft, event.payload)
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
          // Looked at before it is taken, because an entity the pause holds back is
          // not going to be written to, and taking it would copy it for nothing.
          const entity = draft.entities[id]
          const type = types[entity.type]

          if (halted && !entity.updatesWhilePaused) continue

          const handle = type[handlerName]

          handle?.(draft.take(id), event.payload, api)
        }

        if (event.type.endsWith(":destroy")) {
          const [target] = event.type.split(":")
          const [, id] = target.split("#")
          const entity = draft.entities[id]
          if (entity) {
            const type = types[entity.type]
            const typeName = entity.type
            delete draft.entities[id]

            eventMap.removeEntity(id, type, typeName)
          }
        }

        // Systems process events by handler name (not scoped)
        systems.forEach((system) => {
          const handle = system[handlerName]
          handle?.(draft.forSystems, event.payload, api)
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
   * Sets an augmented type configuration given its name. Replacing a type, as
   * hot module reloading does, notifies subscribers, since what its entities
   * render may have changed. Adding a type does not: the store is unchanged,
   * and a type can be added while rendering.
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

    if (oldType) {
      listeners.forEach((onUpdate) => onUpdate())
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
   * One entity by its id, or `undefined` if there is no such entity.
   *
   * This is what `api.getEntity` answers with during a handler, exposed here for the
   * code that runs outside one: a test looking at a world it is driving, or anything else
   * holding the store rather than an event's `api`.
   *
   * @param {string} id - The entity's id.
   * @returns {Object|undefined} The entity, as the last finished pass left it.
   */
  function getEntity(id) {
    return state?.[id]
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
      addEntity(writeThrough(state), { id, ...entity })
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
          addEntity(writeThrough(state), { id: entityId, type: typeName })
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
   * @param {Draft} draft - The draft to put it in.
   * @param {Entity} payload - The entity to add, including its id.
   * @returns {void}
   */
  function addEntity(draft, payload) {
    const { id, ...entity } = payload
    draft.put(id, augmentEntity(id, entity))
    const type = types[entity.type]

    eventMap.addEntity(id, type, entity.type)
    incomingEvents.unshift({ type: `#${id}:create` })
  }

  /**
   * Moves a standing thing onto the handlers of whatever type it now names.
   *
   * A type is the only thing about a thing that cannot be merged: there is no such thing
   * as being half a sort, so naming a different one means taking the thing out of the old
   * one's list of entities before putting it in the new one.
   *
   * @param {Draft} draft - The draft it stands in.
   * @param {string} id - The thing being moved.
   * @param {string} previousType - The type it was under.
   * @param {string|undefined} type - The type it is under now, if it has named one.
   * @returns {void}
   */
  function moveToType(draft, id, previousType, type) {
    if (!type || type === previousType) return

    eventMap.removeEntity(id, types[previousType], previousType)
    eventMap.addEntity(id, types[type], type)
  }

  /**
   * Merges a new configuration into a thing that is already standing.
   *
   * Only the fields the configuration names are touched, so anything the world has done
   * to the thing since it was made survives unless the
   * new configuration says otherwise. A field named as `undefined` is set to nothing,
   * which is what taking a key off a mapping means.
   *
   * @param {Draft} draft - The draft to change it in.
   * @param {Entity} payload - The thing and the fields to merge into it.
   * @returns {void}
   */
  function patchEntity(draft, payload) {
    const { id, ...config } = payload
    // Taken rather than looked at, because the merge keeps whatever the configuration
    // does not mention, and what it keeps must not be shared with the previous state.
    const existing = draft.take(id)

    // Configuring something that is not there is not a thing that can be done. The world
    // is built in one pass, so a scene naming a thing another scene is yet to put up is
    // ordinary rather than a mistake, and is not worth failing over.
    if (!existing) return

    draft.put(id, augmentEntity(id, { ...existing, ...config }))

    moveToType(draft, id, existing.type, config.type)
  }

  /**
   * Installs a new configuration on a standing thing, dropping what it does not mention.
   *
   * The thing keeps its place in the world and its name; everything else is whatever it
   * is told, and anything it is not told is gone. A field set to `undefined` is set to
   * nothing here as much as it is in a patch -- the difference between the two is what
   * happens to the fields neither mentions.
   *
   * @param {Draft} draft - The draft to change it in.
   * @param {Entity} payload - The thing and the fields it is to be.
   * @returns {void}
   */
  function replaceEntity(draft, payload) {
    const { id, ...config } = payload
    const existing = draft.entities[id]

    if (!existing) return

    draft.put(id, augmentEntity(id, config))

    moveToType(draft, id, existing.type, config.type)
  }

  /**
   * Queues the destruction of an entity. The entity is removed by the `#id:destroy` event.
   * @param {Draft|Entities} draft - Where it stands. The removal itself is queued, so
   *   nothing is written to it here.
   * @param {string} id - The id of the entity to remove.
   * @returns {void}
   */
  function removeEntity(draft, id) {
    incomingEvents.unshift({ type: `#${id}:destroy` })
  }
}

/**
 * A draft that writes straight into the entities it is given.
 *
 * This is the whole of structural sharing's draft, because Mutative's proxy already copies
 * an entity the moment it is written to, and of the state being built by `setState`,
 * which has no previous state to protect.
 *
 * @param {Entities} entities - The entities to write into.
 * @returns {Draft} The draft.
 */
function writeThrough(entities) {
  return {
    entities,
    forSystems: entities,
    take: (id) => entities[id],
    put(id, entity) {
      entities[id] = entity
    },
  }
}

/**
 * A draft that copies an entity the first time it is handed to anything that could
 * write to it.
 *
 * This is what `copy-on-dispatch` is named after: an entity is copied when an event is
 * dispatched to it, and the entities that nothing touches are never paid for. The map is
 * copied straight away, which is cheap -- a reference for every entity -- and an entity
 * is deep-copied only when it is taken: handed to one of its handlers, merged by a
 * `patch`, or read by a system. A frame on which only the pointer moves copies the
 * pointer, and a frame on which nothing at all happens copies nothing but the map.
 *
 * There is no proxy on the entities themselves, which is what still sets this apart
 * from structural sharing: a handler is given a plain object, and pays nothing for
 * writing to it however many times it does. The one proxy is over the map handed to
 * systems, which have no single entity to be given and so have to be given all of them.
 * Each entity a system reads through it is taken, which means a system that walks every
 * entity copies every entity: one that only needs to know how things stood can ask
 * `api.getEntities()` instead, and take only what it writes to.
 *
 * @param {Entities} state - The state to leave as it is.
 * @returns {Draft} The draft.
 */
function copyOnDispatch(state) {
  const entities = { ...state }
  const taken = new Set()

  function take(id) {
    if (!taken.has(id) && Object.hasOwn(entities, id)) {
      entities[id] = clone(entities[id])
      taken.add(id)
    }

    return entities[id]
  }

  function put(id, entity) {
    entities[id] = entity
    taken.add(id)
  }

  const forSystems = new Proxy(entities, {
    get(target, key, receiver) {
      return typeof key === "string" && Object.hasOwn(target, key)
        ? take(key)
        : Reflect.get(target, key, receiver)
    },

    set(target, key, value) {
      put(key, value)
      return true
    },
  })

  return { entities, forSystems, take, put }
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
 * @typedef {"structural-sharing" | "copy-on-dispatch"} UpdateStrategy - How the state is copied before events are applied.
 * @typedef {Object} StoreConfig - Configuration options accepted by {@link createStore}.
 * @typedef {Object.<string, any>} Type - An augmented entity type.
 * @typedef {Object.<string, Type>} Types - A collection of augmented types.
 * @typedef {Object.<string, any>} Entity - An object representing an entity.
 * @typedef {Object.<string, Entity>} Entities - A collection of entities indexed by id.
 * @typedef {Object} Draft - The entities an update writes to, and how it gets at them.
 * @property {Entities} Draft.entities - The entities being built, read without copying.
 * @property {Entities} Draft.forSystems - The entities as handed to systems.
 * @property {(id: string) => Entity|undefined} Draft.take - The entity to write to.
 * @property {(id: string, entity: Entity) => void} Draft.put - Sets an entity outright.
 * @typedef {(listener: () => void) => () => void} Listener - Subscribes to state updates and returns an unsubscribe function.
 * @typedef {Object} Store - The store returned by {@link createStore}.
 */
