/**
 * @typedef {Object.<string, any>} Type - An object representing an augmented entity type.
 * @typedef {Object.<string, any>} Entity - An object representing a entity.
 */

const SPLIT_LIMIT = 2

/**
 * A class to manage the mapping of event names to the entity IDs that handle them.
 * This is used for optimized event handling with support for scoped events.
 *
 * Do not replace it with a scan of all entities: every event would then visit
 * every entity, and a game dispatching dozens of events a frame over thousands
 * of entities cannot afford that (see the comparison in event-map.test.js).
 */
export class EventMap {
  /**
   * Creates an instance of EventMap and initializes it with entities and their types.
   *
   * @param {Object.<string, Type>} types - An object containing all augmented type definitions.
   * @param {Object.<string, Entity>} entities - An object containing all entities.
   */
  constructor(types, entities) {
    /**
     * Maps handler names to type names to Sets of entity IDs.
     * Structure: handlerName -> typeName -> Set<entityId>
     * Example: 'submit' -> 'form' -> Set(['loginForm', 'signupForm'])
     *
     * @type {Map<string, Map<string, Set<string>>>}
     */
    this.handlerToTypeToEntities = new Map()

    /**
     * Maps entity IDs to their type names for quick lookup.
     *
     * @type {Map<string, string>}
     */
    this.entityTypes = new Map()

    for (const entityId in entities) {
      const entity = entities[entityId]
      const type = types[entity.type]
      if (type) {
        this.addEntity(entityId, type, entity.type)
      }
    }
  }

  /**
   * Adds an entity's ID to the Sets for all event handlers defined in its type.
   * This should be called when a new entity is created or its type is changed via setType.
   *
   * @param {string} entityId - The ID of the entity.
   * @param {Type} type - The augmented type object of the entity.
   * @param {string} typeName - The name of the entity's type.
   */
  addEntity(entityId, type, typeName) {
    this.entityTypes.set(entityId, typeName)

    for (const handlerName in type) {
      if (typeof type[handlerName] !== "function") continue

      if (!this.handlerToTypeToEntities.has(handlerName)) {
        this.handlerToTypeToEntities.set(handlerName, new Map())
      }

      const typeMap = this.handlerToTypeToEntities.get(handlerName)
      if (!typeMap.has(typeName)) {
        typeMap.set(typeName, new Set())
      }

      typeMap.get(typeName).add(entityId)
    }
  }

  /**
   * Removes an entity's ID from the Sets for all event handlers defined in its type.
   * This should be called when an entity is removed or its type is changed via setType.
   *
   * @param {string} entityId - The ID of the entity.
   * @param {Type} type - The augmented type object of the entity.
   * @param {string} typeName - The name of the entity's type.
   */
  removeEntity(entityId, type, typeName) {
    this.entityTypes.delete(entityId)

    for (const handlerName in type) {
      const typeMap = this.handlerToTypeToEntities.get(handlerName)
      if (typeMap) {
        const entitySet = typeMap.get(typeName)
        if (entitySet) {
          entitySet.delete(entityId)
        }
      }
    }
  }

  /**
   * Retrieves the array of entity IDs that should handle a given event.
   * Supports scoped events:
   * - 'submit' -> all entities with 'submit' handler
   * - 'form:submit' -> all form entities with 'submit' handler
   * - 'form#loginForm:submit' -> only loginForm entity (of type form)
   * - '#loginForm:submit' -> only loginForm entity
   *
   * @param {string} eventString - The event string (e.g., 'submit', 'form:submit', 'form[id]:submit')
   * @returns {string[]} An array of entity IDs that should handle this event.
   */
  getEntitiesForEvent(eventString) {
    const {
      type: targetType,
      entityId: targetEntityId,
      event: handlerName,
    } = parseEvent(eventString)

    const typeMap = this.handlerToTypeToEntities.get(handlerName)
    if (!typeMap) return []

    if (targetEntityId) {
      const type = targetType ?? this.entityTypes.get(targetEntityId)
      const entitySet = typeMap.get(type)
      return entitySet && entitySet.has(targetEntityId) ? [targetEntityId] : []
    }

    if (targetType) {
      const entitySet = typeMap.get(targetType)
      return entitySet ? Array.from(entitySet) : []
    }

    const allEntities = []
    for (const entitySet of typeMap.values()) {
      allEntities.push(...entitySet)
    }
    return allEntities
  }
}

/**
 * Parses an event string into its components.
 * @param {string} eventString - The event string (e.g., 'submit', 'form:submit', 'form#loginForm:submit')
 * @returns {{ type: string|null, entityId: string|null, event: string }}
 */
export function parseEvent(eventString) {
  const [left, event] = eventString.split(":", SPLIT_LIMIT)
  if (!event) return { type: null, entityId: null, event: left }

  const [type, entityId] = left.split("#", SPLIT_LIMIT)
  return {
    type: type || null,
    entityId: entityId || null,
    event,
  }
}
