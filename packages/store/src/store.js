import { clone } from "@inglorious/utils/data-structures/object.js"
import {
  namesNear,
  toCamelCase,
} from "@inglorious/utils/data-structures/string.js"
import { create, current, isDraft, original } from "mutative"

import { createApi } from "./api.js"
import { augmentEntities, augmentEntity } from "./entities.js"
import { EventMap, parseEvent } from "./event-map.js"
import { applyMiddlewares } from "./middlewares.js"
import { compute, createSelector } from "./select.js"
import { augmentType, augmentTypes } from "./types.js"

/** Copies only the entities that change, through a draft proxy. */
const STRUCTURAL_SHARING = "structural-sharing"

/** Deep-copies each entity as it is handed out, with no proxy. */
const COPY_ON_DISPATCH = "copy-on-dispatch"

const UPDATE_STRATEGIES = [STRUCTURAL_SHARING, COPY_ON_DISPATCH]

/** Every engine's message for touching a revoked proxy says "revoked". */
const REVOKED = /revoked/i

/** What engines say when code writes to a frozen object. */
const FROZEN = /read[- ]only|not extensible|cannot (assign|delete|define)/i

/** Events every entity gets, whether or not its type answers them. */
const LIFECYCLE_EVENTS = ["create", "destroy"]

/**
 * Creates a store to manage state and events.
 *
 * Events are queued and applied one at a time, each in a transaction of its own:
 * the handlers of one event all see the state as it was before that event, through
 * `api.getEntity()` and `api.getEntities()`, and the next event in the queue sees what
 * the previous one changed. Subscribers are notified once the queue is empty.
 *
 * The `updateStrategy` option controls how an event's changes are copied:
 *
 * - `"structural-sharing"` (default) - Applies the event to a draft proxy, so only the
 *   entities that actually changed are copied. Unchanged entities keep their previous
 *   reference, which makes reference-equality change detection cheap. The right choice
 *   for UI stores, where a few entities change at a time.
 * - `"copy-on-dispatch"` - Deep-copies each entity the first time the event hands it to a
 *   handler or a system, and applies the event to the copy, without a proxy. It scales
 *   better when thousands of entities change every frame, as in a game simulation.
 *
 * @param {StoreConfig} config - Configuration options for the store.
 * @param {Types} [config.types] - The initial types configuration.
 * @param {Entities} [config.entities] - The initial entities configuration.
 * @param {Object[]} [config.systems] - Handlers that receive every entity at once, run after the entities' own handlers.
 * @param {Function[]} [config.middlewares] - Functions that each take the store and return it,
 *   changed or wrapped. The first wraps all the others, so events pass through them in order.
 * @param {boolean} [config.autoCreateEntities=false] - Creates an entity for each type that has none.
 * @param {"auto" | "manual"} [config.updateMode="auto"] - Whether each event triggers an update, or updates are batched until `update()` is called.
 * @param {UpdateStrategy} [config.updateStrategy="structural-sharing"] - How an event's changes are copied.
 * @param {boolean} [config.devMode=false] - Under structural sharing, freezes the state, so a write to an entity a handler was not given throws an error that says so.
 * @returns {Store} The store with methods to interact with state and events.
 * @throws {TypeError} If `updateStrategy` is not a supported strategy.
 */
export { compute, createSelector }

export function createStore({
  types: originalTypes = {},
  entities: originalEntities = {},
  systems = [],
  middlewares = [],
  autoCreateEntities = false,
  updateMode = "auto",
  updateStrategy = STRUCTURAL_SHARING,
  devMode = false,
} = {}) {
  assertUpdateStrategy(updateStrategy)

  const listeners = new Set()
  const warned = new Set()

  const types = augmentTypes(originalTypes)

  let state, activeDraft, eventMap, incomingEvents, isProcessing, isNotifying
  let isHalted
  reset()

  const baseStore = {
    subscribe,
    update,
    notify,
    dispatch,
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
   * Applies the queued events and notifies subscribers once. Each event is a
   * transaction: its handlers see, through the api, the state as the previous
   * event left it, and the next event sees what they changed. An event notified
   * by a subscriber is queued and applied after the subscribers have run, so a
   * render never nests inside another.
   *
   * @returns {Event[]} The events processed during this update.
   */
  function update() {
    if (isProcessing || !incomingEvents.length) {
      return []
    }

    isProcessing = true
    const processedEvents = []

    try {
      if (updateStrategy === STRUCTURAL_SHARING) {
        state = create(state, (root) => drain(writeThrough(root)), {
          enableAutoFreeze: devMode,
        })
      } else {
        const draft = copyOnDispatch(state)
        drain(draft)
        state = draft.entities
      }
    } catch (error) {
      // The update is rolled back whole, and the events still queued with it.
      incomingEvents = []
      throw error
    } finally {
      activeDraft = null
      isProcessing = false
    }

    isNotifying = true
    listeners.forEach((onUpdate) => onUpdate())
    isNotifying = false

    if (updateMode === "auto" && incomingEvents.length) {
      update()
    }

    return processedEvents

    function drain(draft) {
      activeDraft = draft
      while (incomingEvents.length) {
        const event = incomingEvents.shift()
        processedEvents.push(event)
        handle(draft, event)
        draft.commit()
      }
    }
  }

  /**
   * Hands one event to the store's own handling, then to the entities that answer
   * it, then to the systems.
   * @param {Draft} draft - The draft to apply the event to.
   * @param {Event} event - The event.
   * @returns {void}
   */
  function handle(draft, event) {
    if (event.type === "pause") isHalted = true
    if (event.type === "resume") isHalted = false
    if (event.type === "add") addEntity(draft, event.payload)
    if (event.type === "remove") removeEntity(event.payload)
    if (event.type === "patch") patchEntity(draft, event.payload)
    if (event.type === "replace") replaceEntity(draft, event.payload)

    const {
      type: targetType,
      entityId: targetId,
      event: handlerName,
    } = parseEvent(event.type)
    const entityIds = eventMap.getEntitiesForEvent(event.type)

    if (!entityIds.length) {
      warnIfUnanswered(draft, targetType, targetId, handlerName)
    }

    // A halted world hands out no `update`, so anything that integrates a delta
    // time stops. An entity with `updatesWhilePaused` is exempt. It is read off the
    // entity rather than the type, so that a type stays an index signature of handlers.
    const halted = isHalted && handlerName === "update"

    for (const id of entityIds) {
      const entity = draft.entities[id]
      if (halted && !entity.updatesWhilePaused) continue

      const handler = types[entity.type][handlerName]
      if (!handler) continue

      const result = callHandler(
        () => handler(draft.take(id), event.payload, api),
        `${entity.type}.${handlerName}`,
      )
      explainLateAccess(result, entity.type, handlerName)
    }

    if (handlerName === "destroy" && targetId) {
      const entity = draft.entities[targetId]
      if (entity) {
        draft.remove(targetId)
        eventMap.removeEntity(targetId, types[entity.type], entity.type)
      }
    }

    systems.forEach((system) => {
      if (!system[handlerName]) return
      callHandler(
        () => system[handlerName](draft.forSystems, event.payload, api),
        `A system's ${handlerName}`,
      )
    })
  }

  /**
   * Notifies the store of a new event. Supports scoped events:
   * - 'submit' - broadcast to all entities with a submit handler
   * - 'Form:submit' - only Form entities
   * - '#loginForm:submit' - only the loginForm entity
   *
   * `pause` stops the store handing out `update` events and `resume` starts it again;
   * an entity with `updatesWhilePaused` keeps updating. Both still reach the types
   * that handle them.
   *
   * @param {string} type - The event type to notify.
   * @param {any} payload - The event payload. Carries the least that can be had
   *   about what happened.
   */
  /**
   * Calls a handler. In dev mode, where the state is frozen, a write to a
   * frozen object can only be a write to an entity the handler was not given,
   * such as one read through the api: say so.
   * @param {() => unknown} call - The handler, called.
   * @param {string} name - Who the handler is, for the message.
   * @returns {unknown} What the handler returned.
   */
  function callHandler(call, name) {
    if (!devMode) return call()

    try {
      return call()
    } catch (error) {
      if (!(error instanceof TypeError) || !FROZEN.test(error.message)) {
        throw error
      }
      throw new TypeError(
        `${name} wrote to an entity it was not given, such as one read with api.getEntity() or api.getEntities(). Those are the state as the previous event left it, and are read-only: notify an event to that entity instead.`,
        { cause: error },
      )
    }
  }

  function notify(type, payload) {
    // Through store.dispatch rather than dispatch, so that middlewares see it.
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
    if (updateMode === "auto" && !isNotifying) {
      update()
    }
  }

  /**
   * Retrieves the augmented types configuration.
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
   * and a type can be added while rendering. Entities already of a type being
   * added get their `create` now: when they were added, it reached no handler.
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
        if (!oldType) notify(`#${id}:create`)
      }
    }

    if (autoCreateEntities && !hasEntityOfType(typeName)) {
      notify("add", { id: toCamelCase(typeName), type: typeName })
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
    return activeDraft ? activeDraft.readAll() : state
  }

  /**
   * One entity by its id, or `undefined` if there is no such entity. During an
   * update, as the previous event left it.
   *
   * @param {string} id - The entity's id.
   * @returns {Object|undefined} The entity.
   */
  function getEntity(id) {
    return activeDraft ? activeDraft.read(id) : state?.[id]
  }

  /**
   * Sets the entire state of the store, such as state coming from a server.
   * Entities that are new get `create`, entities that are gone get `destroy`.
   * @param {Entities} nextState - The new state to set.
   * @returns {void}
   */
  function setState(nextState) {
    const oldEntities = state ?? {}
    const newEntities = augmentEntities(nextState)

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

    state = { ...oldEntities }
    eventMap = new EventMap(types, oldEntities)
    activeDraft = null
    incomingEvents = []
    isProcessing = false
    isNotifying = false

    entitiesToDestroy.forEach((id) => {
      removeEntity(id)
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
        if (!hasEntityOfType(typeName)) {
          addEntity(writeThrough(state), {
            id: toCamelCase(typeName),
            type: typeName,
          })
        }
      }
    }

    if (devMode && updateStrategy === STRUCTURAL_SHARING) deepFreeze(state)
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
    warnIfUndeclared(id, entity.type)

    eventMap.addEntity(id, types[entity.type], entity.type)
    incomingEvents.unshift({ type: `#${id}:create` })
  }

  /**
   * Moves an entity onto the handlers of the type it now names, if it changed.
   * @param {string} id - The entity.
   * @param {string} previousType - The type it was under.
   * @param {string|undefined} type - The type it is under now, if it named one.
   * @returns {void}
   */
  function moveToType(id, previousType, type) {
    if (!type || type === previousType) return

    eventMap.removeEntity(id, types[previousType], previousType)
    eventMap.addEntity(id, types[type], type)
  }

  /**
   * Merges a configuration into an existing entity. Only the fields it names
   * change; a field set to `undefined` is cleared.
   * @param {Draft} draft - The draft to change it in.
   * @param {Entity} payload - The entity's id and the fields to merge.
   * @returns {void}
   */
  function patchEntity(draft, payload) {
    const { id, ...config } = payload
    // Taken rather than read, so that what the merge keeps is not shared with the
    // previous state.
    const existing = draft.take(id)

    if (!existing) return

    draft.put(id, augmentEntity(id, { ...existing, ...config }))

    moveToType(id, existing.type, config.type)
  }

  /**
   * Replaces an existing entity with a configuration, dropping what it does not name.
   * @param {Draft} draft - The draft to change it in.
   * @param {Entity} payload - The entity's id and the fields it is to have.
   * @returns {void}
   */
  function replaceEntity(draft, payload) {
    const { id, ...config } = payload
    const existing = draft.entities[id]

    if (!existing) return

    draft.put(id, augmentEntity(id, config))

    moveToType(id, existing.type, config.type)
  }

  /**
   * Queues the destruction of an entity: the `#id:destroy` event removes it.
   * @param {string} id - The id of the entity to remove.
   * @returns {void}
   */
  function removeEntity(id) {
    incomingEvents.unshift({ type: `#${id}:destroy` })
  }

  function hasEntityOfType(typeName) {
    return Object.values(state).some((entity) => entity.type === typeName)
  }

  /**
   * Warns once about an entity whose type looks like a misspelling of a declared
   * one. A type with no declared name near it may still be registered later, as
   * a lazily loaded page's is, so nothing is said about it.
   * @param {string} id - The entity.
   * @param {string} typeName - The type it names.
   * @returns {void}
   */
  function warnIfUndeclared(id, typeName) {
    if (types[typeName]) return

    const near = namesNear(typeName, Object.keys(types))
    if (!near.length) return

    warnOnce(
      `undeclared:${typeName}`,
      `Entity "${id}" has type "${typeName}", which is not declared: did you mean ${near.map((name) => `"${name}"`).join(" or ")}?`,
    )
  }

  /**
   * Warns once about a targeted event that nothing answers: an entity whose type
   * has no such handler, or a type name that is not declared. A broadcast that
   * nobody answers is fine, and so is an entity that is gone or whose type is
   * still to come.
   * @param {Draft} draft - The draft the event was applied to.
   * @param {string|null} targetType - The type the event names.
   * @param {string|null} targetId - The entity the event names.
   * @param {string} handlerName - The event.
   * @returns {void}
   */
  function warnIfUnanswered(draft, targetType, targetId, handlerName) {
    if (LIFECYCLE_EVENTS.includes(handlerName)) return
    if (systems.some((system) => system[handlerName])) return

    if (targetId) {
      const entity = draft.entities[targetId]
      const type = entity && types[entity.type]
      if (!type || type[handlerName]) return

      warnOnce(
        `${entity.type}:${handlerName}`,
        `"${handlerName}" reached "${targetId}", whose type "${entity.type}" has no such handler.`,
      )
      return
    }

    if (!targetType) return

    const type = types[targetType]
    if (!type) {
      const near = namesNear(targetType, Object.keys(types))
      warnOnce(
        `type:${targetType}`,
        `"${targetType}:${handlerName}" names a type that is not declared${near.length ? `: did you mean ${near.map((name) => `"${name}"`).join(" or ")}?` : "."}`,
      )
      return
    }

    if (type[handlerName]) return

    warnOnce(
      `${targetType}:${handlerName}`,
      `"${targetType}:${handlerName}" reached no entity: the type has no such handler.`,
    )
  }

  function warnOnce(key, message) {
    if (warned.has(key)) return
    warned.add(key)
    console.warn(`[store] ${message}`)
  }
}

/**
 * Defines a behavior for an entity. It does nothing at runtime: it hands back
 * the behavior it is given, and JavaScript apps never need it.
 *
 * It is for TypeScript apps, like Vue's `defineComponent` or Vite's
 * `defineConfig`: its declaration in `types/store.d.ts` checks each member of
 * the behavior by its name, so that a template's sub-renderers can take props
 * while the handlers still get the entity, which a plain annotation cannot
 * express. See that declaration for why.
 *
 * @returns {(behavior: object) => object} A function that returns the behavior it is given.
 */
export function defineType() {
  return (behavior) => behavior
}

/**
 * A draft over Mutative's proxy, which copies an entity the moment it is written
 * to. What an event reads through the api is what stood before the event: an
 * entity no earlier event of the pass wrote to is read from the original state,
 * and the value of one that an earlier event wrote to is kept when this event
 * writes to it again.
 *
 * @param {Entities} entities - The entities to write into.
 * @returns {Draft} The draft.
 */
function writeThrough(entities) {
  const base = isDraft(entities) ? original(entities) : entities
  const writtenEarlier = new Set()
  const before = new Map()
  let all = null

  function remember(id) {
    if (before.has(id)) return
    before.set(id, writtenEarlier.has(id) ? plain(entities[id]) : base[id])
  }

  return {
    entities,
    forSystems: entities,
    take(id) {
      remember(id)
      return entities[id]
    },
    put(id, entity) {
      remember(id)
      entities[id] = entity
    },
    remove(id) {
      remember(id)
      delete entities[id]
    },
    read(id) {
      if (before.has(id)) return before.get(id)
      return writtenEarlier.has(id) ? plain(entities[id]) : base[id]
    },
    readAll() {
      if (!all) {
        all = { ...base }
        for (const id of writtenEarlier) {
          if (Object.hasOwn(entities, id)) all[id] = plain(entities[id])
          else delete all[id]
        }
        all = overlay(all, before)
      }
      return all
    },
    commit() {
      for (const id of before.keys()) writtenEarlier.add(id)
      before.clear()
      all = null
    },
  }
}

/**
 * A draft that copies an entity the first time an event hands it to anything
 * that could write to it: one of its handlers, a `patch`, or a system. The map
 * is copied once, which costs a reference per entity, and the entities nothing
 * touches are never copied. The copy an earlier event made is what a later
 * event reads, and is copied again if that event writes to it. A system that
 * only reads should go through `api.getEntities()`, since each entity it reads
 * through its first argument is copied.
 *
 * @param {Entities} state - The state to leave as it is.
 * @returns {Draft} The draft.
 */
function copyOnDispatch(state) {
  const entities = { ...state }
  const before = new Map()
  let all = null

  function remember(id) {
    if (!before.has(id)) before.set(id, entities[id])
  }

  function take(id) {
    if (!before.has(id) && Object.hasOwn(entities, id)) {
      before.set(id, entities[id])
      entities[id] = clone(entities[id])
    }

    return entities[id]
  }

  function put(id, entity) {
    remember(id)
    entities[id] = entity
  }

  function remove(id) {
    remember(id)
    delete entities[id]
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

    deleteProperty(target, key) {
      remove(key)
      return true
    },
  })

  return {
    entities,
    forSystems,
    take,
    put,
    remove,
    read(id) {
      return before.has(id) ? before.get(id) : entities[id]
    },
    readAll() {
      all ??= overlay(entities, before)
      return all
    },
    commit() {
      before.clear()
      all = null
    },
  }
}

/**
 * The value of a draft as it stands, or the value itself if it is not a draft.
 * @param {any} value - A draft or a plain value.
 * @returns {any} A plain value.
 */
function plain(value) {
  return isDraft(value) ? current(value) : value
}

/**
 * The entities with the values kept from before the event put back.
 * @param {Entities} entities - The entities as they stand.
 * @param {Map<string, Entity|undefined>} before - The values from before the event.
 * @returns {Entities} The entities as they stood before the event.
 */
function overlay(entities, before) {
  const all = { ...entities }
  for (const [id, entity] of before) {
    if (entity === undefined) delete all[id]
    else all[id] = entity
  }
  return all
}

/**
 * Freezes an object and everything it holds.
 * @param {unknown} value
 * @returns {unknown} The value.
 */
function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value
  }
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

/**
 * Gives a clearer error when an async handler touches its entity after an
 * `await`: the entity is a draft of the update, revoked once the update ends.
 * @param {unknown} result - What the handler returned.
 * @param {string} typeName - The handler's type.
 * @param {string} handlerName - The handler.
 * @returns {void}
 */
function explainLateAccess(result, typeName, handlerName) {
  if (typeof result?.then !== "function") return

  result.then(undefined, (error) => {
    if (!(error instanceof TypeError) || !REVOKED.test(error.message)) {
      throw error
    }

    throw new TypeError(
      `${typeName}.${handlerName} accessed its entity after an async operation, when the update it belonged to had ended. Read what you need from the entity into a variable before the first await, or notify a new event after it and let that event's handler change the entity.`,
      { cause: error },
    )
  })
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
 * @typedef {"structural-sharing" | "copy-on-dispatch"} UpdateStrategy - How an event's changes are copied.
 * @typedef {Object} StoreConfig - Configuration options accepted by {@link createStore}.
 * @typedef {Object.<string, any>} Type - An augmented entity type.
 * @typedef {Object.<string, Type>} Types - A collection of augmented types.
 * @typedef {Object.<string, any>} Entity - An object representing an entity.
 * @typedef {Object.<string, Entity>} Entities - A collection of entities indexed by id.
 * @typedef {{ type: string, payload?: any }} Event - An event.
 * @typedef {Object} Draft - The entities an event writes to, and how it gets at them.
 * @property {Entities} Draft.entities - The entities being built, read without copying.
 * @property {Entities} Draft.forSystems - The entities as handed to systems.
 * @property {(id: string) => Entity|undefined} Draft.take - The entity to write to.
 * @property {(id: string, entity: Entity) => void} Draft.put - Sets an entity outright.
 * @property {(id: string) => void} Draft.remove - Deletes an entity.
 * @property {(id: string) => Entity|undefined} Draft.read - An entity as it stood before the event.
 * @property {() => Entities} Draft.readAll - The entities as they stood before the event.
 * @property {() => void} Draft.commit - Ends the event: what it changed is what the next one reads.
 * @typedef {(listener: () => void) => () => void} Listener - Subscribes to state updates and returns an unsubscribe function.
 * @typedef {Object} Store - The store returned by {@link createStore}.
 */
