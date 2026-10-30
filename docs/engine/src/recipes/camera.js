import { arrive } from "@inglorious/engine/ai/movement/dynamic/arrive.js"
import { camera } from "@inglorious/engine/behaviors/camera.js"
import {
  createKeyboardEntity,
  keyboard,
} from "@inglorious/engine/behaviors/input/keyboard.js"
import {
  createMouseEntity,
  mouse,
} from "@inglorious/engine/behaviors/input/mouse.js"
import { renderCamera } from "@inglorious/renderer-2d/camera.js"
import { renderCharacter } from "@inglorious/renderer-2d/character.js"
import { renderMouse } from "@inglorious/renderer-2d/mouse.js"
import { merge } from "@inglorious/utils/object.js"
import { v } from "@inglorious/utils/v.js"

export default {
  types: {
    Keyboard: [keyboard()],
    Mouse: [{ render: renderMouse }, mouse()],

    Character: {
      render: renderCharacter,
      update(entity, dt, api) {
        const mouse = api.getEntity("mouse")
        merge(entity, arrive(entity, mouse, dt))
      },
    },

    Camera: [{ render: renderCamera }, camera()],
  },

  entities: {
    game: {
      type: "Game",
      devMode: true,
    },

    keyboard: createKeyboardEntity(),

    mouse: createMouseEntity(),

    player: {
      id: "player",
      type: "Character",
      maxSpeed: 250,
      maxAcceleration: 500,
      position: v(0, 0, 0),
    },

    camera: {
      type: "Camera",
      layer: 1,
      isActive: true,
      targetId: "player",
      maxSpeed: 350,
      maxAcceleration: 800,
      slowRadius: 120,
      position: v(0, 0, 0),
      zoom: 1.5,
      minZoom: 0.5,
      zoomSpeed: 0.05,
      zoomSensitivity: 5,
      size: v(400, 300),
      color: "red",
      backgroundColor: "rgba(255, 0, 0, 0.1)",
    },
  },
}
