import { seek } from "@inglorious/engine/ai/movement/dynamic/seek.js"
import { randomBinomial } from "@inglorious/utils/math/rng.js"
import { createVector, sum } from "@inglorious/utils/vectors.js"

export const DEFAULT_WANDER_OFFSET = 100
export const DEFAULT_WANDER_RADIUS = 100

const DEFAULT_MAX_ANGULAR_SPEED = 0

const DEFAULT_ORIENTATION = 0

export function wander(
  entity,
  dt,
  {
    wanderOffset = DEFAULT_WANDER_OFFSET,
    wanderRadius = DEFAULT_WANDER_RADIUS,
  } = {},
) {
  const maxAngularSpeed = entity.maxAngularSpeed ?? DEFAULT_MAX_ANGULAR_SPEED

  let orientation = entity.orientation ?? DEFAULT_ORIENTATION

  let position = sum(entity.position, createVector(wanderOffset, orientation))

  orientation += randomBinomial() * maxAngularSpeed
  position = sum(position, createVector(wanderRadius, orientation))

  return seek(entity, { position }, dt)
}
