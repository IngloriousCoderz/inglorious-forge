import { modernMove } from "@inglorious/engine/movement/kinematic/modern.js"
import { extend, merge } from "@inglorious/utils/object.js"
import { zero } from "@inglorious/utils/vectors.js"

import { createMovementEventHandlers } from "../event-handlers.js"

const DEFAULT_PARAMS = {
  maxSpeed: 250,
}
const X = 0
const Z = 2

export function modernVelocity(params) {
  params = extend(DEFAULT_PARAMS, params)

  return (type) => ({
    ...createMovementEventHandlers([
      "moveLeft",
      "moveRight",
      "moveUp",
      "moveDown",
      "moveLeftRight",
      "moveUpDown",
    ]),

    create(entity, payload, api) {
      type.create?.(entity, payload, api)

      entity.maxSpeed ??= params.maxSpeed
      entity.movement ??= {}
    },

    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      const { movement, maxSpeed } = entity
      entity.velocity = zero()

      if (movement.moveLeft) {
        entity.velocity[X] = -maxSpeed
      }
      if (movement.moveRight) {
        entity.velocity[X] = maxSpeed
      }
      if (movement.moveUp) {
        entity.velocity[Z] = maxSpeed
      }
      if (movement.moveDown) {
        entity.velocity[Z] = -maxSpeed
      }

      if (movement.moveLeftRight) {
        entity.velocity[X] += movement.moveLeftRight * maxSpeed
      }
      if (movement.moveUpDown) {
        entity.velocity[Z] += -movement.moveUpDown * maxSpeed
      }
    },
  })
}

export function modernControls(params) {
  const velocityBehavior = modernVelocity(params)

  return (type) => {
    const newType = velocityBehavior(type)

    return extend(newType, {
      update(entity, dt, api) {
        newType.update?.(entity, dt, api)
        merge(entity, modernMove(entity, dt))
      },
    })
  }
}
