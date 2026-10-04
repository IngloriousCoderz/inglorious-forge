import { describe, expect, test } from "vitest"

import { v } from "../v.js"
import { sqrt } from "./numbers.js"
import { cos, pi, sin } from "./trigonometry.js"

const X = 0
const Y = 1
const Z = 2
import {
  abs,
  angle,
  clamp,
  conjugate,
  createVector,
  cross,
  distance,
  divide,
  divideBy,
  dot,
  from2D,
  fromAngle,
  isVector,
  magnitude,
  mod,
  modOf,
  multiply,
  negate,
  normalize,
  power,
  powerOf,
  randomVector,
  rotate,
  setAngle,
  setMagnitude,
  shift,
  snap,
  subtract,
  sum,
  to2D,
  toCartesian,
  toCylindrical,
  toPolar,
  toSpherical,
  toString,
  unit,
  zero,
} from "./vectors.js"

test("it should compute the absolute value of a vector's coordinates", () => {
  const vector = v(-2, 0, 3)
  const expectedResult = v(2, 0, 3)

  expect(abs(vector)).toStrictEqual(expectedResult)
})

test("it should compute the angle of a 2D vector", () => {
  const vector = v(1, 1)
  const expectedResult = pi() / 4

  expect(angle(vector)).toBe(expectedResult)
})

test("it should compute the angle of a 3D vector", () => {
  const vector = v(1, 0, 1)
  const expectedResult = pi() / 4

  expect(angle(vector)).toBe(expectedResult)
})

test("it should clamp the magnitude of a vector to a certain length if too long", () => {
  const vector = v(6, 8)
  const min = 0
  const max = 5
  const expectedResult = v(3, 4)

  expect(clamp(vector, min, max)).toStrictEqual(expectedResult)
})

test("it should not clamp the magnitude of a vector to a certain length if not too long", () => {
  const vector = v(3, 4)
  const min = 0
  const max = 6
  const expectedResult = v(3, 4)

  expect(clamp(vector, min, max)).toStrictEqual(expectedResult)
})

test("it should clamp the magnitude of a vector to the values of other vector bounds", () => {
  const vector = v(6, 8)
  const lowerBound = [0, 0]
  const upperBound = [3, 4]
  const expectedResult = v(3, 4)

  expect(clamp(vector, lowerBound, upperBound)).toStrictEqual(expectedResult)
})

test("it should conjugate a vector", () => {
  const vector = v(1, 2, 3)
  const expectedResult = v(1, -2, -3)

  expect(conjugate(vector)).toStrictEqual(expectedResult)
})

test("it should create a 3D vector given its magnitude and angle", () => {
  const magnitude = sqrt(2)
  const angle = pi() / 4
  const expectedResult = v(1, -0, 1.0000000000000002) // close to v(1, 0, 1)

  expect(createVector(magnitude, angle)).toStrictEqual(expectedResult)
})

test("it should divide a vector by a scalar", () => {
  const vector = v(4, 8, 12)
  const scalar = 4
  const expectedResult = v(1, 2, 3)

  expect(divide(vector, scalar)).toStrictEqual(expectedResult)
})

test("it should divide a scalar by a vector", () => {
  const scalar = 12
  const vector = v(4, 8, 12)
  const expectedResult = v(3, 1.5, 1)

  expect(divideBy(scalar, vector)).toStrictEqual(expectedResult)
})

test("it should build a 3D vector from a 2D one", () => {
  const vector = v(3, 4)
  const expectedResult = v(3, 0, 4)

  expect(from2D(vector)).toStrictEqual(expectedResult)
})

test("it should create a 3D unit vector from an angle", () => {
  const angle = pi() / 4
  const expectedResult = v(0.7071067811865475, -0, 0.7071067811865476) // close to [cos(angle), 0, sin(angle)]

  expect(fromAngle(angle)).toStrictEqual(expectedResult)
})

test("it should compute the magnitude of a vector (aka length)", () => {
  const vector = v(3, 4)
  const expectedResult = 5

  expect(magnitude(vector)).toBe(expectedResult)
})

test("it should check if a value is a vector", () => {
  expect(isVector([1, 2, 3])).toBe(false)
  expect(isVector(v(1, 2, 3))).toBe(true)
})

test("it should check if a value is not a vector", () => {
  expect(isVector([1, "a", 3])).toBe(false)
  expect(isVector({ x: 1, y: 2 })).toBe(false)
  expect(isVector(null)).toBe(false)
  expect(isVector("vector")).toBe(false)
  expect(isVector(123)).toBe(false)
})

test("it should apply the mod operator (aka remainder) on a vector", () => {
  const vector = v(10, 12, -18)
  const divisor = 12
  const expectedResult = v(10, 0, 6)

  expect(mod(vector, divisor)).toStrictEqual(expectedResult)
})

test("it should apply the mod operator of a scalar with a vector", () => {
  const scalar = 18
  const vector = v(10, 12, -18)
  const expectedResult = v(8, 6, -0)

  expect(modOf(scalar, vector)).toStrictEqual(expectedResult)
})

test("it should multiply a vector with a scalar (aka times)", () => {
  const vector = v(1, 2, 3)
  const scalar = 4
  const expectedResult = v(4, 8, 12)

  expect(multiply(vector, scalar)).toStrictEqual(expectedResult)
})

test("it should normalize a vector so it has unit length", () => {
  const vector = v(3, 4)
  const expectedResult = v(0.6, 0.8)

  expect(normalize(vector)).toStrictEqual(expectedResult)
})

test("it should normalize a negative vector", () => {
  const vector = v(-3, -4)
  const expectedResult = v(-0.6, -0.8)

  expect(normalize(vector)).toStrictEqual(expectedResult)
})

test("it should raise each component of a vector to the given exponent (aka pow)", () => {
  const vector = v(1, 2, 3)
  const exponent = 2
  const expectedResult = v(1, 4, 9)

  expect(power(vector, exponent)).toStrictEqual(expectedResult)
})

test("it should raise a scalar to the power of each component of a vector", () => {
  const scalar = 2
  const vector = v(1, 2, 3)
  const expectedResult = v(2, 4, 8)

  expect(powerOf(scalar, vector)).toStrictEqual(expectedResult)
})

test("it should rotate a 2D vector by a certain angle", () => {
  const vector = v(1, 0)
  const angle = pi() / 4
  const expectedResult = v(0.7071067811865475, 0.7071067811865476) // close to [cos(pi/4), sin(pi/4)]

  expect(rotate(vector, angle)).toStrictEqual(expectedResult)
})

test("it should not rotate a vector when the angle is zero", () => {
  const vector = v(1, 0, 0)
  const angle = 0
  const expectedResult = v(1, 0, 0)

  expect(rotate(vector, angle)).toStrictEqual(expectedResult)
})

test("it should rotate a vector by a certain angle", () => {
  const vector = v(1, 0, 0)
  const angle = pi() / 4
  const expectedResult = v(0.7071067811865475, -0, 0.7071067811865476) // close to [cos(pi/4), 0, sin(pi/4)]

  expect(rotate(vector, angle)).toStrictEqual(expectedResult)
})

test("it should rotate a vector that faces left by a certain angle", () => {
  const vector = v(-1, 0, 0)
  const angle = pi() / 4
  const expectedResult = v(-0.7071067811865475, -0, -0.7071067811865476) // close to [cos(-3/4pi), 0, sin(-3/4pi)]

  expect(rotate(vector, angle)).toStrictEqual(expectedResult)
})

test("it should change the angle of a vector", () => {
  const vector = v(cos(pi() / 4), 0, sin(pi() / 4))
  const expectedResult = v(6.123233995736766e-17, 0, 1) // close to v(0, 0, 1)

  expect(setAngle(vector, 1.5707963267948966)).toStrictEqual(expectedResult)
})

test("it should change magnitude of a vector (aka setLength)", () => {
  const vector = v(3, 4)
  const magnitude = 10
  const expectedResult = v(6, 8)

  expect(setMagnitude(vector, magnitude)).toStrictEqual(expectedResult)
})

test("it should change magnitude of a negative vector", () => {
  const vector = v(-3, -4)
  const magnitude = 10
  const expectedResult = v(-6, -8)

  expect(setMagnitude(vector, magnitude)).toStrictEqual(expectedResult)
})

test("it should shift a vector at a certain index", () => {
  const vector = v(1, 2, 3, 4, 5)
  const index = 2
  const expectedResult = v(3, 4, 5, 1, 2)

  expect(shift(vector, index)).toStrictEqual(expectedResult)
})

test("it should snap a floating vector to a certain precision", () => {
  const vector = v(1, 1.5, 1.7)
  const precision = 1
  const expectedResult = v(1, 1, 2)

  expect(snap(vector, precision)).toStrictEqual(expectedResult)
})

test("it should build a 2D vector from a 3D one", () => {
  const vector = v(3, 0, 4)
  const expectedResult = v(3, 4)

  expect(to2D(vector)).toStrictEqual(expectedResult)
})

test("it should convert a 2D polar vector to cartesian coordinates", () => {
  const vector = v(sqrt(2), pi() / 4)
  const expectedResult = v(1.0000000000000002, 1)

  expect(toCartesian(vector)).toStrictEqual(expectedResult)
})

test("it should convert a 3D cartesian vector to cylindrical coordinates", () => {
  const vector = v(1, 1, 1)
  const expectedResult = v(1.2247448713915892, 1.224744871391589, 1)

  expect(toCylindrical(vector)).toStrictEqual(expectedResult)
})

test("it should convert a 2D cartesian vector to polar coordinates", () => {
  const vector = v(1, 1)
  const expectedResult = v(sqrt(2), pi() / 4)

  expect(toPolar(vector)).toStrictEqual(expectedResult)
})

test("it should convert a 3D cartesian vector to spherical coordinates", () => {
  const vector = v(1, 1, 1)
  const expectedResult = v(sqrt(3), Math.acos(1 / sqrt(3)), pi() / 4)

  expect(toSpherical(vector)).toStrictEqual(expectedResult)
})

test("it should create a string representation of an integer vector", () => {
  const vector = v(3, 4)
  const expectedResult = "[3, 4]"

  expect(toString(vector)).toBe(expectedResult)
})

test("it should create a string representation of a float vector", () => {
  const vector = v(pi() / 4, pi() / 4)
  const decimals = 2
  const expectedResult = "[0.79, 0.79]"

  expect(toString(vector, decimals)).toBe(expectedResult)
})

test("it should create a unit vector oriented on the X-axis", () => {
  expect(unit()).toStrictEqual(v(1, 0, 0))
})

test("it should create a unit vector oriented on the Z-axis", () => {
  expect(unit(pi() / 2)).toStrictEqual(v(6.123233995736766e-17, 0, 1)) // close to v(0, 0, 1)
})

test("it should create a vector from a list of coordinates", () => {
  expect(v(1, 2, 3)).toStrictEqual([1, 2, 3])
  expect(v()).toStrictEqual([])
  expect(v(0, -5.5)).toStrictEqual([0, -5.5])
})

test("it should create a 3D zero vector", () => {
  const expectedResult = v(0, 0, 0)

  expect(zero()).toStrictEqual(expectedResult)
})

test("it should compute the cross product between two vectors (aka vectorProduct)", () => {
  const vector1 = v(1, 2, 3)
  const vector2 = v(4, 5, 6)
  const expectedResult = v(-3, 6, -3)

  expect(cross(vector1, vector2)).toStrictEqual(expectedResult)
})

test("it should compute the cross product of multiple vectors (aka vectorProduct)", () => {
  const vectors = [v(1, 2, 3), v(4, 5, 6), v(7, 8, 9)]
  const expectedResult = v(78, 6, -66)

  expect(cross(...vectors)).toStrictEqual(expectedResult)
})

test("it should compute the distance between multiple vectors", () => {
  const vectors = [v(0, 0, 0), v(4, 0, 3)]
  const expectedResult = 5

  expect(distance(...vectors)).toStrictEqual(expectedResult)
})

test("it should divide multiple vectors component-wise", () => {
  const vectors = [v(80, 40, 20), v(2, 4, 5), v(2, 2, 2)]
  const expectedResult = v(20, 5, 2)

  expect(divide(...vectors)).toStrictEqual(expectedResult)
})

test("it should compute the dot product of multiple vectors (aka scalarProduct)", () => {
  const vectors = [v(1, 2, 3), v(4, 5, 6), v(7, 8, 9)]
  const expectedResult = 270

  expect(dot(...vectors)).toStrictEqual(expectedResult)
})

test("it should multiply multiple vectors component-wise (Hadamard product)", () => {
  const vectors = [v(1, 2, 3), v(4, 5, 6), v(2, 2, 2)]
  const expectedResult = v(8, 20, 36)

  expect(multiply(...vectors)).toStrictEqual(expectedResult)
})

test("it should raise a vector to the power of another vector", () => {
  const vectors = [v(2, 3, 4), v(4, 3, 2)]
  const expectedResult = v(16, 27, 16)

  expect(power(...vectors)).toStrictEqual(expectedResult)
})

test("it should subtract multiple vectors", () => {
  const vectors = [v(1, 2, 3), v(4, 5, 6), v(7, 8, 9)]
  const expectedResult = v(-10, -11, -12)

  expect(subtract(...vectors)).toStrictEqual(expectedResult)
})

test("it should sum multiple vectors (aka add)", () => {
  const vectors = [v(1, 2, 3), v(4, 5, 6), v(7, 8, 9)]
  const expectedResult = v(12, 15, 18)

  expect(sum(...vectors)).toStrictEqual(expectedResult)
})

test("it should broadcast a scalar operand to every component when combining with vectors", () => {
  expect(divide(v(80, 40, 20), v(2, 4, 5), 2)).toStrictEqual(v(20, 5, 2))
  expect(mod(v(17, 25, 31), v(6, 7, 8), 4)).toStrictEqual(v(1, 0, 3))
  expect(multiply(v(1, 2, 3), v(4, 5, 6), 2)).toStrictEqual(v(8, 20, 36))
  expect(power(v(2, 3, 4), v(4, 3, 2), 2)).toStrictEqual(v(256, 729, 256))
})

describe("negate", () => {
  test("it should flip the direction of every component", () => {
    expect(negate([1, -2, 3])).toStrictEqual([-1, 2, -3])
  })

  test("it should answer negative zero for zero", () => {
    // Negating zero gives negative zero: equal to zero in any calculation, but not
    // strictly equal, so it will not match a `toStrictEqual` on `[0, 0, 0]`.
    const negated = negate([0, 0, 0])

    expect(Object.is(negated[X], -0)).toBe(true)
    expect(negated[X] === 0).toBe(true)
  })

  test("it should be its own inverse", () => {
    expect(negate(negate([4, -5, 6]))).toStrictEqual([4, -5, 6])
  })

  test("it should add back up to nothing", () => {
    expect(sum([10, 20, 30], negate([10, 20, 30]))).toStrictEqual([0, 0, 0])
  })

  test("it should return a vector", () => {
    expect(isVector(negate([1, 2, 3]))).toBe(true)
  })

  test("it should not modify the vector it is given", () => {
    const vector = [1, 2, 3]

    negate(vector)

    expect(vector).toStrictEqual([1, 2, 3])
  })
})

describe("randomVector", () => {
  const sample = (low, high, attempts = 200) =>
    Array.from({ length: attempts }, () => randomVector(low, high))

  test("it should keep every component within its own range", () => {
    sample([-15, 0, 0], [15, 80, 0]).forEach((vector) => {
      expect(vector[X]).toBeGreaterThanOrEqual(-15)
      expect(vector[X]).toBeLessThanOrEqual(15)
      expect(vector[Y]).toBeGreaterThanOrEqual(0)
      expect(vector[Y]).toBeLessThanOrEqual(80)
      expect(vector[Z]).toBe(0)
    })
  })

  test("it should reach both ends of the range", () => {
    const xs = sample([-10, 0, 0], [10, 0, 0]).map((vector) => vector[X])

    expect(Math.min(...xs)).toBeLessThan(-9)
    expect(Math.max(...xs)).toBeGreaterThan(9)
  })

  test("it should give a fixed axis exactly that value", () => {
    // A range that starts and ends on the same number can only answer it, which is
    // how an axis is held still.
    sample([0, 7, 0], [0, 7, 0]).forEach((vector) => {
      expect(vector[Y]).toBe(7)
    })
  })

  test("it should default a missing bound to zero", () => {
    sample(undefined, [5, 0, 0]).forEach((vector) => {
      expect(vector[X]).toBeGreaterThanOrEqual(0)
      expect(vector[X]).toBeLessThanOrEqual(5)
      expect(vector[Y]).toBe(0)
      expect(vector[Z]).toBe(0)
    })
  })

  test("it should answer zeroes when given nothing", () => {
    expect(randomVector()).toStrictEqual([0, 0, 0])
    expect(randomVector(undefined, undefined)).toStrictEqual([0, 0, 0])
  })

  test("it should not return the same value twice in a row", () => {
    const values = new Set(sample([0, 0, 0], [100, 0, 0]).map((v) => v[X]))

    expect(values.size).toBeGreaterThan(1)
  })

  test("it should return a vector", () => {
    expect(isVector(randomVector([0, 0, 0], [1, 1, 1]))).toBe(true)
  })
})
