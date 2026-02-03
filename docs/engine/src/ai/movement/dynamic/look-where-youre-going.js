import {
  DEFAULT_SLOW_RADIUS,
  DEFAULT_TARGET_RADIUS,
  DEFAULT_TIME_TO_TARGET,
} from "@inglorious/engine/ai/movement/dynamic/align.js"
import { lookWhereYoureGoing } from "@inglorious/engine/ai/movement/dynamic/look-where-youre-going.js"
import {
  controls,
  createControls,
} from "@inglorious/engine/behaviors/input/controls.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { merge } from "@inglorious/utils/data-structures/objects.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { sum } from "@inglorious/utils/math/vectors.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    ...controls("character"),

    character: [
      {
        render: renderCharacter,

        create(entity) {
          entity.movement ??= {}
        },

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
          const { fields } = parameters.groups.lookWhereYoureGoing

          const target = { velocity: v(0, 0, 0) }

          if (entity.movement.left) {
            target.velocity[0] = -1
          }
          if (entity.movement.down) {
            target.velocity[2] = -1
          }
          if (entity.movement.right) {
            target.velocity[0] = 1
          }
          if (entity.movement.up) {
            target.velocity[2] = 1
          }

          merge(entity, {
            velocity: target.velocity,
            position: sum(entity.position, target.velocity),
          })

          merge(
            entity,
            lookWhereYoureGoing(entity, dt, {
              targetRadius: fields.targetRadius.value,
              slowRadius: fields.slowRadius.value,
              timeToTarget: fields.timeToTarget.value,
            }),
          )
        },
      },
      clamped(),
    ],

    form: {
      fieldChange(entity, { id, value }) {
        entity.groups.lookWhereYoureGoing.fields[id].value = value
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
      maxAngularAcceleration: 1000,
      maxAngularSpeed: pi() / 4,
      position: v(400, 0, 300),
      collisions: {
        bounds: { shape: "circle", radius: 12 },
      },
    },

    parameters: {
      type: "form",
      position: v(800 - 328, 0, 600),
      groups: {
        lookWhereYoureGoing: {
          title: "Look Where You're Going",
          fields: {
            targetRadius: {
              label: "Target Radius",
              inputType: "number",
              defaultValue: DEFAULT_TARGET_RADIUS,
            },
            slowRadius: {
              label: "Slow Radius",
              inputType: "number",
              defaultValue: DEFAULT_SLOW_RADIUS,
            },
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
