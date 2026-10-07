import {
  anchorMargins,
  entityAnchor,
  shapeAnchor,
} from "@inglorious/engine/physics/anchor.js"
import { abs } from "@inglorious/utils/math/number.js"
import { v } from "@inglorious/utils/v.js"
import {
  angle,
  clamp,
  createVector,
  fromAngle,
  multiply,
  sum,
  zero,
} from "@inglorious/utils/vector.js"

const ORIGIN = 0
const DOUBLE = 2
const X = 0
const Y = 1
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
    const collision = entity.collisions[collisionGroup]
    const size = collision.size ?? entity.size

    // An anchored box leaves uneven room on either side of its position, so the
    // anchor itself decides how close to the bounds it may get.
    const { before: low, after: high } = anchorMargins(
      shapeAnchor(entity, collision),
      size,
    )

    return clamp(
      entity.position,
      [low[ORIGIN], low[Y], low[Z]],
      [maxX - high[ORIGIN], maxZ - high[Y], maxZ - high[Z]],
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
  const { x, z } = entity.position

  entity.collisions ??= {}
  entity.collisions.bounds ??= {}
  entity.collisions.bounds.shape ??= "rectangle"

  let size
  if (entity.collisions.bounds.shape === "circle") {
    const radius = entity.collisions.bounds.radius ?? entity.radius
    size = v(radius * DOUBLE, radius * DOUBLE, radius * DOUBLE)
  } else {
    size = entity.collisions.bounds.size ?? entity.size
  }

  const { before: low, after: high } = anchorMargins(entityAnchor(entity), size)

  const left = x - low[X]
  const right = x + high[X]
  const bottom = z - low[Y]
  const top = z + high[Y]
  const back = z - low[Z]
  const front = z + high[Z]

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
