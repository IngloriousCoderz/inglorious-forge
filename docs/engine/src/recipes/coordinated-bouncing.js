import { Ticker } from "@inglorious/engine/animation/ticker.js"
import { jumpable } from "@inglorious/engine/behaviors/physics/jumpable.js"
import { renderCircle } from "@inglorious/renderer-2d/shapes/circle.js"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle.js"
import { v } from "@inglorious/utils/v.js"

export default {
  systems: [delayedJumpSystem],

  types: {
    ball: [{ render: renderCircle }, jumpable()],
    platform: [{ render: renderRectangle }],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    ball1: {
      type: "ball",
      position: v(200, 32, 0),
      size: v(32, 32, 0),
      backgroundColor: "#393664",
      delayedJump: { delay: 0 },
      collisions: { platform: { shape: "circle", radius: 16 } },
    },

    ball2: {
      type: "ball",
      position: v(400, 32, 0),
      size: v(32, 32, 0),
      backgroundColor: "#643639",
      delayedJump: { delay: 0.5 },
      collisions: { platform: { shape: "circle", radius: 16 } },
    },

    ball3: {
      type: "ball",
      position: v(600, 32, 0),
      size: v(32, 32, 0),
      backgroundColor: "#366439",
      delayedJump: { delay: 1 },
      collisions: { platform: { shape: "circle", radius: 16 } },
    },

    ground: {
      type: "platform",
      position: v(400, 16, 0),
      size: v(800, 32, 0),
      backgroundColor: "#654321",
      collisions: { platform: { shape: "rectangle" } },
    },
  },
}

function delayedJumpSystem(entities, dt, api) {
  Object.values(entities)
    .filter(
      ({ delayedJump, groundObject }) =>
        delayedJump && !delayedJump.triggered && groundObject,
    )
    .forEach((entity) => {
      entity.delayedJump.speed = entity.delayedJump.delay

      Ticker.tick({
        target: entity.delayedJump,
        dt,
        onTick: (delayedJump) => {
          api.notify("jump", entity.id)
          delayedJump.triggered = true
        },
      })
    })
}
