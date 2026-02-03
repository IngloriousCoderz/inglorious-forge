import { modernControls } from "@inglorious/engine/behaviors/controls/kinematic/modern.js"
import { fsm } from "@inglorious/engine/behaviors/fsm.js"
import {
  controls,
  createControls,
} from "@inglorious/engine/behaviors/input/controls.js"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped.js"
import { jumpable } from "@inglorious/engine/behaviors/physics/jumpable.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { v } from "@inglorious/utils/v.js"

const Y = 1

export default {
  types: {
    ...controls("character"),

    stats: {},

    character: [
      { render: renderCharacter },
      modernControls(),
      clamped(),
      jumpable(),
      fsm({
        default: {
          update(entity) {
            stopFreeFalling(entity)
          },
        },

        jumping: {
          update(entity) {
            stopFreeFalling(entity)
          },
        },
      }),
    ],
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
      Space: "jump",
      KeyW: "moveUp",
      KeyS: "moveDown",
      KeyA: "moveLeft",
      KeyD: "moveRight",
      Btn12: "moveUp",
      Btn13: "moveDown",
      Btn14: "moveLeft",
      Btn15: "moveRight",
      Btn0: "jump",
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
      maxSpeed: 250,
      position: v(400, 0, 300),
      maxJump: 100,
      maxLeap: 100,
      collisions: {
        bounds: { shape: "circle", radius: 12 },
        platform: { shape: "circle", radius: 12 },
      },
    },
  },
}

function stopFreeFalling(entity) {
  if (entity.position[Y] <= 0) {
    entity.vy = 0
    entity.position[Y] = 0
    entity.state = "default"
    entity.jumpsLeft = 1
  }
}
