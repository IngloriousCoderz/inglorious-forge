/* eslint-disable no-magic-numbers */
import { fps } from "@inglorious/engine/behaviors/fps"
import { infiniteScroll } from "@inglorious/engine/behaviors/infinite-scroll"
import { createTouch, touch } from "@inglorious/engine/behaviors/input/touch"
import { renderFps } from "@inglorious/renderer-2d/fps"
import { renderImage } from "@inglorious/renderer-2d/image/image"
import { zero } from "@inglorious/utils/math/vector"

import { Game } from "./types/game"

const WIDTH = 512
const HEIGHT = 288

export default {
  types: {
    Touch: touch(),

    Game,
    Fps: [{ render: renderFps }, fps({ accuracy: 0 })],

    Background: [{ render: renderImage }, infiniteScroll()],
    Ground: [{ render: renderImage }, infiniteScroll()],
  },

  entities: {
    touch: createTouch(),

    game: {
      type: "Game",
      devMode: true,
      pixelated: true,
      size: [WIDTH, HEIGHT],
      backgroundColor: "rgb(40, 45, 52)",
      state: "start",
    },

    fps: {
      type: "Fps",
      position: v(10, 0, HEIGHT - 10),
      font: "'Press Start 2P'",
      size: 8,
      color: "rgb(0, 255, 0)",
    },

    images: {
      type: "images",
      images: {
        background: { url: "/images/background.png" },
        ground: { url: "/images/ground.png" },
      },
    },

    audio: {
      type: "audio",
      sounds: {
        // paddleHit: { url: "/sounds/paddle_hit.ogg" },
        // score: { url: "/sounds/score.ogg" },
        // wallHit: { url: "/sounds/wall_hit.ogg" },
      },
    },

    background: {
      type: "Background",
      position: zero(),
      velocity: v(-30, 0, 0),
      image: {
        id: "background",
        imageSize: [WIDTH, HEIGHT],
        anchor: [0, 1],
        loop: v(413, 0, 0),
      },
    },

    ground: {
      type: "Ground",
      position: zero(),
      velocity: v(-60, 0, 0),
      image: {
        id: "ground",
        imageSize: [WIDTH, 16],
        anchor: [0, 1],
        loop: v(WIDTH, 0, 0),
      },
    },
  },
}
