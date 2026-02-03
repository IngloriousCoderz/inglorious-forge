import { findCollision } from "@inglorious/engine/collision/detection.js"
import { bounce } from "@inglorious/engine/physics/bounds.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { merge } from "@inglorious/utils/data-structures/objects.js"
import { mod } from "@inglorious/utils/math/numbers.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    character: [
      { render: renderCharacter },
      {
        update(entity, dt, api) {
          const entities = api.getEntities()
          const game = api.getEntity("game")

          const isColliding = findCollision(entity, entities)

          if (isColliding) {
            entity.orientation += pi()
            entity.orientation = mod(entity.orientation, 2 * pi())
          }
          merge(entity, bounce(entity, dt, game.size))
        },
      },
    ],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    left: {
      type: "character",
      position: v(200, 0, 300),
      orientation: 0,
      maxSpeed: 250,
      collisions: {
        hitbox: { shape: "circle", offset: v(-6, 0, -6), radius: 12 },
      },
    },

    right: {
      type: "character",
      position: v(600, 0, 300),
      orientation: pi(),
      maxSpeed: 250,
      collisions: {
        hitbox: { shape: "circle", offset: v(-6, 0, -6), radius: 12 },
      },
    },
  },
}
