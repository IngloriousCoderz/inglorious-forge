import { face } from "@inglorious/engine/ai/movement/kinematic/face.js"
import { tankMove } from "@inglorious/engine/movement/kinematic/tank.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { extend, merge } from "@inglorious/utils/object.js"
import { zero } from "@inglorious/utils/vectors.js"

import { createMovementEventHandlers } from "../event-handlers.js"

const FULL_CIRCLE = 2
const DEFAULT_PARAMS = {
  maxSpeed: 250,
  maxAngularSpeed: FULL_CIRCLE * pi(),
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
      "move",
      "strafe",
      "turn",
    ]),

    create(entity, payload, api) {
      type.create?.(entity, payload, api)

      entity.maxSpeed ??= params.maxSpeed
      entity.maxAngularSpeed ??= params.maxAngularSpeed
      entity.movement ??= {}
    },

    update(entity, dt, api) {
      const mouse = api.getEntity("mouse")

      const { movement, maxSpeed, maxAngularSpeed } = entity
      entity.velocity = zero()

      if (movement.moveLeft) {
        entity.velocity[Z] = -maxSpeed
      }
      if (movement.moveRight) {
        entity.velocity[Z] = maxSpeed
      }
      if (movement.moveUp) {
        entity.velocity[X] = maxSpeed
      }
      if (movement.moveDown) {
        entity.velocity[X] = -maxSpeed
      }

      if (movement.strafe) {
        entity.velocity[Z] += movement.strafe * maxSpeed
      }
      if (movement.move) {
        entity.velocity[X] += -movement.move * maxSpeed
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
