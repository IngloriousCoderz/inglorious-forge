import { modernControls } from "@inglorious/engine/behaviors/controls/kinematic/modern"
import { fps } from "@inglorious/engine/behaviors/fps"
import {
  controlTypes,
  createControlEntities,
} from "@inglorious/engine/behaviors/input/controls"
import {
  createTouchEntity,
  touch,
} from "@inglorious/engine/behaviors/input/touch"
import { clamped } from "@inglorious/engine/behaviors/physics/clamped"
import { renderFps } from "@inglorious/renderer-2d/fps"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle"
import { magnitude } from "@inglorious/utils/vector.js"

import { Ball } from "./types/ball.ijs"
import { Game } from "./types/game.ijs"
import { paddle } from "./types/paddle.ijs"
import { Score } from "./types/score.ijs"
import { Text } from "./types/text.ijs"

const WIDTH = 432
const HEIGHT = 243

export default {
  types: {
    Touch: touch(),

    ...controlTypes(),
    Game,
    Text,
    Score,
    Paddle1: [
      { render: renderRectangle },
      ...paddle("player1"),
      modernControls(),
      clamped(),
    ],
    Paddle2: [
      { render: renderRectangle },
      ...paddle("player2"),
      modernControls(),
      clamped(),
    ],
    Ball,
    Fps: [{ render: renderFps }, fps({ accuracy: 0 })],
  },

  entities: {
    touch: createTouchEntity(),

    ...createControlEntities({
      KeyW: "player1Up",
      KeyS: "player1Down",
      Space: "action",
      ArrowUp: "player2Up",
      ArrowDown: "player2Down",
      // A gamepad's left stick drives both paddles, which is why the shared action
      // names are still what the movement behaviours read.
      Axis1: "moveUpDown",
    }),

    game: {
      type: "Game",
      devMode: true,
      pixelated: true,
      size: [WIDTH, HEIGHT],
      backgroundColor: "rgb(40, 45, 52)",
      state: "start",
      servingPlayer: "player1",
    },

    message: {
      type: "Text",
      position: v(WIDTH / 2, 0, HEIGHT - 10),
      font: "'Press Start 2P'",
      size: 8,
      lineHeight: 12,
      color: "white",
      textAlign: "center",
      value: "Welcome to Pong!\nPress Spacebar to begin!",
    },

    score: {
      type: "Score",
      position: v(WIDTH / 2, 0, HEIGHT / 2 + 28),
      font: "'Press Start 2P'",
      size: 32,
      color: "white",
      textAlign: "center",
      player1: 0,
      player2: 0,
      maxScore: 10,
    },

    player1: {
      type: "Paddle1",
      size: v(5, 0, 20),
      color: "transparent",
      backgroundColor: "white",
      collisions: {
        hitbox: { shape: "rectangle" },
        touch: { shape: "rectangle" },
      },
      maxSpeed: 200,
      position: v(10, 0, HEIGHT - 50),
    },

    player2: {
      type: "Paddle2",
      size: v(5, 0, 20),
      color: "transparent",
      backgroundColor: "white",
      collisions: {
        hitbox: { shape: "rectangle" },
        touch: { shape: "rectangle" },
      },
      maxSpeed: 200,
      position: v(WIDTH - 10, 0, 30),
    },

    ball: {
      type: "Ball",
      size: v(4, 0, 4),
      color: "transparent",
      backgroundColor: "white",
      collisions: {
        hitbox: { shape: "rectangle" },
        touch: { shape: "point" },
      },
      maxSpeed: magnitude(v(100, 0, 50)),
      speedIncrease: 1.03,
      position: v(WIDTH / 2, 0, HEIGHT / 2),
    },

    fps: {
      type: "Fps",
      position: v(10, 0, HEIGHT - 10),
      font: "'Press Start 2P'",
      size: 8,
      color: "rgb(0, 255, 0)",
    },

    audio: {
      type: "Audio",
      sounds: {
        paddleHit: { url: "/sounds/paddle_hit.ogg" },
        score: { url: "/sounds/score.ogg" },
        wallHit: { url: "/sounds/wall_hit.ogg" },
      },
    },
  },
}
