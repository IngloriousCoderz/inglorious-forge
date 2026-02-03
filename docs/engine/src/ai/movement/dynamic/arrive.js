import {
  arrive,
  DEFAULT_SLOW_RADIUS,
  DEFAULT_TARGET_RADIUS,
  DEFAULT_TIME_TO_TARGET,
} from "@inglorious/engine/ai/movement/dynamic/arrive.js"
import { createMouse, mouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { merge } from "@inglorious/utils/data-structures/objects.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    mouse: [{ render: renderMouse }, mouse()],

    character: [
      {
        render: renderCharacter,
        update(entity, dt, api) {
          const mouse = api.getEntity("mouse")
          const parameters = api.getEntity("parameters")
          const { fields } = parameters.groups.arrive

          merge(
            entity,
            arrive(entity, mouse, dt, {
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
        entity.groups.arrive.fields[id].value = value
      },
    },
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    mouse: createMouse({ position: v(400, 0, 300) }),

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
        arrive: {
          title: "Dynamic Arrive",
          fields: {
            targetRadius: {
              label: "Target Radius",
              inputType: "number",
              step: 0.1,
              defaultValue: DEFAULT_TARGET_RADIUS,
            },
            slowRadius: {
              label: "Slow Radius",
              inputType: "number",
              step: 0.1,
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
