import { fps } from "@inglorious/engine/behaviors/fps.js"
import { game } from "@inglorious/engine/behaviors/game.js"
import { renderFps } from "@inglorious/renderer-2d/fps.js"
import { renderCircle } from "@inglorious/renderer-2d/shapes/circle.js"
import { renderText } from "@inglorious/renderer-2d/text.js"
import { random } from "@inglorious/utils/math/rng.js"
import { scale } from "@inglorious/utils/math/vector.js"
import { add } from "@inglorious/utils/math/vectors.js"
import { v } from "@inglorious/utils/v.js"

const ORIGIN = 0
const MAX_BUBBLES = 1000

function velocity() {
  return (type) => ({
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      entity.position = add(entity.position, scale(entity.velocity, dt))
    },
  })
}

function spawning() {
  return (type) => ({
    start(entity, event, api) {
      type.start?.(entity, event, api)

      for (let i = 0; i < MAX_BUBBLES; i++) {
        api.notify("spawn", {
          type: "bubble",
          position: [random(0, 800), 0, random(0, 600)],
          velocity: [random(-50, 50), 0, random(-50, 50)],
          color: getRandomColor(),
        })
      }
    },

    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      const activeBubbles = api.getEntityPoolsStats().bubble?.active || 0

      if (activeBubbles < MAX_BUBBLES) {
        api.notify("spawn", {
          type: "bubble",
          position: [random(0, 800), 0, random(0, 600)],
          velocity: [random(-50, 50), 0, random(-50, 50)],
          color: getRandomColor(),
        })
      }
    },
  })
}

function despawning() {
  return (type) => ({
    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      const game = api.getEntity("game")
      const [gameWidth, gameHeight] = game.size
      const [x, y, z] = entity.position

      if (
        x < ORIGIN ||
        x > gameWidth ||
        y < ORIGIN ||
        y > gameHeight ||
        z < ORIGIN ||
        z > gameHeight
      ) {
        api.notify("despawn", entity)
      }
    },
  })
}

export default {
  types: {
    game: [game(), spawning()],

    bubble: [{ render: renderCircle }, velocity(), despawning()],

    fps: [{ render: renderFps }, fps()],

    activeBubbles: [
      { render: renderText },
      {
        update(entity, dt, api) {
          const activeBubbles = api.getEntityPoolsStats().bubble?.active || 0
          entity.value = `Active bubbles: ${activeBubbles}`
        },
      },
    ],

    inactiveBubbles: [
      { render: renderText },
      {
        update(entity, dt, api) {
          const inactiveBubbles =
            api.getEntityPoolsStats().bubble?.inactive || 0
          entity.value = `Inactive bubbles: ${inactiveBubbles}`
        },
      },
    ],
  },

  entities: {
    game: { devMode: true },

    fps: {
      type: "fps",
      position: v(0, 0, 600),
      layer: 1,
    },

    activeBubbles: {
      type: "activeBubbles",
      position: v(0, 0, 580),
      layer: 1,
    },

    inactiveBubbles: {
      type: "inactiveBubbles",
      position: v(0, 0, 560),
      layer: 1,
    },
  },
}

function getRandomColor() {
  const letters = "0123456789ABCDEF"
  let color = "#"
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}
