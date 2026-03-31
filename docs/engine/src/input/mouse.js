import { createMouse, mouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    Mouse: [{ render: renderMouse }, mouse()],

    Character: [
      { render: renderCharacter },
      {
        update(entity, dt, api) {
          const mouse = api.getEntity("mouse")
          entity.position = mouse.position
        },
      },
    ],
  },

  entities: {
    game: {
      type: "Game",
      devMode: true,
    },

    mouse: createMouse({ position: v(400, 0, 300) }),

    character: {
      type: "Character",
      velocity: v(0, 0, 0),
      position: v(400, 0, 300),
    },
  },
}
