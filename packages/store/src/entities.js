import { map } from "@inglorious/utils/objects"

/**
 * @typedef {Object.<string, any>} Entity - An object representing an entity.
 * @typedef {Object.<string, Entity>} Entities - A collection of named entities.
 */

/**
 * Augments a single entity by adding a unique ID.
 *
 * @param {string} id The unique ID for the entity.
 * @param {Entity} entity The raw entity object.
 * @returns {Entity} The augmented entity, including its ID.
 */
export function augmentEntity(id, entity) {
  return { ...entity, id }
}

/**
 * Augments a collection of raw entities, adding a unique ID to each one.
 *
 * @param {Entities} entities The raw entities to be augmented.
 * @returns {Entities} The augmented entities.
 */
export function augmentEntities(entities) {
  return map(entities, augmentEntity)
}
