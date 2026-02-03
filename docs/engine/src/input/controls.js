import { modernControls } from "@inglorious/engine/behaviors/controls/kinematic/modern.js"
import {
  controls,
  createControls,
} from "@inglorious/engine/behaviors/input/controls.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    ...controls("character"),

    character: [{ render: renderCharacter }, modernControls()],
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

    character: {
      type: "character",
      maxSpeed: 250,
      position: v(400, 0, 300),
    },
  },
}
