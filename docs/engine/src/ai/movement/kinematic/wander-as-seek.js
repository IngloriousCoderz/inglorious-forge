import {
  DEFAULT_WANDER_RADIUS,
  wanderAsSeek,
} from "@inglorious/engine/ai/movement/kinematic/wander-as-seek.js"
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
          const { fields } = parameters.groups.wanderAsSeek

          merge(
            entity,
            wanderAsSeek(entity, dt, {
              wanderRadius: fields.wanderRadius.value,
            }),
          )
          flip(entity, game.size)
        },
      },
    ],

    form: {
      fieldChange(entity, { id, value }) {
        entity.groups.wanderAsSeek.fields[id].value = value
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
        wanderAsSeek: {
          title: "Wander As Seek",
          fields: {
            wanderRadius: {
              label: "Wander Radius",
              inputType: "number",
              defaultValue: DEFAULT_WANDER_RADIUS,
            },
          },
        },
      },
    },
  },
}
