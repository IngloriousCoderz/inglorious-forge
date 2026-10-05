import { collisionGizmos } from "@inglorious/engine/behaviors/debug/collision"
import { fps } from "@inglorious/engine/behaviors/fps"
import {
  controlTypes,
  createControlEntities,
} from "@inglorious/engine/behaviors/input/controls.js"
import { renderFps } from "@inglorious/renderer-2d/fps.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle.js"
import { v } from "@inglorious/utils/v.js"

import {
  GAME_STATE,
  HEIGHT,
  LAYER_BACKGROUND,
  LAYER_OVERLAY,
  MENU_START,
  PRESS,
  PRESS_MENU_DOWN,
  PRESS_MENU_UP,
  TOGGLE_PAUSE,
  WIDTH,
} from "./constants.js"
import { Ball } from "./types/ball.ijs"
import { Brick } from "./types/brick.ijs"
import { Paddle } from "./types/paddle.ijs"
import { scenes } from "./types/scene-listener.ijs"
import { Game } from "./types/states.ijs"
import { HighScores, Paused, Start, Title } from "./types/text.ijs"

const FPS_COLOR = "rgb(0, 255, 0)"

// The hitboxes the ball actually collides with, drawn over the sprites in debug mode.
// The shapes are resolved the same way the detection resolves them, so an entity that is
// merely `solid` shows the box it is really using.
const gizmos = collisionGizmos({ shapes: { rectangle: renderRectangle } })

export default {
  types: {
    ...controlTypes("game"),

    Game: [scenes(), Game],
    Ball: [...Ball, gizmos],
    Brick: [Brick, gizmos],
    Paddle: [...Paddle, gizmos],
    Title,
    Start,
    HighScores,
    Paused,

    /** The backdrop is drawn once, stretched to fill the screen. */
    Background: [
      {
        render: renderImage,
        create(entity) {
          entity.image = {
            id: "background",
            imageSize: [302, 129],
            // The original scales the backdrop by one pixel less than its own size, so
            // it overshoots the screen slightly on each axis. Taken as written.
            scale: [WIDTH / 301, HEIGHT / 128],
          }
        },
      },
    ],

    Fps: [{ render: renderFps }, fps({ accuracy: 0 })],
  },

  entities: {
    // Two targets, because a movement event is matched on the entity's own id:
    // the game reads the menu and state keys, the paddle reads the arrows.
    ...createControlEntities(
      "game",
      {
        Enter: PRESS,
        Space: TOGGLE_PAUSE,
        ArrowUp: PRESS_MENU_UP,
        ArrowDown: PRESS_MENU_DOWN,
      },
      [],
    ),

    ...createControlEntities(
      "paddle",
      {
        ArrowLeft: "moveLeft",
        ArrowRight: "moveRight",
      },
      [],
    ),

    game: {
      type: "Game",
      devMode: true,
      pixelated: true,
      size: [WIDTH, HEIGHT],
      state: GAME_STATE.start,
      menuItem: MENU_START,
    },

    images: {
      type: "Images",
      images: {
        background: { url: "/images/background.png" },
        breakout: { url: "/images/breakout.png" },
      },
    },

    audio: {
      type: "Audio",
      sounds: {
        paddleHit: { url: "/sounds/paddle_hit.wav" },
        confirm: { url: "/sounds/confirm.wav" },
        pause: { url: "/sounds/pause.wav" },
        wallHit: { url: "/sounds/wall_hit.wav" },
        brickHit: { url: "/sounds/brick_hit_2.wav" },
      },
    },

    background: {
      type: "Background",
      layer: LAYER_BACKGROUND,
      position: v(0, 0, 0),
      anchor: [0, 0],
    },

    fps: {
      type: "Fps",
      // An overlay keeps updating while the world is halted, or it would freeze on
      // whatever it last drew.
      updatesWhilePaused: true,
      layer: LAYER_OVERLAY,
      position: v(WIDTH - 10, HEIGHT - 10, 0),
      size: 8,
      color: FPS_COLOR,
      textAlign: "right",
    },
  },
}
