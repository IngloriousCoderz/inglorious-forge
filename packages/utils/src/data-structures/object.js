import { isFunction } from "../functions/function.js"
import { v } from "../v.js"
import { isArray } from "./array.js"

const INITIAL_LEVEL = 0
const LAST_KEY_OFFSET = 1
const NEXT_KEY_OFFSET = 1
const NEXT_LEVEL = 2

/**
 * Creates a deep clone of a given value using the structured clone algorithm.
 * This is a modern and efficient way to deep-clone objects.
 *
 * Note: `structuredClone` has some limitations. It cannot clone functions,
 * DOM nodes, property descriptors, getters, setters, or certain other
 * non-serializable objects. It will throw a `DataCloneError` in such cases.
 *
 * For more details, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
 *
 * This is similar to Lodash's `_.cloneDeep`.
 *
 * @template T
 * @param {T} obj - The value to clone.
 * @returns {T} A deep clone of the input value.
 */
export function clone(obj) {
  return deserialize(serialize(obj))
}

/**
 * Recursively merges properties from a source object into a target object.
 * This is a helper function for `merge` and `extend`.
 *
 * @param {Object} target - The target object to merge into.
 * @param {Object} source - The source object to merge from.
 * @param {Function} [merger] - An optional function to customize merging behavior for specific keys.
 * @returns {Object} - The modified target object.
 */
function deepMerge(target, source, merger) {
  for (const [key, value] of Object.entries(source)) {
    if (isFunction(merger)) {
      const mergedValue = merger(target[key], value)
      if (mergedValue !== undefined) {
        target[key] = mergedValue
        continue
      }
    }

    if (isArray(value)) {
      target[key] = value
    } else if (isObject(value)) {
      if (!isObject(target[key])) {
        target[key] = {}
      }
      target[key] = deepMerge(target[key], value, merger)
    } else {
      target[key] = value
    }
  }
  return target
}

/**
 * Assigns default properties to a target object from a source object.
 * For each key in `defaultProps`, if `target[key]` is `null` or `undefined`,
 * it is set to `defaultProps[key]`.
 *
 * This function modifies the target object in place.
 *
 * @param {Object} target The object to apply defaults to.
 * @param {Object} defaultProps The object containing the default properties.
 * @returns {Object} The modified target object.
 */
export function defaults(target, defaultProps) {
  for (const key in defaultProps) {
    target[key] ??= defaultProps[key]
  }
  return target
}

/**
 * Deserializes an object, converting plain object representations back into
 * their original types, such as vector-like objects. This is the inverse
 * operation of `serialize`.
 *
 * - Recursively deserializes nested objects.
 * - Converts objects with a `_type: "vector"` property and `coords` array
 *   back into a vector-like object using the `v` factory function.
 * - Copies all other property values as-is.
 *
 * @param {string} str - The JSON string to deserialize.
 * @returns {Object} The deserialized object.
 */
export function deserialize(str) {
  const data = JSON.parse(str)

  return revive(data)

  function revive(value) {
    if (isArray(value)) {
      return value.map(revive)
    }
    if (isObject(value)) {
      if (value._type === "vector" && value.coords) {
        return v(...value.coords)
      }

      const deserialized = {}
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          deserialized[key] = revive(value[key])
        }
      }
      return deserialized
    }
    return value
  }
}

/**
 * Creates a new object by deeply merging a target object with one or more source objects.
 * This function is immutable; it does not modify the original `target` or `sources`.
 * Nested objects are merged recursively.
 * Arrays from a source object will overwrite arrays in the target object.
 *
 * @param {Object} target - The base object.
 * @param {...Object} sources - The source objects to merge into the target object.
 * @returns {Object} - A new object containing the merged properties.
 * @see {@link merge} for a mutable version.
 */
export function extend(target, ...sources) {
  return extendWith(undefined, target, ...sources)
}

/**
 * Creates a new object by deeply merging a target object with one or more source objects,
 * using a custom merger function to handle specific properties.
 * This function is immutable.
 *
 * @param {Function} [merger] - A function to customize merging behavior. It receives `(targetValue, sourceValue)`. If it returns `undefined`, the default merge logic is used.
 * @param {Object} target - The base object.
 * @param {...Object} sources - The source objects to merge.
 * @returns {Object} A new object with the merged properties.
 */
export function extendWith(merger, target, ...sources) {
  return mergeWith(merger, {}, target, ...sources)
}

/**
 * Filters the properties of an object based on a callback function.
 *
 * @param {Object} obj - The object to filter.
 * @param {Function} callback - A function that determines whether a property should be included.
 *                              Receives (key, value, obj) as arguments.
 * @returns {Object} A new object with the filtered properties.
 */
export function filter(obj, callback) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value], obj) =>
      callback(key, value, obj),
    ),
  )
}

/**
 * Finds the first property in an object that satisfies the callback function.
 *
 * @param {Object} obj - The object to search.
 * @param {Function} callback - A function that determines whether a property matches.
 *                              Receives (key, value, obj) as arguments.
 * @returns {Object} An object containing the first matching property, or an empty object if none match.
 */
export function find(obj, callback) {
  return Object.fromEntries([
    Object.entries(obj).find(([key, value], obj) => callback(key, value, obj)),
  ])
}

/**
 * Gets the value at a specified path of an object. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place. This function
 * supports dot-notation for nested properties and numbers for array indices.
 *
 * This is similar to Lodash's `_.get`.
 *
 * @example
 * const object = { 'a': [{ 'b': { 'c': 3 } }] };
 * get(object, 'a.0.b.c');
 * // => 3
 *
 * get(object, 'a.0.d', 'default');
 * // => 'default'
 *
 * @param {Object} obj - The object to query.
 * @param {string} path - The path of the property to retrieve.
 * @param {*} [defaultValue=undefined] - The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value, else the `defaultValue`.
 */
export function get(obj, path, defaultValue = undefined) {
  if (!path) return defaultValue

  const keys = path.split(".")
  let result = obj

  for (const key of keys) {
    if (result == null || typeof result !== "object") {
      return defaultValue
    }
    result = result[key]
  }

  return result !== undefined ? result : defaultValue
}

/**
 * Checks if a value is a plain object.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is a plain object, false otherwise.
 */
/**
 * Whether two values are the same, all the way down.
 *
 * Written here rather than with `JSON.stringify` because stringify cannot tell a key
 * that was left out from one that was set to nothing, and those are different: a key
 * mapped to `undefined` is a key with nothing mapped to it, which is how a mapping is
 * taken off.
 *
 * @param {*} left - The first value.
 * @param {*} right - The second value.
 * @param {WeakMap} [seen] - The pairs already compared, so a structure that contains
 *   itself is not walked for ever. Passed along rather than asked for.
 *
 * What it does not settle is whether two structures *share* the same parts. One value
 * used twice against two equal ones written out twice are reported as different, because
 * only the pairs already met are remembered. That errs towards calling things changed
 * when they are not, which is the safe way round for the thing this is asked about.
 *
 * @returns {boolean} Whether the two are the same.
 */
export function isDeepEqual(left, right, seen = new WeakMap()) {
  if (Object.is(left, right)) return true

  // `Object.is` has already said no to these two being the same object, and neither can be
  // walked: a function is equal to itself and nothing else, and a key present in one and
  // not the other is a difference even when both read as undefined.
  if (typeof left !== "object" || typeof right !== "object") return false
  if (left === null || right === null) return false

  if (Array.isArray(left) !== Array.isArray(right)) return false

  // A thing that contains itself would otherwise be walked for ever. Meeting the same
  // thing twice means it has already been compared, and it was the same then or the walk
  // would have stopped there -- so the only question left is whether it was matched to
  // this one. A structure that loops back to itself differently is a difference, which is
  // what stops this reporting two equal loops that are not.
  if (seen.has(left)) return seen.get(left) === right

  seen.set(left, right)

  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)

  if (leftKeys.length !== rightKeys.length) return false

  return leftKeys.every(
    (key) =>
      Object.hasOwn(right, key) && isDeepEqual(left[key], right[key], seen),
  )
}

export function isObject(value) {
  return value != null && value.constructor === Object
}

/**
 * Maps the properties of an object using a callback function.
 *
 * @param {Object} obj - The object to map.
 * @param {Function} callback - A function that transforms each property.
 *                              Receives (key, value, obj) as arguments.
 * @returns {Object} A new object with the mapped properties.
 */
export function map(obj, callback) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = callback(key, value, obj)
    return acc
  }, {})
}

/**
 * Merges multiple source objects into a target object.
 * This function is mutable; it modifies the `target` object in place.
 * Nested objects are merged recursively.
 * Arrays from a source object will overwrite arrays in the target object.
 *
 * @param {Object} target - The target object to merge into.
 * @param {...Object} sources - The source objects to merge from.
 * @returns {Object} - The merged target object.
 * @see {@link extend} for an immutable version.
 */
export function merge(target, ...sources) {
  return mergeWith(undefined, target, ...sources)
}

/**
 * Merges multiple source objects into a target object, using a custom merger function.
 * This function is mutable; it modifies the `target` object in place.
 *
 * @param {Function} [merger] - A function to customize merging behavior. It receives `(targetValue, sourceValue)`. If it returns `undefined`, the default merge logic is used.
 * @param {Object} target - The target object to merge into.
 * @param {...Object} sources - The source objects to merge from.
 * @returns {Object} The merged target object.
 */
export function mergeWith(merger, target, ...sources) {
  return sources
    .filter((source) => source != null)
    .reduce((acc, source) => deepMerge(acc, source, merger), target)
}

/**
 * A utility function inspired by Immer's `produce` API. It provides a convenient
 * way to work with immutable data structures by allowing "mutations" on a
 * temporary draft.
 *
 * **Important:** Unlike Immer, which uses structural sharing via proxies for
 * high performance, this implementation performs a full deep clone of the base
 * state on every call using `deserialize(serialize())`. This can be
 * inefficient for large or complex states. It is intended for simple use cases
 * where the convenience of the API outweighs the performance cost.
 *
 * The recipe function receives a draft copy of the state. It can either
 * mutate the draft and return nothing (`undefined`), or it can return a
 * completely new value, which will become the next state.
 *
 * Can be called in two ways:
 * - **Standard:** `produce(baseState, recipe, ...args)`
 * - **Curried:** `produce(recipe)` returns a new function `(baseState, ...args) => newState`
 *
 * @template T
 * @param {T|function(T, ...*): (T|void)} baseState The initial state, or a recipe for currying.
 * @param {function(T, ...*): (T|void)} [recipe] The recipe function.
 * @param {...*} args Additional arguments to pass to the recipe.
 * @returns {T | function(T, ...*): T} A new state, or a producer function if curried.
 */
export function produce(baseState, recipe, ...args) {
  if (typeof baseState === "function" && recipe === undefined) {
    const recipeFn = baseState
    return (state, ...recipeArgs) => produce(state, recipeFn, ...recipeArgs)
  }

  const draft = clone(baseState)
  const result = recipe(draft, ...args)
  return result === undefined ? draft : result
}

/**
 * Serializes an object, converting special types like vectors into a plain
 * object representation. This is useful for processes like saving state to a
 * file or sending it over a network.
 *
 * - Recursively serializes nested objects.
 * - Converts objects with a `__isVector__` property into a serializable
 *   format: `{ _type: "vector", coords: [...] }`.
 * - Copies all other property values as-is.
 *
 * @param {Object} obj - The object to serialize.
 * @returns {string} The serialized JSON string.
 */
export function serialize(obj) {
  function replacer(key, value) {
    // Handle top-stage vector
    if (value?.__isVector__) {
      return {
        _type: "vector",
        coords: Array.from(value),
      }
    }

    if (isObject(value)) {
      const serialized = {}

      for (const k in value) {
        if (Object.prototype.hasOwnProperty.call(value, k)) {
          serialized[k] = replacer(undefined, value[k])
        }
      }

      return serialized
    }

    return value
  }

  return JSON.stringify(obj, replacer)
}

/**
 * Sets the value at a specified path of an object. If a portion of the path
 * doesn't exist, it's created. Arrays are created for missing index properties
 * while objects are created for all other missing properties. This function
 * mutates the object.
 *
 * This is similar to Lodash's `_.set`.
 *
 * @example
 * const object = { 'a': [{ 'b': { 'c': 3 } }] };
 * set(object, 'a.0.b.d', 4);
 * // object is now { 'a': [{ 'b': { 'c': 3, 'd': 4 } }] }
 *
 * set(object, 'x.0.y', 5);
 * // object is now { 'a': [...], 'x': [{ 'y': 5 }] }
 *
 * @param {Object} obj - The object to modify.
 * @param {string} path - The path of the property to set.
 * @param {*} value - The value to set.
 * @returns {Object} Returns the modified object.
 */
export function set(obj, path, value) {
  if (!path) return obj

  const keys = path.split(".")
  let current = obj

  for (let i = 0; i < keys.length - LAST_KEY_OFFSET; i++) {
    const key = keys[i]
    const nextKey = keys[i + NEXT_KEY_OFFSET]

    // Create missing intermediate objects
    if (!(key in current) || typeof current[key] !== "object") {
      // Create array if next key is a number, object otherwise
      current[key] = /^\d+$/.test(nextKey) ? [] : {}
    }

    current = current[key]
  }

  current[keys[keys.length - LAST_KEY_OFFSET]] = value
  return obj
}

/**
 * Converts an object or array to a formatted string representation.
 *
 * @param {*} obj - The object or array to convert.
 * @param {number} [indentationLevel=INITIAL_LEVEL] - The current indentation stage (used for nested structures).
 * @returns {string} A string representation of the input object or array.
 */
export function toString(obj, indentationLevel = INITIAL_LEVEL) {
  if (Array.isArray(obj)) {
    return `[
${obj
  .map(
    (item) =>
      " ".repeat(indentationLevel + NEXT_LEVEL) +
      toString(item, indentationLevel + NEXT_LEVEL),
  )
  .join(",\n")}
${" ".repeat(indentationLevel)}]`
  }

  if (typeof obj === "object" && obj != null) {
    return `{
${Object.entries(obj)
  .map(
    ([key, value]) =>
      `${" ".repeat(indentationLevel + NEXT_LEVEL)}${key}: ${toString(
        value,
        indentationLevel + NEXT_LEVEL,
      )}`,
  )
  .join(",\n")}
${" ".repeat(indentationLevel)}}`
  }

  if (typeof obj === "string") {
    return `"${obj}"`
  }

  return obj
}
