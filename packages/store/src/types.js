import { ensureArray } from "@inglorious/utils/data-structures/array.js"
import { pipe } from "@inglorious/utils/functions"
import { extend, map } from "@inglorious/utils/object.js"

/**
 * Augments a single type by composing its behaviors and mixins.
 * If a behavior is an object, it's treated as a mixin and its properties are extended onto the type.
 * If a behavior is a function, it's called with the current type object to apply its logic.
 *
 * @param {Type|AugmentFunction[]} type The raw type definition, which can be an object or an array of mixins/functions.
 * @returns {Type} The fully composed and augmented type object.
 */
export function augmentType(type) {
  const behaviors = ensureArray(type).map(
    (behavior) => (type) =>
      extend(type, typeof behavior === "function" ? behavior(type) : behavior),
  )

  return pipe(...behaviors)({})
}

/**
 * @typedef {Object.<string, any>} Type - An object representing an entity's base type or a behavioral mixin.
 * @typedef {Object.<string, Type>} Types - A collection of named type definitions.
 * @typedef {Function} AugmentFunction - A function that applies augmentations.
 */

/**
 * Augments a collection of raw type definitions into a usable format.
 * This process applies all behaviors and mixins to each type.
 *
 * @param {Types} types The raw types to be augmented.
 * @returns {Types} The augmented types, with all behaviors composed.
 */
export function augmentTypes(types) {
  return map(types, (_, type) => augmentType(type))
}
