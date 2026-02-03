import { shooterControls } from "@inglorious/engine/behaviors/controls/kinematic/shooter.js"
import {
  controls,
  createControls,
} from "@inglorious/engine/behaviors/input/controls.js"
import { mouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { pi } from "@inglorious/utils/math/trigonometry.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    ...controls("character"),

    mouse: [{ render: renderMouse }, mouse()],

    character: [{ render: renderCharacter }, shooterControls(), clamped()],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    mouse: {
      type: "mouse",
      position: v(400, 0, 300),
    },

    ...createControls("character", {
      ArrowLeft: "moveLeft",
      ArrowRight: "moveRight",
      ArrowDown: "moveDown",
      ArrowUp: "moveUp",
      KeyA: "moveLeft",
      KeyD: "moveRight",
      KeyS: "moveDown",
      KeyW: "moveUp",
      Btn12: "moveUp",
      Btn13: "moveDown",
      Btn14: "moveLeft",
      Btn15: "moveRight",
      Axis0: "strafe",
      Axis1: "move",
      Axis2: "turn",
    }),

    character: {
      type: "character",
      maxAngularSpeed: 2 * pi(),
      maxSpeed: 250,
      position: v(400, 0, 300),
      collisions: {
        bounds: { shape: "circle", radius: 12 },
      },
    },
  },
}
