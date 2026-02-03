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

    game: [
      (type) => ({
        start(entity, event, api) {
          type.start?.(entity, event, api)

          api.notify("soundPlay", "music")
        },
      }),
    ],

    platform: [{ render: renderRectangle }],

    character: [
      { render: renderCharacter },
      modernVelocity(),
      clamped({ depthAxis: "z" }),
      (type) => ({
        jump(entity, event, api) {
          type.jump?.(entity, event, api)

          if (entity.groundObject) {
            api.notify("soundPlay", "jump")
          }
        },
      }),
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

    audio: {
      type: "audio",
      sounds: {
        music: { url: "/sounds/music.mp3", loop: true, volume: 0.25 },
        jump: { url: "/sounds/jump.ogg" },
      },
    },

    ground: {
      type: "platform",
      position: v(400, 24, 0),
      size: v(800, 48),
      backgroundColor: "green",
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
