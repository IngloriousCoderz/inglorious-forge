import { BOTTOM_LEFT, TOP_LEFT } from "@inglorious/engine/physics/anchor.js"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    Ground: [{ render: renderRectangle }],
    Box: [{ render: renderRectangle }],
  },

  entities: {
    game: {
      type: "Game",
      devMode: true,
    },

    ball: {
      type: "Box",
      position: v(120, 60, 0),
      size: v(16, 16, 0),
      anchor: TOP_LEFT,
      backgroundColor: "orange",
      collisions: { hitbox: { shape: "rectangle" } },
    },

    floor: {
      type: "Ground",
      position: v(0, 0, 0),
      size: v(200, 16, 0),
      anchor: BOTTOM_LEFT,
      backgroundColor: "green",
      collisions: { hitbox: { shape: "rectangle" } },
    },
  },
}
