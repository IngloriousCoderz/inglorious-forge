import { collisionGizmos } from "@inglorious/engine/behaviors/debug/collision"
import { fps } from "@inglorious/engine/behaviors/fps"
import {
  controlTypes,
  createControlEntities,
} from "@inglorious/engine/behaviors/input/controls.js"
import { particle } from "@inglorious/engine/behaviors/particles.js"
import { mappings } from "@inglorious/engine/behaviors/state-machine/mappings.js"
import { scenes } from "@inglorious/engine/behaviors/state-machine/scenes.js"
import { renderFps } from "@inglorious/renderer-2d/fps.js"
import { renderImage } from "@inglorious/renderer-2d/image/image.js"
import { renderRectangle } from "@inglorious/renderer-2d/shapes/rectangle.js"
import { v } from "@inglorious/utils/v.js"

import { HEIGHT, WIDTH } from "./constants.js"
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
  SelectArrow,
  SelectPaddle,
  SelectPaddleHint,
  SelectPaddlePrompt,
  ServePrompt,
  Start,
  Title,
  VictoryPrompt,
  VictoryTitle,
  YourScore,
} from "./types/text.ijs"

// What each state answers to, by key and by button alike -- a gamepad button is mapped the
// same way a key is, so the name says what is in the table rather than half of it.
//
// Every state says its own, and a state that says none is deaf on purpose: the same key
// answers one thing on the menu and another in play, so carrying the last mapping on into a
// state nobody thought about would be the mistake.
const MAPPINGS_BY_STATE = {
  start: {
    Enter: "press",
    Escape: "quit",
    ArrowUp: "pressMenuUp",
    ArrowDown: "pressMenuDown",
  },
  // The paddle is on the screen for the wait as well as the play, and it is what the wait
  // is for: the original's own comment says the state is "basically just moving the paddle
  // left and right with the ball". So the arrows are here too, and not only in the play.
  serve: {
    Enter: "press",
    Escape: "quit",
    ArrowLeft: "moveLeft",
    ArrowRight: "moveRight",
  },
  play: {
    Space: "togglePause",
    Escape: "quit",
    ArrowLeft: "moveLeft",
    ArrowRight: "moveRight",
  },
  victory: {
    Enter: "press",
    Escape: "quit",
    ArrowLeft: "moveLeft",
    ArrowRight: "moveRight",
  },
  gameOver: { Enter: "press", Escape: "quit" },
  highScores: { Escape: "quit" },
  // Which letter is being changed is moved with the same keys the paddle moves with,
  // because there is no paddle on this screen to want them.
  // Here the arrows move a choice rather than the paddle, which is the whole reason a
  // state says its own keys: the same four keys mean the opposite of what they mean in
  // the play, and nothing has to be renamed or worked around to say so.
  paddleSelect: {
    Enter: "press",
    Escape: "quit",
    ArrowLeft: "moveLeft",
    ArrowRight: "moveRight",
  },
  enterHighScore: {
    Enter: "press",
    Escape: "quit",
    ArrowLeft: "moveLeft",
    ArrowRight: "moveRight",
    ArrowUp: "pressMenuUp",
    ArrowDown: "pressMenuDown",
  },
}

const FPS_COLOR = "rgb(0, 255, 0)"

// The hitboxes the ball actually collides with, drawn over the sprites in debug mode.
// The shapes are resolved the same way the detection resolves them, so an entity that is
// merely `solid` shows the box it is really using.
const gizmos = collisionGizmos({ shapes: { rectangle: renderRectangle } })

export default {
  types: {
    ...controlTypes(),

    Game: [
      scenes(SCENES),
      mappings(MAPPINGS_BY_STATE),
      (type) => ({
        // The music runs under every screen and is never stopped, so nothing here starts
        // or ends it: it begins when the game does.
        start(entity, event, api) {
          type.start?.(entity, event, api)

          api.notify("soundPlay", "music")
        },
      }),
      Game,
    ],
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
    SelectArrow,
    SelectPaddle,
    SelectPaddleHint,
    SelectPaddlePrompt,
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
    // One keyboard for the whole game, and no mapping of its own: what each key means is
    // said by the state that answers to it, and applied when the machine moves. An action's
    // name is what addresses it, so the paddle's movement and the menu's keys can share one
    // keyboard without either having to know about the other.
    ...createControlEntities(),

    game: {
      type: "Game",
      devMode: true,
      pixelated: true,
      size: [WIDTH, HEIGHT],
      state: "start",
      menuItem: "start",
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
        arrows: { url: "/images/arrows.png" },
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
        noSelect: { url: "/sounds/no-select.wav" },
        recover: { url: "/sounds/recover.wav" },
        music: { url: "/sounds/music.wav", loop: true, volume: 0.25 },
        hurt: { url: "/sounds/hurt.wav" },
      },
    },

    background: {
      type: "Background",
      layer: -1,
      position: v(0, 0, 0),
      anchor: [0, 0],
    },

    fps: {
      type: "Fps",
      // An overlay keeps updating while the world is halted, or it would freeze on
      // whatever it last drew.
      updatesWhilePaused: true,
      layer: 4,
      position: v(4, HEIGHT - 4 - 8, 0),
      size: 8,
      color: FPS_COLOR,
      textAlign: "left",
    },
  },
}
