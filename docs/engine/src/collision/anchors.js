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

    // Drawn from its top left corner, which is the corner a sprite sheet's own
    // coordinates point at: so `image.x` and `image.y` say where it is without an
    // offset of their own.
    ball: {
      type: "Box",
      position: v(120, 60, 0),
      size: v(16, 16, 0),
      anchor: TOP_LEFT,
      backgroundColor: "orange",
      collisions: { hitbox: { shape: "rectangle" } },
    },

    // A floor is described by the corner it stands on, because that is the corner
    // something lands on.
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
