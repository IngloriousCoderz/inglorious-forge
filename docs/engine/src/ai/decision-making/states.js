import { arrive } from "@inglorious/engine/ai/movement/kinematic/arrive.js"
import { wander } from "@inglorious/engine/ai/movement/kinematic/wander.js"
import { fsm } from "@inglorious/engine/behaviors/fsm.js"
import { createMouse, mouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { clampToBounds, flip } from "@inglorious/engine/physics/bounds.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { merge } from "@inglorious/utils/data-structures/objects.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { length } from "@inglorious/utils/math/vector.js"
import { subtract } from "@inglorious/utils/math/vectors.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    mouse: [{ render: renderMouse }, mouse()],

    character: [
      { render: renderCharacter },
      fsm({
        meandering: {
          update(entity, dt, api) {
            const mouse = api.getEntity("mouse")
            const game = api.getEntity("game")

            merge(entity, wander(entity, dt))
            flip(entity, game.size)

            if (length(subtract(entity.position, mouse.position)) < 200) {
              entity.state = "hunting"
            }
          },
        },

        hunting: {
          update(entity, dt, api) {
            const mouse = api.getEntity("mouse")
            const game = api.getEntity("game")

            merge(entity, arrive(entity, mouse, dt))
            clampToBounds(entity, game.size)

            if (length(subtract(entity.position, mouse.position)) >= 200) {
              entity.state = "meandering"
            }
          },
        },
      }),
    ],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    mouse: createMouse(),

    character: {
      type: "character",
      state: "meandering",
      maxSpeed: 250,
      maxAngularSpeed: pi() / 4,
      position: v(400, 0, 300),
      collisions: {
        bounds: { shape: "circle", radius: 12 },
      },
    },
  },
}
