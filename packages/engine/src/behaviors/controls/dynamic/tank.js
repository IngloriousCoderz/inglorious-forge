import { tankMove } from "@inglorious/engine/movement/dynamic/tank.js"
import { extend, merge } from "@inglorious/utils/object.js"
import { zero } from "@inglorious/utils/vector.js"

import { createMovementEventHandlers } from "../event-handlers.js"

const DEFAULT_PARAMS = {
  maxSpeed: 250,
  maxAngularSpeed: 10,
  maxAcceleration: 500,
}
const X = 0
const Z = 2

export function tankControls(params) {
  params = extend(DEFAULT_PARAMS, params)

  return (type) => ({
    ...createMovementEventHandlers([
      "turnLeft",
      "turnRight",
      "moveForward",
      "moveBackward",
      "strafe",
      "move",
      "turn",
    ]),

    create(entity, payload, api) {
      type.create?.(entity, payload, api)

      entity.maxSpeed ??= params.maxSpeed
      entity.maxAngularSpeed ??= params.maxAngularSpeed
      entity.maxAcceleration ??= params.maxAcceleration
      entity.movement ??= {}
    },

    update(entity, dt) {
      const { movement, maxAngularSpeed, maxAcceleration } = entity
      entity.acceleration = zero()

      if (movement.turnLeft) {
        entity.orientation += maxAngularSpeed * dt
      }
      if (movement.turnRight) {
        entity.orientation -= maxAngularSpeed * dt
      }
      if (movement.moveForward) {
        entity.acceleration[X] = maxAcceleration
      }
      if (movement.moveBackward) {
        entity.acceleration[X] = -maxAcceleration
      }

      if (movement.strafe != null) {
        entity.acceleration[Z] += movement.strafe * maxAcceleration
      }
      if (movement.move) {
        entity.acceleration[X] += -movement.move * maxAcceleration
      }
      if (movement.turn) {
        entity.orientation += -movement.turn * maxAngularSpeed * dt
      }

      merge(entity, tankMove(entity, dt))
    },
  })
}
