import { face } from "@inglorious/engine/ai/movement/dynamic/face.js"
import { tankMove } from "@inglorious/engine/movement/dynamic/tank.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { extend, merge } from "@inglorious/utils/object.js"
import { zero } from "@inglorious/utils/vector.js"

import { createMovementEventHandlers } from "../event-handlers.js"

const FULL_CIRCLE = 2
const DEFAULT_PARAMS = {
  maxSpeed: 250,
  maxAngularSpeed: FULL_CIRCLE * pi(),
  maxAcceleration: 500,
}
const X = 0
const Z = 2

export function shooterControls(params) {
  params = extend(DEFAULT_PARAMS, params)

  const DEADZONE = 0.1
  const NO_MOVEMENT = 0

  return (type) => ({
    ...createMovementEventHandlers([
      "moveLeft",
      "moveRight",
      "moveUp",
      "moveDown",
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

    update(entity, dt, api) {
      const mouse = api.getEntity("mouse")

      const { movement, maxAngularSpeed, maxAcceleration } = entity
      entity.acceleration = zero()

      if (movement.moveLeft) {
        entity.acceleration[Z] = -maxAcceleration
      }
      if (movement.moveRight) {
        entity.acceleration[Z] = maxAcceleration
      }
      if (movement.moveUp) {
        entity.acceleration[X] = maxAcceleration
      }
      if (movement.moveDown) {
        entity.acceleration[X] = -maxAcceleration
      }

      if (movement.strafe) {
        entity.acceleration[Z] += movement.strafe * maxAcceleration
      }
      if (movement.move) {
        entity.acceleration[X] += -movement.move * maxAcceleration
      }
      if (movement.turn) {
        entity.orientation += -movement.turn * maxAngularSpeed * dt
      }

      const isUsingAnalogMovement =
        Math.abs(movement.move ?? NO_MOVEMENT) > DEADZONE ||
        Math.abs(movement.strafe ?? NO_MOVEMENT) > DEADZONE

      if (!isUsingAnalogMovement) {
        merge(entity, face(entity, mouse, dt))
      }
      merge(entity, tankMove(entity, dt))
    },
  })
}
