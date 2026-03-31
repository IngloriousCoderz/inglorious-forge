import { fps } from "@inglorious/engine/behaviors/fps.js"
import { bounce } from "@inglorious/engine/physics/bounds.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderFps } from "@inglorious/renderer-2d/fps.js"
import { merge } from "@inglorious/utils/data-structures/objects.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { zero } from "@inglorious/utils/math/vector.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    Character: [
      { render: renderCharacter },
      {
        update(entity, dt, api) {
          const game = api.getEntity("game")
          merge(entity, bounce(entity, dt, game.size))
        },
      },
    ],

    Fps: [{ render: renderFps }, fps()],
  },

  entities: {
    game: {
      type: "Game",
      devMode: true,
    },

    character: {
      type: "Character",
      maxSpeed: 250,
      orientation: pi() / 6,
      position: zero(),
    },

    fps: {
      type: "Fps",
      position: v(0, 0, 600),
    },
  },
}
