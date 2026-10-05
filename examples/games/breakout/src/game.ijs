import { fps } from "@inglorious/engine/behaviors/fps"
import {
  controlTypes,
  createControlEntities,
} from "@inglorious/engine/behaviors/input/controls.js"
import { renderFps } from "@inglorious/renderer-2d/fps.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { v } from "@inglorious/utils/v.js"

import {
  BACKGROUND_SCALE,
  BACKGROUND_SIZE,
  BOTTOM_EDGE,
  FONT_SIZE_SMALL,
  GAME_STATE,
  HEIGHT,
  HIGH_SCORES_ALTITUDE,
  LAYER_BACKGROUND,
  LAYER_OVERLAY,
  LAYER_TEXT,
  LEFT_EDGE,
  MENU_START,
  NO_DEPTH,
  NO_OFFSET,
  PAUSE,
  PAUSED_ALTITUDE,
  PRESS,
  PRESS_MENU_DOWN,
  PRESS_MENU_UP,
  START_ALTITUDE,
  TITLE_ALTITUDE,
  WIDTH,
} from "./constants.js"
import { Game } from "./types/game.ijs"
import { Paddle } from "./types/paddle.ijs"
import { HighScores, Paused, positionFor, Start, Title } from "./types/text.ijs"

const BOTTOM_LEFT = [LEFT_EDGE, BOTTOM_EDGE]
const FPS_MARGIN = 10
const FPS_SIZE = FONT_SIZE_SMALL
const FPS_COLOR = "rgb(0, 255, 0)"

export default {
  types: {
    ...controlTypes("game"),

    Game,
    Paddle,
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
            imageSize: BACKGROUND_SIZE,
            scale: BACKGROUND_SCALE,
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
        Space: PAUSE,
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
      },
    },

    background: {
      type: "Background",
      layer: LAYER_BACKGROUND,
      position: v(NO_OFFSET, NO_OFFSET, NO_DEPTH),
      anchor: BOTTOM_LEFT,
    },

    paused: {
      type: "Paused",
      layer: LAYER_TEXT,
      position: positionFor(PAUSED_ALTITUDE),
    },

    title: {
      type: "Title",
      layer: LAYER_TEXT,
      position: positionFor(TITLE_ALTITUDE),
    },
    start: {
      type: "Start",
      layer: LAYER_TEXT,
      position: positionFor(START_ALTITUDE),
    },
    highScores: {
      type: "HighScores",
      layer: LAYER_TEXT,
      position: positionFor(HIGH_SCORES_ALTITUDE),
    },

    fps: {
      type: "Fps",
      layer: LAYER_OVERLAY,
      position: v(WIDTH - FPS_MARGIN, HEIGHT - FPS_MARGIN, NO_DEPTH),
      size: FPS_SIZE,
      color: FPS_COLOR,
      textAlign: "right",
    },
  },
}
