import { jumpable } from "@inglorious/engine/behaviors/physics/jumpable.js"
import { renderCircle } from "@inglorious/renderer-2d/shapes/circle.js"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    ball: [
      { render: renderCircle },
      jumpable(),
      (type) => ({
        create(entity, payload, api) {
          type.create?.(entity, payload, api)

          entity.jumpTriggered = false
        },

        update(entity, dt, api) {
          type.update?.(entity, dt, api)

          if (!entity.jumpTriggered) {
            api.notify("jump", entity.id)
            entity.jumpTriggered = true
          }
        },
      }),
    ],
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
      maxJump: 250,
      collisions: { platform: { shape: "circle", radius: 16 } },
    },

    ball2: {
      type: "ball",
      position: v(400, 32, 0),
      size: v(32, 32, 0),
      backgroundColor: "#643639",
      maxJump: 250,
      collisions: { platform: { shape: "circle", radius: 16 } },
    },

    ball3: {
      type: "ball",
      position: v(600, 32, 0),
      size: v(32, 32, 0),
      backgroundColor: "#366439",
      maxJump: 250,
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
