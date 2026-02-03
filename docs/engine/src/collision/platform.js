import { modernVelocity } from "@inglorious/engine/behaviors/controls/kinematic/modern.js"
import {
  controls,
  createControls,
} from "@inglorious/engine/behaviors/input/controls.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { jumpable } from "@inglorious/engine/behaviors/physics/jumpable.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    ...controls("character"),

    platform: [{ render: renderRectangle }],

    character: [
      { render: renderCharacter },
      modernVelocity(),
      clamped({ depthAxis: "z" }),
      jumpable(),
    ],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    ...createControls("character", {
      ArrowLeft: "moveLeft",
      ArrowRight: "moveRight",
      Space: "jump",
      KeyA: "moveLeft",
      KeyD: "moveRight",
      Btn0: "jump",
      Btn14: "moveLeft",
      Btn15: "moveRight",
      Axis0: "moveLeftRight",
    }),

    ground: {
      type: "platform",
      position: v(400, 24, 0),
      size: v(800, 48),
      backgroundColor: "green",
      collisions: {
        platform: { shape: "rectangle" },
      },
    },

    platform: {
      type: "platform",
      position: v(600, 120, 0),
      size: v(80, 24, 0),
      backgroundColor: "grey",
      collisions: {
        platform: { shape: "rectangle" },
      },
    },

    character: {
      type: "character",
      layer: 1,
      position: v(200, 60, 0),
      collisions: {
        bounds: { shape: "circle", radius: 12 },
        platform: { shape: "circle", radius: 12 },
      },
    },
  },
}
