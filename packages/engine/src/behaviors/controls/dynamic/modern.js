import { modernMove } from "@inglorious/engine/movement/dynamic/modern.js"
import { extend, merge } from "@inglorious/utils/object.js"
import { zero } from "@inglorious/utils/vector.js"

import { createMovementEventHandlers } from "../event-handlers.js"

const DEFAULT_PARAMS = {
  maxAcceleration: 500,
}
const X = 0
const Z = 2

export function modernAcceleration(params) {
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

      entity.maxAcceleration ??= params.maxAcceleration
      entity.movement ??= {}
    },

    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      const { movement, maxAcceleration } = entity
      entity.acceleration = zero()

      if (movement.moveLeft) {
        entity.acceleration[X] = -maxAcceleration
      }
      if (movement.moveRight) {
        entity.acceleration[X] = maxAcceleration
      }
      if (movement.moveUp) {
        entity.acceleration[Z] = maxAcceleration
      }
      if (movement.moveDown) {
        entity.acceleration[Z] = -maxAcceleration
      }

      if (movement.moveLeftRight) {
        entity.acceleration[X] += movement.moveLeftRight * maxAcceleration
      }
      if (movement.moveUpDown) {
        entity.acceleration[Z] += -movement.moveUpDown * maxAcceleration
      }
    },
  })
}

export function modernControls(params) {
  const accelerationBehavior = modernAcceleration(params)

  return (type) => {
    const newType = accelerationBehavior(type)

    return extend(newType, {
      update(entity, dt, api) {
        newType.update?.(entity, dt, api)
        merge(entity, modernMove(entity, dt))
      },
    })
  }
}
