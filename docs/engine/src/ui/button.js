import { createMouse, mouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { button } from "@inglorious/engine/behaviors/ui/button.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    mouse: [{ render: renderMouse }, mouse()],

    button: [
      button(),
      {
        size: v(100, 50, 0),
        color: "black",
        backgroundColor: "darkgrey",
      },
    ],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    mouse: createMouse(),

    rect1: {
      type: "button",
      position: v(400, 0, 300),
    },
  },
}
