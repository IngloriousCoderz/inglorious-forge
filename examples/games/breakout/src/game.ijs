import { collisionGizmos } from "@inglorious/engine/behaviors/debug/collision"
import { fps } from "@inglorious/engine/behaviors/fps"
import {
  controlTypes,
  createControlEntities,
} from "@inglorious/engine/behaviors/input/controls.js"
import { particle } from "@inglorious/engine/behaviors/particles.js"
import { scenes } from "@inglorious/engine/behaviors/scenes.js"
import { renderFps } from "@inglorious/renderer-2d/fps.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle.js"
import { v } from "@inglorious/utils/v.js"

import {
  FPS_ALTITUDE,
  FPS_MARGIN,
  FPS_SIZE,
  GAME_STATE,
  HEIGHT,
  LAYER_BACKGROUND,
  LAYER_OVERLAY,
  MENU_START,
  PRESS,
  PRESS_MENU_DOWN,
  PRESS_MENU_UP,
  QUIT,
  TOGGLE_PAUSE,
  WIDTH,
} from "./constants.js"
import { Ball } from "./types/ball.ijs"
import { Brick } from "./types/brick.ijs"
import { Heart } from "./types/heart.ijs"
import { Paddle } from "./types/paddle.ijs"
import { SCENES } from "./types/scene.ijs"
import { Game } from "./types/states.ijs"
import {
  EnteredLetter,
  EnterScorePrompt,
  GameOverPrompt,
  GameOverScore,
  GameOverTitle,
  HighScoreName,
  HighScorePosition,
  HighScores,
  HighScoreScore,
  HighScoresPrompt,
  HighScoreTitle,
  Level,
  Paused,
  Score,
  ScoreLabel,
  ServePrompt,
  Start,
  Title,
  VictoryPrompt,
  VictoryTitle,
  YourScore,
} from "./types/text.ijs"

const FPS_COLOR = "rgb(0, 255, 0)"

// The hitboxes the ball actually collides with, drawn over the sprites in debug mode.
// The shapes are resolved the same way the detection resolves them, so an entity that is
// merely `solid` shows the box it is really using.
const gizmos = collisionGizmos({ shapes: { rectangle: renderRectangle } })

export default {
  types: {
    ...controlTypes(),

    Game: [scenes(SCENES), Game],
    Ball: [...Ball, gizmos],
    Brick: [Brick, gizmos],

    // The debris a brick throws off. One of these is emitted per particle of a burst, so
    // they are pooled rather than added and taken away by hand.
    Particle: [{ render: renderImage }, particle()],
    Paddle: [...Paddle, gizmos],
    Heart,
    Title,
    Start,
    HighScores,
    Level,
    Paused,
    ScoreLabel,
    Score,
    ServePrompt,
    VictoryTitle,
    VictoryPrompt,
    GameOverTitle,
    GameOverScore,
    GameOverPrompt,

    // The table of scores kept between games: a title, and each row of it in three pieces
    // because the original aligns each of those separately.
    HighScoreTitle,
    HighScorePosition,
    HighScoreName,
    HighScoreScore,
    HighScoresPrompt,
    YourScore,
    EnteredLetter,
    EnterScorePrompt,

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
    // One mapping for the whole game. An action's name is what addresses it, so the
    // paddle's movement and the game's menu keys can share one keyboard.
    ...createControlEntities({
      Enter: PRESS,
      Escape: QUIT,
      Space: TOGGLE_PAUSE,
      ArrowUp: PRESS_MENU_UP,
      ArrowDown: PRESS_MENU_DOWN,
      ArrowLeft: "moveLeft",
      ArrowRight: "moveRight",
    }),

    game: {
      type: "Game",
      devMode: true,
      pixelated: true,
      size: [WIDTH, HEIGHT],
      state: GAME_STATE.start,
      menuItem: MENU_START,
      // The level the bricks are rolled for. Nothing moves it on yet -- the original
      // asks for level one from its start screen for now -- but the levelmaker reads it,
      // so it is the game's to carry rather than the levelmaker's to guess.
      level: 1,
    },

    images: {
      type: "Images",
      images: {
        background: { url: "/images/background.png" },
        breakout: { url: "/images/breakout.png" },
        hearts: { url: "/images/hearts.png" },
        particle: { url: "/images/particle.png" },
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
        brickBroken: { url: "/sounds/brick_hit_1.wav" },
        victory: { url: "/sounds/victory.wav" },
        select: { url: "/sounds/select.wav" },
        highScore: { url: "/sounds/high_score.wav" },
        hurt: { url: "/sounds/hurt.wav" },
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
      position: v(FPS_MARGIN, FPS_ALTITUDE, 0),
      size: FPS_SIZE,
      color: FPS_COLOR,
      textAlign: "left",
    },
  },
}
