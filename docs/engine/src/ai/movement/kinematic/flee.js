import { flee } from "@inglorious/engine/ai/movement/kinematic/flee.js"
import { mouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { merge } from "@inglorious/utils/data-structures/objects.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    Mouse: [{ render: renderMouse }, mouse()],

    Character: [
      {
        render: renderCharacter,
        update(entity, dt, api) {
          const mouse = api.getEntity("mouse")
          merge(entity, flee(entity, mouse, dt))
        },
      },
      clamped(),
    ],
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
      maxSpeed: 250,
      position: v(400, 0, 300),
      collisions: {
        bounds: { shape: "circle", radius: 12 },
      },
    },
  },
}
