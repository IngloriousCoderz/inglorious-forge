/* eslint-disable no-magic-numbers */

import { collisionGizmos } from "@inglorious/engine/behaviors/debug/collision.js"
import { fps } from "@inglorious/engine/behaviors/fps"
import { infiniteScroll } from "@inglorious/engine/behaviors/infinite-scroll"
import {
  controls,
  createControls,
} from "@inglorious/engine/behaviors/input/controls.js"
import { renderFps } from "@inglorious/renderer-2d/fps.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle.js"
import { v } from "@inglorious/utils/v.js"

import {
  BACKGROUND_LOOP,
  BACKGROUND_SPEED,
  BIRD_HEIGHT,
  BIRD_HITBOX_SIZE,
  BIRD_INITIAL_POSITION,
  BIRD_SIZE,
  BIRD_WIDTH,
  COLOR_TEXT,
  COUNTDOWN_START,
  FONT_FAMILY,
  FONT_SIZE_HUGE,
  FONT_SIZE_LARGE,
  FONT_SIZE_MEDIUM,
  FONT_SIZE_SMALL,
  FONT_SMALL_FAMILY,
  GAME_STATE,
  GROUND_HEIGHT,
  GROUND_LOOP,
  GROUND_SPEED,
  HEIGHT,
  INITIAL_GAP_Y,
  LAYER_BACKGROUND,
  LAYER_BIRD,
  LAYER_GROUND,
  LAYER_OVERLAY,
  LAYER_TEXT,
  PRESS,
  WIDTH,
} from "./constants.js"
import { Bird } from "./types/bird.ijs"
import { Game } from "./types/game.ijs"
import { Pipe } from "./types/pipe.ijs"
import {
  Countdown,
  GameOver,
  GameOverPrompt,
  GameOverScore,
  Score,
  Title,
  TitlePrompt,
} from "./types/text.ijs"

const CENTER_X = WIDTH / 2
const BOTTOM_LEFT = [0, 1]
const CENTER = [0.5, 0.5]

const gizmos = collisionGizmos({ shapes: { rectangle: renderRectangle } })

export default {
  types: {
    ...controls("game"),

    Game,
    Bird: [Bird, gizmos],
    Pipe: [Pipe, gizmos],
    Title,
    TitlePrompt,
    Countdown,
    Score,
    GameOver,
    GameOverScore,
    GameOverPrompt,

    Fps: [{ render: renderFps }, fps({ accuracy: 0 })],
    Background: [{ render: renderImage }, infiniteScroll()],
    Ground: [{ render: renderImage }, infiniteScroll()],
  },

  entities: {
    ...createControls(
      "game",
      { Space: PRESS, Enter: PRESS, NumpadEnter: PRESS },
      [PRESS],
    ),

    game: {
      type: "Game",
      devMode: true,
      pixelated: true,
      size: [WIDTH, HEIGHT],
      backgroundColor: "rgb(40, 45, 52)",
      state: GAME_STATE.title,
      count: COUNTDOWN_START,
      timer: 0,
      score: 0,
      pipeTimer: 0,
      lastGapY: INITIAL_GAP_Y,
    },

    images: {
      type: "Images",
      images: {
        background: { url: "/images/background.png" },
        ground: { url: "/images/ground.png" },
        bird: { url: "/images/bird.png" },
        pipe: { url: "/images/pipe.png" },
      },
    },

    audio: {
      type: "Audio",
      sounds: {
        jump: { url: "/sounds/jump.wav" },
        explosion: { url: "/sounds/explosion.wav" },
        hurt: { url: "/sounds/hurt.wav" },
        score: { url: "/sounds/score.wav" },
      },
    },

    background: {
      type: "Background",
      layer: LAYER_BACKGROUND,
      position: v(0, 0, 0),
      velocity: v(-BACKGROUND_SPEED, 0, 0),
      image: {
        id: "background",
        imageSize: [WIDTH, HEIGHT],
        anchor: BOTTOM_LEFT,
        loop: v(BACKGROUND_LOOP, 0, 0),
      },
    },

    ground: {
      type: "Ground",
      layer: LAYER_GROUND,
      position: v(0, 0, 0),
      velocity: v(-GROUND_SPEED, 0, 0),
      image: {
        id: "ground",
        imageSize: [WIDTH, GROUND_HEIGHT],
        anchor: BOTTOM_LEFT,
        loop: v(GROUND_LOOP, 0, 0),
      },
    },

    bird: {
      type: "Bird",
      layer: LAYER_BIRD,
      position: BIRD_INITIAL_POSITION,
      velocity: v(0, 0, 0),
      size: BIRD_SIZE,
      collisions: {
        hitbox: { shape: "rectangle", size: BIRD_HITBOX_SIZE },
      },
      image: {
        id: "bird",
        imageSize: [BIRD_WIDTH, BIRD_HEIGHT],
        anchor: CENTER,
      },
    },

    score: {
      type: "Score",
      layer: LAYER_TEXT,
      position: v(8, HEIGHT - 8, 0),
      font: FONT_FAMILY,
      size: FONT_SIZE_LARGE,
      textAlign: "left",
      color: COLOR_TEXT,
    },

    title: {
      type: "Title",
      layer: LAYER_TEXT,
      position: v(CENTER_X, HEIGHT - 64, 0),
      font: FONT_FAMILY,
      size: FONT_SIZE_LARGE,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    titlePrompt: {
      type: "TitlePrompt",
      layer: LAYER_TEXT,
      position: v(CENTER_X, HEIGHT - 100, 0),
      font: FONT_FAMILY,
      size: FONT_SIZE_MEDIUM,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    countdown: {
      type: "Countdown",
      layer: LAYER_TEXT,
      position: v(CENTER_X, HEIGHT - 120, 0),
      font: FONT_FAMILY,
      size: FONT_SIZE_HUGE,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    gameOver: {
      type: "GameOver",
      layer: LAYER_TEXT,
      position: v(CENTER_X, HEIGHT - 64, 0),
      font: FONT_FAMILY,
      size: FONT_SIZE_LARGE,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    gameOverScore: {
      type: "GameOverScore",
      layer: LAYER_TEXT,
      position: v(CENTER_X, HEIGHT - 100, 0),
      font: FONT_FAMILY,
      size: FONT_SIZE_MEDIUM,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    gameOverPrompt: {
      type: "GameOverPrompt",
      layer: LAYER_TEXT,
      position: v(CENTER_X, HEIGHT - 160, 0),
      font: FONT_FAMILY,
      size: FONT_SIZE_MEDIUM,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    fps: {
      type: "Fps",
      layer: LAYER_OVERLAY,
      position: v(WIDTH - 10, HEIGHT - 10, 0),
      font: FONT_SMALL_FAMILY,
      size: FONT_SIZE_SMALL,
      textAlign: "right",
      color: "rgb(0, 255, 0)",
    },
  },
}
