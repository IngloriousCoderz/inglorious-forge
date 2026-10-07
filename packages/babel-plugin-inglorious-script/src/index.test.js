import { transformSync } from "@babel/core"
import { expect, test } from "vitest"

import ingloriousScript from "./index.js"

function transform(code) {
  return transformSync(code, {
    plugins: [ingloriousScript],
    sourceType: "module",
  }).code
}

// Existing tests
test("it should transform vector + vector addition", () => {
  const code = `const v1 = v(1, 2);
const v2 = v(3, 4);
const result = v1 + v2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector * scalar multiplication", () => {
  const code = `const v1 = v(1, 2);
const s = 2;
const result = v1 * s;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform scalar * vector multiplication", () => {
  const code = `const v1 = v(1, 2);
const s = 2;
const result = s * v1;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle direct v() calls", () => {
  const code = `const result = v(1, 2) + v(3, 4);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle chained additions", () => {
  const code = `const v1 = v(1, 2);
const v2 = v(3, 4);
const v3 = v(5, 6);
const result = v1 + v2 + v3;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle mixed addition and scaling", () => {
  const code = `const v1 = v(1, 2);
const v2 = v(3, 4);
const s = 2;
const result = v1 + v2 * s;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should not transform scalar + scalar addition", () => {
  const code = "const result = 1 + 2;"

  expect(transform(code)).toBe(code)
})

test("it should transform vector * vector multiplication", () => {
  const code = `const v1 = v(1, 2);
const v2 = v(3, 4);
const result = v1 * v2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should trace variable declarations", () => {
  const code = `const pos = v(1, 2);
const vel = v(3, 4);
const newPos = pos + vel;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle imported vectors", () => {
  const code = `import { initialPosition } from './vector.js';
const result = initialPosition + v(1, 2);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should throw an error for vector + scalar", () => {
  const code = `const result = v(1, 2) + 5;`

  expect(() => transform(code)).toThrow("Cannot add a vector and a non-vector.")
})

test("it should throw an error for scalar - vector", () => {
  const code = `const result = 5 - v(1, 2);`

  expect(() => transform(code)).toThrow(
    "Cannot subtract a vector and a non-vector.",
  )
})

// New tests for additional operations

test("it should transform vector - vector subtraction", () => {
  const code = `const v1 = v(5, 6);
const v2 = v(1, 2);
const result = v1 - v2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector / scalar division", () => {
  const code = `const v1 = v(10, 20);
const s = 2;
const result = v1 / s;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector / vector division", () => {
  const code = `const v1 = v(10, 20);
const v2 = v(2, 4);
const result = v1 / v2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector % scalar modulus", () => {
  const code = `const v1 = v(15, 25);
const s = 10;
const result = v1 % s;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector % vector modulus", () => {
  const code = `const v1 = v(15, 25);
const v2 = v(10, 10);
const result = v1 % v2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform unary minus on vector", () => {
  const code = `const v1 = v(1, 2);
const result = -v1;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should not transform unary plus on vector", () => {
  const code = `const v1 = v(1, 2);
const result = +v1;`

  expect(transform(code)).toMatchSnapshot()
})

// Compound assignment tests

test("it should transform vector += vector", () => {
  const code = `let v1 = v(1, 2);
const v2 = v(3, 4);
v1 += v2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector -= vector", () => {
  const code = `let v1 = v(5, 6);
const v2 = v(1, 2);
v1 -= v2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector *= scalar", () => {
  const code = `let v1 = v(1, 2);
const s = 2;
v1 *= s;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector /= scalar", () => {
  const code = `let v1 = v(10, 20);
const s = 2;
v1 /= s;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector %= scalar", () => {
  const code = `let v1 = v(15, 25);
const s = 10;
v1 %= s;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should throw an error for vector += scalar", () => {
  const code = `let v1 = v(1, 2);
v1 += 5;`

  expect(() => transform(code)).toThrow("Cannot add a vector and a non-vector.")
})

test("it should throw an error for vector -= scalar", () => {
  const code = `let v1 = v(1, 2);
v1 -= 5;`

  expect(() => transform(code)).toThrow(
    "Cannot subtract a vector and a non-vector.",
  )
})

test("it should transform vector *= vector", () => {
  const code = `let v1 = v(1, 2);
const v2 = v(3, 4);
v1 *= v2;`

  expect(transform(code)).toMatchSnapshot()
})

// Division and modulus operations

test("it should transform scalar / vector", () => {
  const code = `const v1 = v(1, 2);
const result = 5 / v1;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform scalar % vector", () => {
  const code = `const v1 = v(1, 2);
const result = 5 % v1;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector ** scalar", () => {
  const code = `const v1 = v(1, 2);
const result = v1 ** 2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector ** vector", () => {
  const code = `const v1 = v(1, 2);
const v2 = v(3, 4);
const result = v1 ** v2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform scalar ** vector", () => {
  const code = `const v1 = v(1, 2);
const result = 2 ** v1;`

  expect(transform(code)).toMatchSnapshot()
})

// Complex chaining tests

test("it should handle chaining with division", () => {
  const code = `const v1 = v(10, 20);
const v2 = v(1, 2);
const result = v1 / 2 + v2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle chaining with modulus", () => {
  const code = `const v1 = v(15, 25);
const v2 = v(1, 2);
const result = v1 % 10 + v2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle chaining with unary minus", () => {
  const code = `const v1 = v(1, 2);
const v2 = v(3, 4);
const result = -v1 + v2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle complex mixed operations", () => {
  const code = `const position = v(10, 20);
const velocity = v(1, 2);
const dt = 0.16;
const worldSize = 100;
const newPosition = (position + velocity * dt) % worldSize;`

  expect(transform(code)).toMatchSnapshot()
})

// Edge cases

test("it should handle nested expressions", () => {
  const code = `const v1 = v(1, 2);
const v2 = v(3, 4);
const v3 = v(5, 6);
const result = v1 + (v2 - v3) * 2;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle assignment to object properties", () => {
  const code = `const obj = { pos: v(0, 0) };
const velocity = v(1, 2);
obj.pos += velocity;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle array element assignment", () => {
  const code = `const positions = [v(0, 0), v(1, 1)];
const velocity = v(1, 2);
positions[0] += velocity;`

  expect(transform(code)).toMatchSnapshot()
})

// Tests for ensuring regular number operations are NOT transformed

test("it should not transform number + number addition", () => {
  const code = "const result = 5 + 3;"
  expect(transform(code)).toBe(code)
})

test("it should not transform number - number subtraction", () => {
  const code = "const result = 10 - 4;"
  expect(transform(code)).toBe(code)
})

test("it should not transform number * number multiplication", () => {
  const code = "const result = 6 * 7;"
  expect(transform(code)).toBe(code)
})

test("it should not transform number / number division", () => {
  const code = "const result = 15 / 3;"
  expect(transform(code)).toBe(code)
})

test("it should not transform number % number modulus", () => {
  const code = "const result = 17 % 5;"
  expect(transform(code)).toBe(code)
})

test("it should not transform number compound assignments", () => {
  const code = `let x = 10;
x += 5;
x -= 2;
x *= 3;
x /= 2;
x %= 7;`
  expect(transform(code)).toBe(code)
})

test("it should not transform unary minus on numbers", () => {
  const code = `const x = 5;
const result = -x;`
  expect(transform(code)).toBe(code)
})

test("it should transform member expression operations (runtime check)", () => {
  const code = `const obj = {
  count: 5,
  speed: 10
};
obj.count += 3;
obj.speed *= 2;
const result = obj.count + obj.speed;`
  expect(transform(code)).toMatchSnapshot()
})

test("it should transform array element operations (runtime check)", () => {
  const code = `const numbers = [1, 2, 3];
numbers[0] += 5;
numbers[1] *= 2;
const sum = numbers[0] + numbers[1];`
  expect(transform(code)).toMatchSnapshot()
})

// Additional runtime safety tests

test("it should throw an error for mixed vector/scalar subtraction", () => {
  const code = `const a = v(1, 2);
const b = 3;
const c = v(4, 5);
const result = a + b * c - 2;`

  expect(() => transform(code)).toThrow(
    "Cannot subtract a vector and a non-vector.",
  )
})

test("it should handle vector operations with potentially undefined values", () => {
  const code = `import { maybeVector, maybeScalar } from './utils.js';
const result = maybeVector + maybeScalar;`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle function call results in vector operations", () => {
  const code = `function getVec() { return v(1, 2); }
function getScalar() { return 5; }
const result = getVec() * getScalar() + v(3, 4);`

  expect(transform(code)).toMatchSnapshot()
})

// Array method tests

// Basic method transformations
test("it should transform vector.map() calls", () => {
  const code = `const velocity = v(1, 2);
const doubled = velocity.map(x => x * 2);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector.filter() calls", () => {
  const code = `const velocity = v(-1, 2);
const positive = velocity.filter(x => x > 0);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector.slice() calls", () => {
  const code = `const position = v(10, 20, 30);
const xy = position.slice(0, 2);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector.concat() calls", () => {
  const code = `const velocity = v(1, 2);
const extended = velocity.concat([3]);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector.reduce() calls", () => {
  const code = `const velocity = v(1, 2);
const doubled = velocity.reduce((acc, x) => [...acc, x * 2], []);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector.flat() calls", () => {
  const code = `const nested = v([1, 2], [3, 4]);
const flattened = nested.flat();`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector.flatMap() calls", () => {
  const code = `const velocity = v(1, 2);
const duplicated = velocity.flatMap(x => [x, x]);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform vector.reduceRight() calls", () => {
  const code = `const velocity = v(1, 2);
const reversed = velocity.reduceRight((acc, x) => [...acc, x], []);`

  expect(transform(code)).toMatchSnapshot()
})

// Chained operations
test("it should transform chained array methods", () => {
  const code = `const velocity = v(1, 2, 3);
const result = velocity.map(x => x * 2).filter(x => x > 3);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle method chains with vector operations", () => {
  const code = `const velocity = v(1, 2);
const position = v(10, 20);
const result = velocity.map(x => x * 2) + position;`

  expect(transform(code)).toMatchSnapshot()
})

// Methods on different types of vector expressions
test("it should transform methods on vector variables", () => {
  const code = `const pos = v(1, 2);
const doubled = pos.map(x => x * 2);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform methods on direct v() calls", () => {
  const code = `const doubled = v(1, 2).map(x => x * 2);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform methods on vector operations", () => {
  const code = `const v1 = v(1, 2);
const v2 = v(3, 4);
const summed = (v1 + v2).map(x => x / 2);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform methods on imported vectors", () => {
  const code = `import { initialPosition } from './vector.js';
const scaled = initialPosition.map(x => x * 0.5);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform methods on member expressions", () => {
  const code = `const entity = { velocity: v(1, 2) };
const doubled = entity.velocity.map(x => x * 2);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should transform methods on array elements", () => {
  const code = `const velocities = [v(1, 2), v(3, 4)];
const doubled = velocities[0].map(x => x * 2);`

  expect(transform(code)).toMatchSnapshot()
})

// Methods that shouldn't be transformed
test("it should not transform array methods on non-vectors", () => {
  const code = `const numbers = [1, 2, 3];
const doubled = numbers.map(x => x * 2);`

  expect(transform(code)).toBe(code)
})

test("it should not transform string methods", () => {
  const code = `const text = "hello";
const chars = text.split('');`

  expect(transform(code)).toBe(code)
})

test("it should not transform object property access", () => {
  const code = `const obj = {
  map: () => {}
};
obj.map();`

  expect(transform(code)).toBe(code)
})

// Edge cases with reduce
test("it should handle reduce returning scalars", () => {
  const code = `const velocity = v(1, 2);
const sum = velocity.reduce((a, b) => a + b, 0);
const magnitude = velocity.reduce((sum, x) => sum + x*x, 0);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle reduce returning non-numeric arrays", () => {
  const code = `const velocity = v(1, 2);
const strings = velocity.reduce((acc, x) => [...acc, x.toString()], []);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle reduce returning objects", () => {
  const code = `const velocity = v(1, 2);
const obj = velocity.reduce((acc, val, i) => ({ ...acc, [i]: val }), {});`

  expect(transform(code)).toMatchSnapshot()
})

// Complex combinations
test("it should handle array methods in vector operations", () => {
  const code = `const velocity = v(1, 2);
const acceleration = v(0.1, 0.2);
const result = velocity.map(x => x * 2) + acceleration.map(x => x * 10);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle array methods in component assignments", () => {
  const code = `const entity = { position: v(0, 0) };
entity.position[0] = entity.position.map(x => x + 1)[0];`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle nested array method calls", () => {
  const code = `const matrix = [v(1, 2), v(3, 4)];
const result = matrix.map(row => row.map(x => x * 2));`

  expect(transform(code)).toMatchSnapshot()
})

// Performance/edge cases
test("it should handle very long method chains", () => {
  const code = `const velocity = v(1, 2, 3, 4);
const result = velocity
  .map(x => x * 2)
  .filter(x => x > 2)
  .slice(1)
  .concat([10])
  .reduce((acc, x) => [...acc, x + 1], []);`

  expect(transform(code)).toMatchSnapshot()
})

test("it should handle methods with complex arguments", () => {
  const code = `const velocity = v(1, 2);
const scaled = velocity.map((x, i) => x * (i + 1));
const filtered = velocity.filter((x, i) => i === 0 || x > 1);`

  expect(transform(code)).toMatchSnapshot()
})

// Methods that return single values (should still be wrapped for safety)
test("it should handle find() method", () => {
  const code = `const velocity = v(1, 2, 3);
const found = velocity.find(x => x > 1);`

  // Note: find() returns a single value, but we might still want to wrap it
  // in case someone does something weird like velocity.find(() => [1, 2])
  expect(transform(code)).toMatchSnapshot()
})

// Potential gotchas
test("it should handle method calls with computed property names", () => {
  const code = `const velocity = v(1, 2);
const method = 'map';
const doubled = velocity[method](x => x * 2);`

  // This should NOT be transformed because it's computed (velocity[method])
  expect(transform(code)).toMatchSnapshot()
})

test("it should handle methods called on function results", () => {
  const code = `function getVector() { return v(1, 2); }
const doubled = getVector().map(x => x * 2);`

  expect(transform(code)).toMatchSnapshot()
})
