import {
  DEFAULT_TARGET_RADIUS,
  DEFAULT_TIME_TO_TARGET,
} from "@inglorious/engine/ai/movement/kinematic/align.js"
import { face } from "@inglorious/engine/ai/movement/kinematic/face.js"
import { mouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { merge } from "@inglorious/utils/data-structures/objects.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    Mouse: [{ render: renderMouse }, mouse()],

    Character: [
      {
        render: renderCharacter,
        update(entity, dt, api) {
          const mouse = api.getEntity("mouse")
          const parameters = api.getEntity("parameters")
          const { fields } = parameters.groups.face

          merge(
            entity,
            face(entity, mouse, dt, {
              targetRadius: fields.targetRadius.value,
              timeToTarget: fields.timeToTarget.value,
            }),
          )
        },
      },
      clamped(),
    ],

    Form: {
      fieldChange(entity, { id, value }) {
        entity.groups.face.fields[id].value = value
      },
    },
  },

  entities: {
    game: {
      type: "Game",
      devMode: true,
    },

    mouse: {
      type: "Mouse",
      position: v(400, 0, 300),
    },

    character: {
      type: "Character",
      maxAngularSpeed: pi() / 4,
      maxAngularAcceleration: 1000,
      position: v(400, 0, 300),
      collisions: {
        bounds: { shape: "circle", radius: 12 },
      },
    },

    parameters: {
      type: "Form",
      position: v(800 - 328, 0, 600),
      groups: {
        face: {
          title: "Face",
          fields: {
            targetRadius: {
              label: "Target Radius",
              inputType: "number",
              step: 0.1,
              defaultValue: DEFAULT_TARGET_RADIUS,
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
