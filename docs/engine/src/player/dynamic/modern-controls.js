import { modernControls } from "@inglorious/engine/behaviors/controls/dynamic/modern.js"
import {
  controls,
  createControls,
} from "@inglorious/engine/behaviors/input/controls.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    ...controls("character"),

    stats: {},

    character: [{ render: renderCharacter }, modernControls(), clamped()],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    ...createControls("character", {
      ArrowUp: "moveUp",
      ArrowDown: "moveDown",
      ArrowLeft: "moveLeft",
      ArrowRight: "moveRight",
      KeyW: "moveUp",
      KeyS: "moveDown",
      KeyA: "moveLeft",
      KeyD: "moveRight",
      Btn12: "moveUp",
      Btn13: "moveDown",
      Btn14: "moveLeft",
      Btn15: "moveRight",
      Axis0: "moveLeftRight",
      Axis1: "moveUpDown",
    }),

    stats: {
      type: "stats",
      position: v(600, 0, 600),
      target: "character",
    },

    character: {
      type: "character",
      maxAcceleration: 500,
      friction: 250,
      position: v(400, 0, 300),
      maxJump: 100,
      maxLeap: 100,
      collisions: {
        bounds: { shape: "circle", radius: 12 },
      },
    },
  },
}
