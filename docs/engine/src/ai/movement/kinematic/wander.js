import { wander } from "@inglorious/engine/ai/movement/kinematic/wander.js"
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
          const game = api.getEntity("game")

          merge(entity, wander(entity, dt))
          flip(entity, game.size)
        },
      },
    ],
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
  },
}
