import { modernControls } from "@inglorious/engine/behaviors/controls/kinematic/modern.js"
import {
  controls,
  createControls,
} from "@inglorious/engine/behaviors/input/controls.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { random } from "@inglorious/utils/math/rng.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"

export default {
  types: {
    ...controls("character"),

    character: [{ render: renderCharacter }, modernControls(), clamped()],

    game: {
      start(entity, event, api) {
        api.notify("add", {
          id: "player1",
          type: "character",
          position: [random(0, 800), 0, random(0, 600)],
          orientation: random(-pi(), pi(), 0.1),
          movement: {},
          collisions: {
            bounds: { shape: "circle", radius: 12 },
          },
        })
      },
    },
  },

  entities: {
    ...createControls("player1", {
      KeyW: "moveUp",
      KeyS: "moveDown",
      KeyA: "moveLeft",
      KeyD: "moveRight",
    }),

    game: {
      type: "game",
      multiplayer: {
        // serverUrl: "ws://localhost:3000",
        serverUrl: "wss://inglorious-server.onrender.com",
      },
      devMode: true,
    },
  },
}
