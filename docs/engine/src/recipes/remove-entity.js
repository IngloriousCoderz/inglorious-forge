import { createMouse, mouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { random } from "@inglorious/utils/math/rng.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    mouse: [
      { render: renderMouse },
      mouse(),
      {
        entityClick(entity, id, api) {
          api.notify("remove", id)
        },
      },
    ],

    character: [{ render: renderCharacter }],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    mouse: createMouse({
      position: v(400, 0, 300),
      collisions: {
        hitbox: { shape: "point" },
      },
    }),

    ...Object.fromEntries(
      Array(5)
        .fill(null)
        .map((_, index) => [
          `character${index + 1}`,
          {
            type: "character",
            position: [random(0, 800), 0, random(0, 600)],
            orientation: random(0, 2 * pi(), 0.01),
            collisions: {
              hitbox: { shape: "circle", radius: 12 },
            },
          },
        ]),
    ),
  },
}
