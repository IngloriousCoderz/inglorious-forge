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
  BIRD_WIDTH,
  COUNTDOWN_START,
  FONT_FAMILY,
  FONT_SIZE_HUGE,
  FONT_SIZE_LARGE,
  FONT_SIZE_MEDIUM,
  FONT_SIZE_SMALL,
  FONT_SMALL_FAMILY,
  GAME_STATE,
  INITIAL_GAP_Y,
  NO_DEPTH,
  NO_OFFSET,
  NO_RISE,
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

const CENTERED = 0.5
const LEFT_EDGE = 0
const BOTTOM_EDGE = 0

const CENTER_X = 512 / 2
const BOTTOM_LEFT = [LEFT_EDGE, BOTTOM_EDGE]
const CENTER = [CENTERED, CENTERED]

const gizmos = collisionGizmos({ shapes: { rectangle: renderRectangle } })

export default {
  types: {
    ...controlTypes(),

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
      { Space: "press", Enter: "press", NumpadEnter: "press" },
      ["press"],
    ),

    game: {
      type: "Game",
      // The game keeps counting while the world is held still for the game over
      // screen: the grace period and the countdown both run on this update, so if it
      // stopped the game could never be restarted.
      updatesWhilePaused: true,
      devMode: true,
      pixelated: true,
      size: [512, 288],
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
      layer: -3,
      position: v(NO_OFFSET, NO_RISE, NO_DEPTH),
      velocity: v(-30, NO_RISE, NO_DEPTH),
      image: {
        id: "background",
        imageSize: [512, 288],
        anchor: BOTTOM_LEFT,
        loop: v(413, NO_RISE, NO_DEPTH),
      },
    },

    ground: {
      type: "Ground",
      layer: 0,
      position: v(NO_OFFSET, NO_RISE, NO_DEPTH),
      velocity: v(-60, NO_RISE, NO_DEPTH),
      image: {
        id: "ground",
        imageSize: [512, 16],
        anchor: BOTTOM_LEFT,
        loop: v(512, NO_RISE, NO_DEPTH),
      },
    },

    bird: {
      type: "Bird",
      layer: -1,
      position: v(512 / 2 - 8 + 38 / 2, 288 / 2 + 8 - 24 / 2, NO_DEPTH),
      velocity: v(NO_OFFSET, NO_RISE, NO_DEPTH),
      size: v(38, 24, NO_DEPTH),
      collisions: {
        hitbox: {
          shape: "rectangle",
          size: v(38 - 2 * 2, 24 - 2 * 2, NO_DEPTH),
        },
      },
      image: {
        id: "bird",
        imageSize: [BIRD_WIDTH, 24],
        anchor: CENTER,
      },
    },

    score: {
      type: "Score",
      // Text is an overlay: it keeps updating while the world is held still.
      updatesWhilePaused: true,
      layer: 1,
      position: v(8, 288 - 8, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_LARGE,
      textAlign: "left",
      color: "white",
    },

    title: {
      type: "Title",
      // Text is an overlay: it keeps updating while the world is held still.
      updatesWhilePaused: true,
      layer: 1,
      position: v(CENTER_X, 288 - 64, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_LARGE,
      textAlign: "center",
      color: "white",
    },

    titlePrompt: {
      type: "TitlePrompt",
      // Text is an overlay: it keeps updating while the world is held still.
      updatesWhilePaused: true,
      layer: 1,
      position: v(CENTER_X, 288 - 100, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_MEDIUM,
      textAlign: "center",
      color: "white",
    },

    countdown: {
      type: "Countdown",
      // Text is an overlay: it keeps updating while the world is held still.
      updatesWhilePaused: true,
      layer: 1,
      position: v(CENTER_X, 288 - 120, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_HUGE,
      textAlign: "center",
      color: "white",
    },

    gameOver: {
      type: "GameOver",
      // Text is an overlay: it keeps updating while the world is held still.
      updatesWhilePaused: true,
      layer: 1,
      position: v(CENTER_X, 288 - 64, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_LARGE,
      textAlign: "center",
      color: "white",
    },

    gameOverScore: {
      type: "GameOverScore",
      // Text is an overlay: it keeps updating while the world is held still.
      updatesWhilePaused: true,
      layer: 1,
      position: v(CENTER_X, 288 - 100, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_MEDIUM,
      textAlign: "center",
      color: "white",
    },

    gameOverPrompt: {
      type: "GameOverPrompt",
      // Text is an overlay: it keeps updating while the world is held still.
      updatesWhilePaused: true,
      layer: 1,
      position: v(CENTER_X, 288 - 160, NO_DEPTH),
      font: FONT_FAMILY,
      size: FONT_SIZE_MEDIUM,
      textAlign: "center",
      color: "white",
    },

    fps: {
      type: "Fps",
      layer: 2,
      position: v(512 - 10, 288 - 10, NO_DEPTH),
      font: FONT_SMALL_FAMILY,
      size: FONT_SIZE_SMALL,
      textAlign: "right",
      color: "rgb(0, 255, 0)",
    },
  },
}
