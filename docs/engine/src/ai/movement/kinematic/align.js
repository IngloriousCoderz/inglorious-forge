import {
  align,
  DEFAULT_TARGET_RADIUS,
  DEFAULT_TIME_TO_TARGET,
} from "@inglorious/engine/ai/movement/kinematic/align.js"
import {
  controls,
  createControls,
} from "@inglorious/engine/behaviors/input/controls.js"
import { mouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { merge } from "@inglorious/utils/data-structures/objects.js"
import { clamp } from "@inglorious/utils/math/numbers.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    ...controls("character"),

    mouse: [
      { render: renderMouse },
      mouse(),
      {
        fieldChange(entity, { id, value }) {
          if (id === "targetOrientation") {
            entity.orientation = -value * pi()
          }
        },

        turnLeft(entity, entityId) {
          if (entityId === entity.id) entity.turningLeft = true
        },
        turnLeftEnd(entity, entityId) {
          if (entityId === entity.id) entity.turningLeft = false
        },
        turnRight(entity, entityId) {
          if (entityId === entity.id) entity.turningRight = true
        },
        turnRightEnd(entity, entityId) {
          if (entityId === entity.id) entity.turningRight = false
        },

        update(entity, dt) {
          if (entity.turningLeft) {
            entity.orientation += 5 * dt
          } else if (entity.turningRight) {
            entity.orientation -= 5 * dt
          }
          entity.orientation = clamp(entity.orientation, -pi(), pi())
        },
      },
    ],

    character: [
      {
        render: renderCharacter,
        update(entity, dt, api) {
          const mouse = api.getEntity("mouse")
          const parameters = api.getEntity("parameters")
          const { fields } = parameters.groups.align

          merge(
            entity,
            align(entity, mouse, dt, {
              targetRadius: fields.targetRadius.value,
              timeToTarget: fields.timeToTarget.value,
            }),
          )
        },
      },
      clamped(),
    ],

    form: {
      fieldChange(entity, { id, value }) {
        entity.groups.align.fields[id].value = value
      },
    },
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    mouse: {
      type: "mouse",
      position: v(400, 0, 300),
      orientation: 0,
    },

    ...createControls("mouse", {
      ArrowLeft: "turnLeft",
      ArrowRight: "turnRight",
      ArrowDown: "turnRight",
      ArrowUp: "turnLeft",
    }),

    character: {
      type: "character",
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
        align: {
          title: "Kinematic Align",
          fields: {
            targetRadius: {
              label: "Target Radius",
              inputType: "number",
              defaultValue: DEFAULT_TARGET_RADIUS,
            },
            timeToTarget: {
              label: "Time To Target",
              inputType: "number",
              step: 0.1,
              defaultValue: DEFAULT_TIME_TO_TARGET,
            },
            targetOrientation: {
              label: "Target Orientation",
              inputType: "number",
              step: 0.25,
              min: -1,
              max: 1,
              defaultValue: 0,
            },
          },
        },
      },
    },
  },
}
