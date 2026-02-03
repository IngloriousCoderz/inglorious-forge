import {
  DEFAULT_MAX_PREDICTION,
  evade,
} from "@inglorious/engine/ai/movement/dynamic/evade.js"
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
          const { fields } = parameters.groups.evade

          merge(
            entity,
            evade(entity, mouse, dt, {
              maxPrediction: fields.maxPrediction.value,
            }),
          )
        },
      },
      clamped(),
    ],

    form: {
      fieldChange(entity, { id, value }) {
        entity.groups.evade.fields[id].value = value
      },
    },
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    mouse: createMouse({
      position: v(400, 0, 300),
      velocity: v(0, 0, 0),
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
      position: v(800 - 343, 0, 600),
      groups: {
        evade: {
          title: "Evade",
          fields: {
            maxPrediction: {
              label: "Max Prediction",
              inputType: "number",
              defaultValue: DEFAULT_MAX_PREDICTION,
            },
          },
        },
      },
    },
  },
}
