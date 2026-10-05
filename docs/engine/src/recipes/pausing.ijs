import {
  controlTypes,
  createControlEntities,
} from "@inglorious/engine/behaviors/input/controls.js"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle.js"
import { renderText } from "@inglorious/renderer-2d/text.js"
import { v } from "@inglorious/utils/v.js"

const speed = 60

/**
 * Pausing halts the world, so nothing that moves needs to know about it.
 *
 * The dots carry on sliding whether or not anyone is pressing a key, and none of them
 * has a pause check in it. Press Space while they are moving and they stop dead.
 */
export default {
  types: {
    ...controlTypes("menu"),

    Dot: [
      { render: renderRectangle },

      {
        update(entity, dt) {
          // Never called while paused, so there is nothing here about pausing.
          entity.position[0] = (entity.position[0] + speed * dt) % 304
        },
      },
    ],

    // A pause menu is an overlay, so it keeps updating while the world is halted. That
    // is what lets it draw "PAUSED", and what lets it take the pause back off again:
    // every event still flows, only `update` is withheld from everything else.
    PauseMenu: [
      { render: renderText },

      {
        update(entity, dt, api) {
          entity.value = api.getEntity("game").paused ? "PAUSED" : ""
        },

        press(entity, _, api) {
          // `paused` lives on the game entity, not on whatever is toggling it.
          const game = api.getEntity("game")

          api.notify(game.paused ? "resume" : "pause")
        },
      },
    ],
  },

  entities: {
    ...createControlEntities("menu", { Space: "press" }, []),

    game: {
      devMode: true,
      size: [320, 200],
    },

    dot1: {
      type: "Dot",
      position: v(0, 20, 0),
      size: v(16, 16, 0),
      color: "red",
    },
    dot2: {
      type: "Dot",
      position: v(0, 60, 0),
      size: v(16, 16, 0),
      color: "green",
    },
    dot3: {
      type: "Dot",
      position: v(0, 100, 0),
      size: v(16, 16, 0),
      color: "blue",
    },

    pauseMenu: {
      type: "PauseMenu",
      updatesWhilePaused: true,
      position: v(160, 120, 0),
      size: 32,
      textAlign: "center",
    },
  },
}
