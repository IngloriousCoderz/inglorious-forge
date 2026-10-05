import { modernControls } from "@inglorious/engine/behaviors/controls/kinematic/modern.js"
import {
  controlTypes,
  createControlEntities,
} from "@inglorious/engine/behaviors/input/controls.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    ...controlTypes(),

    Character: [{ render: renderCharacter }, modernControls(), clamped()],

    Game: {
      start(entity, event, api) {
        api.notify("add", {
          id: "player2",
          type: "Character",
          position: v(600, 0, 300),
          orientation: pi(),
          movement: {},
          collisions: {
            bounds: { shape: "circle", radius: 12 },
          },
        })
      },
    },
  },

  entities: {
    ...createControlEntities({
      KeyI: "moveUp",
      KeyK: "moveDown",
      KeyJ: "moveLeft",
      KeyL: "moveRight",
    }),

    game: {
      type: "Game",
      multiplayer: {
        // serverUrl: "ws://localhost:3000",
        serverUrl: "wss://inglorious-server.onrender.com",
      },
      devMode: true,
    },
  },
}
