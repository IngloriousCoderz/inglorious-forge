import { expect, test, vi } from "vitest"

import { emitBurst, particle } from "./particles.js"

const X = 0
const Y = 1
const Z = 2

/** Collects what would have been spawned, without an engine. */
function collector() {
  const spawned = []
  const api = {
    notify: vi.fn((name, payload) => spawned.push([name, payload])),
  }

  return { api, spawned }
}

function step(entity, dt) {
  const despawned = []
  const api = { notify: (name, payload) => despawned.push([name, payload]) }

  particle().update(entity, dt, api)

  return despawned
}

test("it should emit one particle per count", () => {
  const { api, spawned } = collector()

  emitBurst(api, { count: 64, position: [10, 20, 0] })

  expect(spawned).toHaveLength(64)
  expect(spawned.every(([name]) => name === "spawn")).toBe(true)
})

test("it should emit a single particle by default", () => {
  const { api, spawned } = collector()

  emitBurst(api, { position: [0, 0, 0] })

  expect(spawned).toHaveLength(1)
})

test("it should emit particles within the spread of the position", () => {
  const { api, spawned } = collector()

  emitBurst(api, {
    count: 200,
    position: [100, 100, 0],
    spread: [5, 5, 0],
  })

  spawned.forEach(([, particle]) => {
    expect(Math.abs(particle.position[X] - 100)).toBeLessThanOrEqual(5)
    expect(Math.abs(particle.position[Y] - 100)).toBeLessThanOrEqual(5)
    expect(particle.position[Z]).toBe(0)
  })
})

test("it should emit particles all over the box when spread allows it", () => {
  const { api, spawned } = collector()

  emitBurst(api, { count: 200, position: [0, 0, 0], spread: [10, 10, 0] })

  const xs = spawned.map(([, p]) => p.position[X])
  const ys = spawned.map(([, p]) => p.position[Y])

  // A burst should reach both ends of its box, not cluster in the middle.
  expect(Math.min(...xs)).toBeLessThan(-9)
  expect(Math.max(...xs)).toBeGreaterThan(9)
  expect(Math.min(...ys)).toBeLessThan(-9)
  expect(Math.max(...ys)).toBeGreaterThan(9)
})

test("it should give each particle a lifetime within the range", () => {
  const { api, spawned } = collector()

  emitBurst(api, { count: 200, lifetime: [0.5, 1] })

  spawned.forEach(([, p]) => {
    expect(p.life).toBeGreaterThanOrEqual(0.5)
    expect(p.life).toBeLessThanOrEqual(1)
  })
})

test("it should pick different lifetimes across a burst", () => {
  const { api, spawned } = collector()

  emitBurst(api, { count: 200, lifetime: [0.5, 1] })

  const lives = new Set(spawned.map(([, p]) => p.life))

  expect(lives.size).toBeGreaterThan(1)
})

test("it should keep each acceleration within its axis range", () => {
  const { api, spawned } = collector()

  emitBurst(api, {
    count: 200,
    acceleration: [
      [-15, 0, 0],
      [15, 80, 0],
    ],
  })

  spawned.forEach(([, p]) => {
    expect(p.acceleration[X]).toBeGreaterThanOrEqual(-15)
    expect(p.acceleration[X]).toBeLessThanOrEqual(15)
    expect(p.acceleration[Y]).toBeGreaterThanOrEqual(0)
    expect(p.acceleration[Y]).toBeLessThanOrEqual(80)
  })
})

test("it should start a particle at rest when given no velocity", () => {
  const { api, spawned } = collector()

  emitBurst(api, { count: 10, position: [0, 0, 0] })

  spawned.forEach(([, p]) => {
    expect(p.velocity).toStrictEqual([0, 0, 0])
    expect(p.age).toBe(0)
  })
})

test("it should pass the drawing details through to every particle", () => {
  const { api, spawned } = collector()
  const image = { id: "particle", imageSize: [2, 2] }

  emitBurst(api, {
    count: 3,
    size: [2, 2, 0],
    layer: 7,
    image,
    opacity: 0.5,
  })

  spawned.forEach(([, p]) => {
    expect(p.size).toStrictEqual([2, 2, 0])
    expect(p.layer).toBe(7)
    expect(p.image).toStrictEqual(image)
    expect(p.startOpacity).toBe(0.5)
  })
})

test("it should not share a size between separate bursts", () => {
  const { api, spawned } = collector()

  emitBurst(api, { count: 1 })
  emitBurst(api, { count: 1 })

  // Vectors are mutable and entities hold on to them, so a default that lived in
  // a module constant would be shared by every particle in the game.
  expect(spawned[0][1].size).not.toBe(spawned[1][1].size)
})

test("a particle should fall as its acceleration acts on it", () => {
  const entity = {
    age: 0,
    life: 1,
    position: [100, 100, 0],
    velocity: [0, 0, 0],
    acceleration: [0, 80, 0],
    opacity: 1,
    startOpacity: 1,
  }

  step(entity, 0.5)

  // v = a * dt, then p += v * dt
  expect(entity.velocity[Y]).toBeCloseTo(40)
  expect(entity.position[Y]).toBeCloseTo(120)
  expect(entity.position[X]).toBe(100)
})

test("a particle should fade out over its lifetime", () => {
  const entity = {
    age: 0,
    life: 1,
    position: [0, 0, 0],
    velocity: [0, 0, 0],
    acceleration: [0, 0, 0],
    opacity: 1,
    startOpacity: 1,
  }

  step(entity, 0.25)
  expect(entity.opacity).toBeCloseTo(0.75)

  step(entity, 0.25)
  expect(entity.opacity).toBeCloseTo(0.5)
})

test("a particle should fade from whatever opacity it was emitted at", () => {
  const entity = {
    age: 0,
    life: 1,
    position: [0, 0, 0],
    velocity: [0, 0, 0],
    acceleration: [0, 0, 0],
    opacity: 0.4,
    startOpacity: 0.4,
  }

  step(entity, 0.5)

  expect(entity.opacity).toBeCloseTo(0.2)
})

test("a particle should return itself to the pool once its life is up", () => {
  const entity = {
    id: "particle-1",
    age: 0.9,
    life: 1,
    position: [0, 0, 0],
    velocity: [0, 0, 0],
    acceleration: [0, 0, 0],
    opacity: 1,
    startOpacity: 1,
  }

  const despawned = step(entity, 0.2)

  expect(despawned).toStrictEqual([["despawn", entity]])
})

test("a spent particle should not move on its last frame", () => {
  const entity = {
    age: 0.9,
    life: 1,
    position: [50, 50, 0],
    velocity: [10, 10, 0],
    acceleration: [0, 80, 0],
    opacity: 1,
    startOpacity: 1,
  }

  step(entity, 0.2)

  expect(entity.position).toStrictEqual([50, 50, 0])
})
