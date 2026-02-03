import {
  DEFAULT_WANDER_OFFSET,
  DEFAULT_WANDER_RADIUS,
  wander,
} from "@inglorious/engine/ai/movement/dynamic/wander.js"
import { flip } from "@inglorious/engine/physics/bounds.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { merge } from "@inglorious/utils/data-structures/objects.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    character: [
      {
        render: renderCharacter,
        update(entity, dt, api) {
          const parameters = api.getEntity("parameters")
          const game = api.getEntity("game")
          const { fields } = parameters.groups.wander

          merge(
            entity,
            wander(entity, dt, {
              wanderOffset: fields.wanderOffset.value,
              wanderRadius: fields.wanderRadius.value,
            }),
          )
          flip(entity, game.size)
        },
      },
    ],

    form: {
      fieldChange(entity, { id, value }) {
        entity.groups.wander.fields[id].value = value
      },
    },
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    character: {
      type: "character",
      maxAcceleration: 1000,
      maxSpeed: 250,
      maxAngularSpeed: pi() / 4,
      position: v(400, 0, 300),
      collisions: {
        bounds: { shape: "circle", radius: 12 },
      },
    },

    parameters: {
      type: "form",
      position: v(800 - 352, 0, 600),
      groups: {
        wander: {
          title: "Dynamic Wander",
          fields: {
            wanderOffset: {
              label: "Wander Offset",
              inputType: "number",
              defaultValue: DEFAULT_WANDER_OFFSET,
            },
            wanderRadius: {
              label: "Wander Radius",
              inputType: "number",
              step: 0.1,
              defaultValue: DEFAULT_WANDER_RADIUS,
            },
          },
        },
      },
    },
  },
}
