import {
  DEFAULT_TIME_TO_TARGET,
  matchVelocity,
} from "@inglorious/engine/ai/movement/dynamic/match-velocity.js"
import {
  controlTypes,
  createControlEntities,
} from "@inglorious/engine/behaviors/input/controls.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { merge } from "@inglorious/utils/object.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    ...controlTypes(),

    Character: [
      {
        render: renderCharacter,

        moveLeft(entity) {
          entity.movement.left = true
        },
        moveLeftEnd(entity) {
          entity.movement.left = false
        },
        moveRight(entity) {
          entity.movement.right = true
        },
        moveRightEnd(entity) {
          entity.movement.right = false
        },
        moveUp(entity) {
          entity.movement.up = true
        },
        moveUpEnd(entity) {
          entity.movement.up = false
        },
        moveDown(entity) {
          entity.movement.down = true
        },
        moveDownEnd(entity) {
          entity.movement.down = false
        },

        update(entity, dt, api) {
          const parameters = api.getEntity("parameters")
          const { fields } = parameters.groups.matchVelocity
          const SPEED = entity.maxSpeed

          entity.movement ??= {}
          const target = { velocity: v(0, 0, 0) }

          if (entity.movement.left) {
            target.velocity[0] = -SPEED
          }
          if (entity.movement.down) {
            target.velocity[2] = -SPEED
          }
          if (entity.movement.right) {
            target.velocity[0] = SPEED
          }
          if (entity.movement.up) {
            target.velocity[2] = SPEED
          }

          merge(
            entity,
            matchVelocity(entity, target, dt, {
              timeToTarget: fields.timeToTarget.value,
            }),
          )
        },
      },
      clamped(),
    ],

    Form: {
      fieldChange(entity, { id, value }) {
        entity.groups.matchVelocity.fields[id].value = value
      },
    },
  },

  entities: {
    game: {
      type: "Game",
      devMode: true,
    },

    ...createControlEntities({
      ArrowLeft: "moveLeft",
      ArrowRight: "moveRight",
      ArrowDown: "moveDown",
      ArrowUp: "moveUp",
    }),

    character: {
      type: "Character",
      maxAcceleration: 1000,
      maxSpeed: 250,
      position: v(400, 0, 300),
      collisions: {
        bounds: { shape: "circle", radius: 12 },
      },
    },

    parameters: {
      type: "Form",
      position: v(800 - 328, 0, 600),
      groups: {
        matchVelocity: {
          title: "Match Velocity",
          fields: {
            timeToTarget: {
              label: "Time To Target",
              inputType: "number",
              step: 0.1,
              defaultValue: DEFAULT_TIME_TO_TARGET,
            },
          },
        },
      },
    },
  },
}
