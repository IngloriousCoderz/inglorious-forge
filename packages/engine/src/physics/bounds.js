import { abs } from "@inglorious/utils/math/numbers.js"
import {
  angle,
  clamp,
  createVector,
  fromAngle,
  multiply,
  sum,
  zero,
} from "@inglorious/utils/vectors"

const ORIGIN = 0
const DOUBLE = 2
const HALF = 2
const X = 0
const Z = 2

export function bounce(entity, dt, [maxX, maxZ]) {
  const [x, , z] = entity.position

  const velocity = createVector(entity.maxSpeed, entity.orientation)
  if (x < ORIGIN || x >= maxX) {
    velocity[X] = -velocity[X]
  }

  if (z < ORIGIN || z >= maxZ) {
    velocity[Z] = -velocity[Z]
  }

  const position = sum(entity.position, multiply(velocity, dt))
  const orientation = angle(velocity)

  return { velocity, position, orientation }
}

const ClampToBoundsByShape = {
  rectangle(entity, [maxX, maxZ], collisionGroup) {
    const [width, height, depth] =
      entity.collisions[collisionGroup].size ?? entity.size

    const halfWidth = width / HALF
    const halfHeight = height / HALF
    const halfDepth = depth / HALF

    return clamp(
      entity.position,
      [halfWidth, halfHeight, halfDepth],
      [maxX - halfWidth, maxZ - halfHeight, maxZ - halfDepth],
    )
  },

  circle(entity, [maxX, maxY], collisionGroup, depthAxis = "y") {
    const radius = entity.collisions[collisionGroup].radius ?? entity.radius

    if (depthAxis === "z") {
      return clamp(
        entity.position,
        [radius, radius, ORIGIN],
        [maxX - radius, maxY - radius, maxY],
      )
    }

    return clamp(
      entity.position,
      [radius, ORIGIN, radius],
      [maxX - radius, maxY, maxY - radius],
    )
  },

  point(entity, [maxX, maxZ]) {
    return clamp(entity.position, zero(), [maxX, maxZ, maxZ])
  },
}

export function clampToBounds(
  entity,
  bounds,
  collisionGroup = "bounds",
  depthAxis,
) {
  const shape = entity.collisions[collisionGroup].shape || "rectangle"
  const handler = ClampToBoundsByShape[shape] || ClampToBoundsByShape.point
  return handler(entity, bounds, collisionGroup, depthAxis)
}

export function flip(entity, [maxX, maxZ]) {
  const [x, , z] = entity.position

  entity.collisions ??= {}
  entity.collisions.bounds ??= {}
  entity.collisions.bounds.shape ??= "rectangle"

  let width, height, depth
  if (entity.collisions.bounds.shape === "circle") {
    width = entity.collisions.bounds.radius * DOUBLE
    height = entity.collisions.bounds.radius * DOUBLE
    depth = entity.collisions.bounds.radius * DOUBLE
  } else {
    ;[width, height, depth] = entity.collisions.bounds.size ?? entity.size
  }
  const halfWidth = width / HALF
  const halfHeight = height / HALF
  const halfDepth = depth / HALF

  const left = x - halfWidth
  const right = x + halfWidth
  const bottom = z - halfHeight
  const top = z + halfHeight
  const back = z - halfDepth
  const front = z + halfDepth

  const direction = fromAngle(entity.orientation)

  if (
    left < ORIGIN ||
    right >= maxX ||
    bottom < ORIGIN ||
    top >= maxZ ||
    back < ORIGIN ||
    front >= maxZ
  ) {
    if (left < ORIGIN) {
      direction[X] = abs(direction[X])
    } else if (right >= maxX) {
      direction[X] = -abs(direction[X])
    }

    if (back < ORIGIN) {
      direction[Z] = abs(direction[Z])
    } else if (front >= maxZ) {
      direction[Z] = -abs(direction[Z])
    }

    entity.acceleration = zero()
    entity.velocity = zero()
  }

  entity.orientation = angle(direction)
}
