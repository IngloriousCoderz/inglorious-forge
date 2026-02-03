import { createMouse, mouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { filter } from "@inglorious/utils/data-structures/object.js"
import { random } from "@inglorious/utils/math/rng.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    mouse: [
      { render: renderMouse },
      mouse(),
      {
        sceneClick(entity, position, api) {
          const entities = api.getEntities()

          const characters = filter(
            entities,
            (_, { type }) => type === "character",
          )
          const ids = Object.keys(characters)

          const maxId = ids.length
            ? Number(ids[ids.length - 1].replace("character", ""))
            : 0

          api.notify("add", {
            id: `character${maxId + 1}`,
            type: "character",
            position,
            orientation: random(0, 2 * pi(), 0.01),
            collisions: {
              hitbox: { shape: "circle", radius: 12 },
            },
          })
        },

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
  },
}
