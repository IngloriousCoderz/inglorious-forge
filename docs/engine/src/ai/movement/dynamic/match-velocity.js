import {
  DEFAULT_TIME_TO_TARGET,
  matchVelocity,
} from "@inglorious/engine/ai/movement/dynamic/match-velocity.js"
import {
  controls,
  createControls,
} from "@inglorious/engine/behaviors/input/controls.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { merge } from "@inglorious/utils/data-structures/objects.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    ...controls("character"),

    character: [
      {
        render: renderCharacter,

        moveLeft(entity, entityId) {
          if (entityId === entity.id) entity.movement.left = true
        },
        moveLeftEnd(entity, entityId) {
          if (entityId === entity.id) entity.movement.left = false
        },
        moveRight(entity, entityId) {
          if (entityId === entity.id) entity.movement.right = true
        },
        moveRightEnd(entity, entityId) {
          if (entityId === entity.id) entity.movement.right = false
        },
        moveUp(entity, entityId) {
          if (entityId === entity.id) entity.movement.up = true
        },
        moveUpEnd(entity, entityId) {
          if (entityId === entity.id) entity.movement.up = false
        },
        moveDown(entity, entityId) {
          if (entityId === entity.id) entity.movement.down = true
        },
        moveDownEnd(entity, entityId) {
          if (entityId === entity.id) entity.movement.down = false
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

    form: {
      fieldChange(entity, { id, value }) {
        entity.groups.matchVelocity.fields[id].value = value
      },
    },
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    ...createControls("character", {
      ArrowLeft: "moveLeft",
      ArrowRight: "moveRight",
      ArrowDown: "moveDown",
      ArrowUp: "moveUp",
    }),

    character: {
      type: "character",
      maxAcceleration: 1000,
      maxSpeed: 250,
      position: v(400, 0, 300),
      collisions: {
        bounds: { shape: "circle", radius: 12 },
      },
    },

    parameters: {
      type: "form",
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
