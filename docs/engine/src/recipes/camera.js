import { arrive } from "@inglorious/engine/ai/movement/dynamic/arrive.js"
import { camera } from "@inglorious/engine/behaviors/camera.js"
import {
  createKeyboard,
  keyboard,
} from "@inglorious/engine/behaviors/input/keyboard.js"
import { createMouse, mouse } from "@inglorious/engine/behaviors/input/mouse.js"
import { renderCamera } from "@inglorious/renderer-2d/camera.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { merge } from "@inglorious/utils/data-structures/objects.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    keyboard: [keyboard()],
    mouse: [{ render: renderMouse }, mouse()],

    character: {
      render: renderCharacter,
      update(entity, dt, api) {
        const mouse = api.getEntity("mouse")
        merge(entity, arrive(entity, mouse, dt))
      },
    },

    camera: [{ render: renderCamera }, camera()],
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    keyboard: createKeyboard(),

    mouse: createMouse(),

    player: {
      id: "player",
      type: "character",
      maxSpeed: 250,
      maxAcceleration: 500,
      position: v(0, 0, 0),
    },

    camera: {
      type: "camera",
      layer: 1,
      isActive: true,
      targetId: "player",
      maxSpeed: 350, // Should be faster than the player to allow it to catch up
      maxAcceleration: 800, // A higher value makes it feel more responsive
      slowRadius: 120, // Starts slowing down when it's 120 pixels away from the player
      position: v(0, 0, 0),
      zoom: 1.5,
      minZoom: 0.5,
      zoomSpeed: 0.05,
      zoomSensitivity: 5,
      size: v(400, 300), // Camera viewport size
      // for dev mode rectangle
      color: "red",
      backgroundColor: "rgba(255, 0, 0, 0.1)",
    },
  },
}
