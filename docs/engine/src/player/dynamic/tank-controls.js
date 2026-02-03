import { tankControls } from "@inglorious/engine/behaviors/controls/dynamic/tank.js"
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

    character: [{ render: renderCharacter }, tankControls(), clamped()],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    ...createControls("character", {
      ArrowUp: "moveForward",
      ArrowDown: "moveBackward",
      ArrowLeft: "turnLeft",
      ArrowRight: "turnRight",
      KeyW: "moveForward",
      KeyS: "moveBackward",
      KeyA: "turnLeft",
      KeyD: "turnRight",
      Btn12: "moveForward",
      Btn13: "moveBackward",
      Btn14: "turnLeft",
      Btn15: "turnRight",
      Axis0: "strafe",
      Axis1: "move",
      Axis2: "turn",
    }),

    character: {
      type: "character",
      maxAngularSpeed: 10,
      maxAcceleration: 500,
      maxSpeed: 250,
      friction: 250,
      position: v(400, 0, 300),
      collisions: {
        bounds: { shape: "circle", radius: 12 },
      },
    },
  },
}
