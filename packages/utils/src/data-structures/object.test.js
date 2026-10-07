import { expect, test } from "vitest"

import { v } from "../v.js"
import { isArray } from "./array.js"
import {
  clone,
  deserialize,
  extend,
  extendWith,
  filter,
  find,
  get,
  isDeepEqual,
  isObject,
  map,
  merge,
  mergeWith,
  produce,
  serialize,
  set,
  toString,
} from "./object.js"

test("it should deep clone an object", () => {
  const obj = {
    primitive: 1,
    array: [2, 3],
    object: { a: 1, b: 2 },
  }
  const expectedResult = {
    primitive: 1,
    array: [2, 3],
    object: { a: 1, b: 2 },
  }

  const result = clone(obj)

  expect(result).toStrictEqual(expectedResult)
  expect(result).not.toBe(expectedResult)
  expect(result.primitive).toBe(expectedResult.primitive)
  expect(result.array).not.toBe(expectedResult.array)
  expect(result.object).not.toBe(expectedResult.object)
})

test("it should behave like Array.prototype.filter, but on an object", () => {
  const obj = {
    key1: "value1",
    key2: "value2",
    key3: "value3",
  }
  const callback = (key) => ["key2", "key3"].includes(key)
  const expectedResult = {
    key2: "value2",
    key3: "value3",
  }

  expect(filter(obj, callback)).toStrictEqual(expectedResult)
})

test("it should behave like Array.prototype.find, but on an object", () => {
  const obj = {
    key1: "value1",
    key2: "value2",
    key3: "value3",
  }
  const callback = (key) => ["key2", "key3"].includes(key)
  const expectedResult = {
    key2: "value2",
  }

  expect(find(obj, callback)).toStrictEqual(expectedResult)
})

test("get should retrieve a value from a nested object", () => {
  const obj = { a: { b: { c: 1 } }, d: [{ e: 2 }] }

  expect(get(obj, "a.b.c")).toBe(1)
})

test("get should retrieve a value from an array within an object", () => {
  const obj = { a: { b: { c: 1 } }, d: [{ e: 2 }] }

  expect(get(obj, "d.0.e")).toBe(2)
})

test("get should return a default value for a non-existent path", () => {
  const obj = { a: { b: { c: 1 } } }

  expect(get(obj, "a.x.y", "default")).toBe("default")
})

test("get should return undefined for a non-existent path without a default value", () => {
  const obj = { a: { b: { c: 1 } } }

  expect(get(obj, "a.x.y")).toBeUndefined()
})

test("get should handle null or undefined paths gracefully", () => {
  const obj = { a: 1 }

  expect(get(obj, null, "default")).toBe("default")
  expect(get(obj, undefined, "default")).toBe("default")
})

test("set should modify a value at a given path", () => {
  const obj = { a: { b: 1 } }
  set(obj, "a.b", 2)
  expect(obj.a.b).toBe(2)
})

test("set should create nested objects if they do not exist", () => {
  const obj = {}
  set(obj, "a.b.c", 3)
  expect(obj).toStrictEqual({ a: { b: { c: 3 } } })
})

test("set should create nested arrays for numeric keys", () => {
  const obj = {}
  set(obj, "a.0.b", "value")
  expect(obj).toStrictEqual({ a: [{ b: "value" }] })
})

test("set should return the mutated object", () => {
  const obj = { a: 1 }
  const result = set(obj, "b", 2)
  expect(result).toBe(obj)
  expect(result).toStrictEqual({ a: 1, b: 2 })
})

test("it correctly should check if a value is an object", () => {
  expect(isObject(1)).toBe(false)
  expect(isObject("a")).toBe(false)
  expect(isObject([])).toBe(false)
  expect(isObject(null)).toBe(false)
  expect(isObject(new Date())).toBe(false)
  expect(isObject({})).toBe(true)
})

test("it should behave like Array.prototype.map, but on an object", () => {
  const obj = {
    key1: "value1",
    key2: "value2",
    key3: "value3",
  }
  const callback = (key, value) => value.toUpperCase()
  const expectedResult = {
    key1: "VALUE1",
    key2: "VALUE2",
    key3: "VALUE3",
  }

  expect(map(obj, callback)).toStrictEqual(expectedResult)
})

test("it should produce a new state without mutating the original", () => {
  const baseState = {
    a: 1,
    b: {
      c: [2, 3],
      d: { e: 4 },
    },
    f: 5,
  }

  const recipe = (draft) => {
    draft.a = 10
    draft.b.c.push(4)
    draft.b.d.e = 40
    draft.g = 6
  }

  const expectedState = {
    a: 10,
    b: {
      c: [2, 3, 4],
      d: { e: 40 },
    },
    f: 5,
    g: 6,
  }

  const originalBaseState = deserialize(serialize(baseState))

  const nextState = produce(baseState, recipe)

  expect(nextState).toStrictEqual(expectedState)
  expect(nextState).not.toBe(baseState)
  expect(baseState).toStrictEqual(originalBaseState)
})

test("it should support currying to produce a new state", () => {
  const baseState = {
    a: 1,
    b: {
      c: [2, 3],
      d: { e: 4 },
    },
    f: 5,
  }
  const originalStateCopy = clone(baseState)

  const recipe = (draft) => {
    draft.a = 10
    draft.b.c.push(4)
    draft.g = 6
  }

  const expectedState = {
    a: 10,
    b: {
      c: [2, 3, 4],
      d: { e: 4 },
    },
    f: 5,
    g: 6,
  }

  const producer = produce(recipe)
  const nextState = producer(baseState)

  expect(nextState).toStrictEqual(expectedState)
  expect(nextState).not.toBe(baseState)
  expect(baseState).toStrictEqual(originalStateCopy)
})

test("it should pass extra arguments to the recipe", () => {
  const baseState = { value: 1 }
  const recipe = (draft, increment, multiplier) => {
    draft.value = (draft.value + increment) * multiplier
  }

  // Test non-curried version
  const nextStateUncurried = produce(baseState, recipe, 2, 3) // (1 + 2) * 3 = 9
  expect(nextStateUncurried.value).toBe(9)

  // Test curried version
  const producer = produce(recipe)
  const nextStateCurried = producer(baseState, 4, 5) // (1 + 4) * 5 = 25
  expect(nextStateCurried.value).toBe(25)

  expect(baseState.value).toBe(1)
})

test("it should return a string representation of a shallow object", () => {
  const obj = {
    key1: "value1",
    key2: "value2",
    key3: "value3",
  }

  expect(toString(obj)).toBe(`{
  key1: "value1",
  key2: "value2",
  key3: "value3"
}`)
})

test("it should return a string representation of a nested object", () => {
  const obj = {
    a: 1,
    b: [7, 3],
    c: { d: 4, h: 8 },
    e: [{ f: 5, i: 9 }],
    g: 6,
  }

  expect(toString(obj)).toBe(`{
  a: 1,
  b: [
    7,
    3
  ],
  c: {
    d: 4,
    h: 8
  },
  e: [
    {
      f: 5,
      i: 9
    }
  ],
  g: 6
}`)
})

test("it should serialize a basic object with primitive values", () => {
  const obj = { a: 1, b: "hello", c: true }
  const expected = `{"a":1,"b":"hello","c":true}`

  expect(serialize(obj)).toBe(expected)
})

test("it should serialize an object with nested objects", () => {
  const obj = { a: 1, b: { c: "nested", d: { e: false } } }
  const expected = `{"a":1,"b":{"c":"nested","d":{"e":false}}}`

  expect(serialize(obj)).toBe(expected)
})

test("it should serialize an object containing a vector-like object", () => {
  const obj = { position: v(1, 2, 3) }
  const expected = `{"position":{"_type":"vector","coords":[1,2,3]}}`

  expect(serialize(obj)).toBe(expected)
})

test("it should serialize an object with nested vector-like objects", () => {
  const obj = {
    entity: {
      id: "player",
      pos: v(10, 20),
      vel: v(1, 0),
      stats: { health: 100 },
    },
  }
  const expected = `{"entity":{"id":"player","pos":{"_type":"vector","coords":[10,20]},"vel":{"_type":"vector","coords":[1,0]},"stats":{"health":100}}}`

  expect(serialize(obj)).toBe(expected)
})

test("it should serialize an empty object", () => {
  const obj = {}
  const expected = `{}`

  expect(serialize(obj)).toBe(expected)
})

test("it should serialize an object with null and undefined values (undefined should be omitted)", () => {
  const obj = { a: null, b: undefined, c: 1 }
  const expected = `{"a":null,"c":1}` // JSON.stringify omits undefined properties

  expect(serialize(obj)).toBe(expected)
})

test("it should deserialize a basic object with primitive values", () => {
  const serialized = `{"a":1,"b":"hello","c":true}`
  const expected = { a: 1, b: "hello", c: true }

  expect(deserialize(serialized)).toStrictEqual(expected)
})

test("it should deserialize an object with nested objects", () => {
  const serialized = `{"a":1,"b":{"c":"nested","d":{"e":false}}}`
  const expected = { a: 1, b: { c: "nested", d: { e: false } } }

  expect(deserialize(serialized)).toStrictEqual(expected)
})

test("it should deserialize an object containing a vector representation", () => {
  const serialized = `{"position":{"_type":"vector","coords":[1,2,3]}}`
  const expected = { position: v(1, 2, 3) }

  const result = deserialize(serialized)

  expect(result).toStrictEqual(expected)
  expect(result.position.__isVector__).toBe(true)
})

test("it should deserialize an object with nested vector representations", () => {
  const serialized = `{"entity":{"id":"player","pos":{"_type":"vector","coords":[10,20]},"vel":{"_type":"vector","coords":[1,0]},"stats":{"health":100}}}`
  const expected = {
    entity: {
      id: "player",
      pos: v(10, 20),
      vel: v(1, 0),
      stats: { health: 100 },
    },
  }
  const result = deserialize(serialized)

  expect(result).toStrictEqual(expected)
  expect(result.entity.pos.__isVector__).toBe(true)
  expect(result.entity.vel.__isVector__).toBe(true)
})

test("it should deserialize an empty object", () => {
  const serialized = `{}`
  const expected = {}

  expect(deserialize(serialized)).toStrictEqual(expected)
})

test("it should correctly round-trip a complex object through serialize and deserialize", () => {
  const original = {
    id: "game1",
    player: { name: "Alice", score: 100, position: v(10, 20) },
    enemies: [{ type: "goblin", pos: v(5, 5) }],
    settings: { volume: 0.8, mute: false },
  }
  const jsonString = serialize(original)
  const deserialized = deserialize(jsonString)

  expect(deserialized).toStrictEqual(original)
  expect(deserialized.player.position.__isVector__).toBe(true)
  expect(deserialized.enemies[0].pos.__isVector__).toBe(true)
  // Ensure that non-vector objects are still distinct references if they were originally
  expect(deserialized.player).not.toBe(original.player)
})

test("it should extend an object with another, producing a new object as a result", () => {
  const obj1 = {
    primitiveKept: 1,
    primitiveMerged: 2,
    primitiveArrayKept: [1, 2],
    primitiveArrayMerged: [3, 4],
    primitiveObjectKept: { a: 1 },
    primitiveObjectMerged: { b: 2, c: 3 },
    nestedArrayKept: [{ a: 1 }],
    nestedArrayMerged: [{ b: 2, c: 3 }],
    nestedObjectKept: { a: { b: 2 } },
    nestedObjectMerged: { c: { d: 4 } },
  }
  const obj2 = {
    primitiveMerged: 3,
    primitiveAdded: 4,
    primitiveArrayMerged: [5],
    primitiveArrayAdded: [6, 7],
    primitiveObjectMerged: { c: 4 },
    primitiveObjectAdded: { d: 4 },
    nestedArrayMerged: [{ d: 4 }],
    nestedArrayAdded: [{ e: 5 }],
    nestedObjectMerged: { c: { e: 5 } },
    nestedObjectAdded: { f: { g: 7 } },
  }
  const expectedResult = {
    primitiveKept: 1,
    primitiveMerged: 3,
    primitiveAdded: 4,
    primitiveArrayKept: [1, 2],
    primitiveArrayMerged: [5],
    primitiveArrayAdded: [6, 7],
    primitiveObjectKept: { a: 1 },
    primitiveObjectMerged: { b: 2, c: 4 },
    primitiveObjectAdded: { d: 4 },
    nestedArrayKept: [{ a: 1 }],
    nestedArrayMerged: [{ d: 4 }],
    nestedArrayAdded: [{ e: 5 }],
    nestedObjectKept: { a: { b: 2 } },
    nestedObjectMerged: { c: { d: 4, e: 5 } },
    nestedObjectAdded: { f: { g: 7 } },
  }

  const result = extend(obj1, obj2)
  expect(result).toStrictEqual(expectedResult)
  expect(result).not.toBe(obj1)
})

test("it should deep merge an two objects, changing the first object in place", () => {
  const obj1 = {
    primitiveKept: 1,
    primitiveMerged: 2,
    primitiveArrayKept: [1, 2],
    primitiveArrayMerged: [3, 4],
    primitiveObjectKept: { a: 1 },
    primitiveObjectMerged: { b: 2, c: 3 },
    nestedArrayKept: [{ a: 1 }],
    nestedArrayMerged: [{ b: 2, c: 3 }],
    nestedObjectKept: { a: { b: 2 } },
    nestedObjectMerged: { c: { d: 4 } },
  }
  const obj2 = {
    primitiveMerged: 3,
    primitiveAdded: 4,
    primitiveArrayMerged: [5],
    primitiveArrayAdded: [6, 7],
    primitiveObjectMerged: { c: 4 },
    primitiveObjectAdded: { d: 4 },
    nestedArrayMerged: [{ d: 4 }],
    nestedArrayAdded: [{ e: 5 }],
    nestedObjectMerged: { c: { e: 5 } },
    nestedObjectAdded: { f: { g: 7 } },
  }
  const expectedResult = {
    primitiveKept: 1,
    primitiveMerged: 3,
    primitiveAdded: 4,
    primitiveArrayKept: [1, 2],
    primitiveArrayMerged: [5],
    primitiveArrayAdded: [6, 7],
    primitiveObjectKept: { a: 1 },
    primitiveObjectMerged: { b: 2, c: 4 },
    primitiveObjectAdded: { d: 4 },
    nestedArrayKept: [{ a: 1 }],
    nestedArrayMerged: [{ d: 4 }],
    nestedArrayAdded: [{ e: 5 }],
    nestedObjectKept: { a: { b: 2 } },
    nestedObjectMerged: { c: { d: 4, e: 5 } },
    nestedObjectAdded: { f: { g: 7 } },
  }

  const result = merge(obj1, obj2)
  expect(result).toStrictEqual(expectedResult)
  expect(result).toBe(obj1)
})

test("it should extend an object with a custom merger, producing a new object", () => {
  const obj1 = {
    primitiveArrayMerged: [3, 4],
    nestedArrayMerged: [{ b: 2, c: 3 }],
    nestedObjectMerged: { c: { d: 4 } },
  }
  const obj2 = {
    primitiveArrayMerged: [5],
    nestedArrayMerged: [{ d: 4 }],
    nestedObjectMerged: { c: { e: 5 } },
  }

  const merger = (targetValue, sourceValue) => {
    if (isArray(targetValue) && isArray(sourceValue)) {
      return targetValue.concat(sourceValue)
    }
    return undefined // Use default logic for non-arrays
  }

  const expectedResult = {
    primitiveArrayMerged: [3, 4, 5], // Concatenated
    nestedArrayMerged: [{ b: 2, c: 3 }, { d: 4 }], // Concatenated
    nestedObjectMerged: { c: { d: 4, e: 5 } }, // Default deep merge
  }

  const result = extendWith(merger, obj1, obj2)
  expect(result).toStrictEqual(expectedResult)
  expect(result).not.toBe(obj1)
})

test("it should merge an object with a custom merger, changing the first object in place", () => {
  const obj1 = {
    primitiveArrayMerged: [3, 4],
    nestedArrayMerged: [{ b: 2, c: 3 }],
    nestedObjectMerged: { c: { d: 4 } },
  }
  const obj2 = {
    primitiveArrayMerged: [5],
    nestedArrayMerged: [{ d: 4 }],
    nestedObjectMerged: { c: { e: 5 } },
  }

  const merger = (targetValue, sourceValue) => {
    if (isArray(targetValue) && isArray(sourceValue)) {
      return targetValue.concat(sourceValue)
    }
    return undefined // Use default logic for non-arrays
  }

  const expectedResult = {
    primitiveArrayMerged: [3, 4, 5], // Concatenated
    nestedArrayMerged: [{ b: 2, c: 3 }, { d: 4 }], // Concatenated
    nestedObjectMerged: { c: { d: 4, e: 5 } }, // Default deep merge
  }

  const result = mergeWith(merger, obj1, obj2)
  expect(result).toStrictEqual(expectedResult)
  expect(result).toBe(obj1)
})

test("extendWith without a merger should behave like extend", () => {
  const obj1 = { a: 1, b: { c: 2 }, d: [3] }
  const obj2 = { a: 10, b: { d: 20 }, d: [30] }

  const expected = {
    a: 10,
    b: { c: 2, d: 20 },
    d: [30],
  }

  const result = extendWith(undefined, obj1, obj2)
  expect(result).toStrictEqual(expected)
  expect(result).not.toBe(obj1)

  const extendResult = extend(obj1, obj2)
  expect(result).toStrictEqual(extendResult)
})

test("mergeWith without a merger should behave like merge", () => {
  const obj1 = { a: 1, b: { c: 2 }, d: [3] }
  const obj2 = { a: 10, b: { d: 20 }, d: [30] }

  const expected = {
    a: 10,
    b: { c: 2, d: 20 },
    d: [30],
  }

  const result = mergeWith(undefined, obj1, obj2)
  expect(result).toStrictEqual(expected)
  expect(result).toBe(obj1)

  const mergeResult = merge({ a: 1, b: { c: 2 }, d: [3] }, obj2)
  expect(result).toStrictEqual(mergeResult)
})

test("it should tell two values the same all the way down", () => {
  expect(
    isDeepEqual({ a: 1, b: [1, { c: 2 }] }, { a: 1, b: [1, { c: 2 }] }),
  ).toBe(true)
  expect(
    isDeepEqual({ a: 1, b: [1, { c: 2 }] }, { a: 1, b: [1, { c: 3 }] }),
  ).toBe(false)
  expect(isDeepEqual([1, 2], [1, 2])).toBe(true)
  expect(isDeepEqual([1, 2], [2, 1])).toBe(false)
})

test("it should tell a key left out from a key set to nothing", () => {
  // The reason this is written rather than with `JSON.stringify`: the two stringify the
  // same, and they are not the same. Setting a key to nothing is how a mapping is taken
  // off, so the difference has to be the one it sees.
  expect(isDeepEqual({}, { ArrowUp: undefined })).toBe(false)
  expect(isDeepEqual({ ArrowUp: undefined }, {})).toBe(false)
  expect(isDeepEqual({ ArrowUp: undefined }, { ArrowUp: undefined })).toBe(true)
})

test("it should tell values of different shapes apart", () => {
  expect(isDeepEqual({ a: 1 }, { a: "1" })).toBe(false)
  expect(isDeepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  expect(isDeepEqual([1], { 0: 1 })).toBe(false)
  expect(isDeepEqual(null, {})).toBe(false)
  expect(isDeepEqual(null, null)).toBe(true)
  expect(isDeepEqual(NaN, NaN)).toBe(true)
})

test("it should say the same object is the same without walking it", () => {
  const object = { a: { b: { c: 1 } } }

  expect(isDeepEqual(object, object)).toBe(true)
  expect(isDeepEqual(object.a, object.a)).toBe(true)
})

test("it should compare a thing that contains itself without walking it for ever", () => {
  // Two loops that are the same all the way round are the same; two that come back to
  // themselves differently are not. Before this was noticed, the first of those ran the
  // stack out while the second quietly said no, which is the worst way round to fail.
  const looping = (name) => {
    const thing = { name }

    thing.self = thing

    return thing
  }

  expect(isDeepEqual(looping("a"), looping("a"))).toBe(true)
  expect(isDeepEqual(looping("a"), looping("b"))).toBe(false)

  const together = { name: "a", back: null }
  const other = { name: "a", back: null }
  together.back = together
  other.back = other

  expect(isDeepEqual(together, other)).toBe(true)
})
