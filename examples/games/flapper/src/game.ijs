import { collisionGizmos } from "@inglorious/engine/behaviors/debug/collision.js"
import { fps } from "@inglorious/engine/behaviors/fps"
import { infiniteScroll } from "@inglorious/engine/behaviors/infinite-scroll"
import {
  controlTypes,
  createControlEntities,
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
  COUNTDOWN_TEXT_ALTITUDE,
  FONT_FAMILY,
  FONT_SIZE_HUGE,
  FONT_SIZE_LARGE,
  FONT_SIZE_MEDIUM,
  FONT_SIZE_SMALL,
  FONT_SMALL_FAMILY,
  FPS_TEXT_ALTITUDE,
  FPS_TEXT_X,
  GAME_OVER_PROMPT_TEXT_ALTITUDE,
  GAME_OVER_SCORE_TEXT_ALTITUDE,
  GAME_OVER_TEXT_ALTITUDE,
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
  NO_DEPTH,
  NO_OFFSET,
  NO_RISE,
  PRESS,
  PROMPT_TEXT_ALTITUDE,
  SCORE_TEXT_ALTITUDE,
  SCORE_TEXT_X,
  TITLE_TEXT_ALTITUDE,
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

const HALF = 2
const CENTERED = 0.5
const LEFT_EDGE = 0
const BOTTOM_EDGE = 0

const CENTER_X = WIDTH / HALF
const BOTTOM_LEFT = [LEFT_EDGE, BOTTOM_EDGE]
const CENTER = [CENTERED, CENTERED]

const gizmos = collisionGizmos({ shapes: { rectangle: renderRectangle } })

export default {
  types: {
    ...controlTypes("game"),

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
    ...createControlEntities(
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
      position: v(NO_OFFSET, NO_RISE, NO_DEPTH),
      velocity: v(-BACKGROUND_SPEED, NO_RISE, NO_DEPTH),
      image: {
        id: "background",
        imageSize: [WIDTH, HEIGHT],
        anchor: BOTTOM_LEFT,
        loop: v(BACKGROUND_LOOP, NO_RISE, NO_DEPTH),
      },
    },

    ground: {
      type: "Ground",
      layer: LAYER_GROUND,
      position: v(NO_OFFSET, NO_RISE, NO_DEPTH),
      velocity: v(-GROUND_SPEED, NO_RISE, NO_DEPTH),
      image: {
        id: "ground",
        imageSize: [WIDTH, GROUND_HEIGHT],
        anchor: BOTTOM_LEFT,
        loop: v(GROUND_LOOP, NO_RISE, NO_DEPTH),
      },
    },

    bird: {
      type: "Bird",
      layer: LAYER_BIRD,
      position: BIRD_INITIAL_POSITION,
      velocity: v(NO_OFFSET, NO_RISE, NO_DEPTH),
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
      position: v(SCORE_TEXT_X, SCORE_TEXT_ALTITUDE, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_LARGE,
      textAlign: "left",
      color: COLOR_TEXT,
    },

    title: {
      type: "Title",
      layer: LAYER_TEXT,
      position: v(CENTER_X, TITLE_TEXT_ALTITUDE, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_LARGE,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    titlePrompt: {
      type: "TitlePrompt",
      layer: LAYER_TEXT,
      position: v(CENTER_X, PROMPT_TEXT_ALTITUDE, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_MEDIUM,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    countdown: {
      type: "Countdown",
      layer: LAYER_TEXT,
      position: v(CENTER_X, COUNTDOWN_TEXT_ALTITUDE, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_HUGE,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    gameOver: {
      type: "GameOver",
      layer: LAYER_TEXT,
      position: v(CENTER_X, GAME_OVER_TEXT_ALTITUDE, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_LARGE,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    gameOverScore: {
      type: "GameOverScore",
      layer: LAYER_TEXT,
      position: v(CENTER_X, GAME_OVER_SCORE_TEXT_ALTITUDE, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_MEDIUM,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    gameOverPrompt: {
      type: "GameOverPrompt",
      layer: LAYER_TEXT,
      position: v(CENTER_X, GAME_OVER_PROMPT_TEXT_ALTITUDE, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_MEDIUM,
      textAlign: "center",
      color: COLOR_TEXT,
    },

    fps: {
      type: "Fps",
      layer: LAYER_OVERLAY,
      position: v(FPS_TEXT_X, FPS_TEXT_ALTITUDE, NO_DEPTH),
      font: FONT_SMALL_FAMILY,
      size: FONT_SIZE_SMALL,
      textAlign: "right",
      color: "rgb(0, 255, 0)",
    },
  },
}
