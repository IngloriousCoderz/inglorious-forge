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
let NEXT_ID = 0

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
        api.notify("add", {
          id: `bubble-${NEXT_ID++}`,
          type: "bubble",
          position: [random(0, 800), 0, random(0, 600)],
          velocity: [random(-50, 50), 0, random(-50, 50)],
          color: getRandomColor(),
        })
      }
    },

    update(entity, dt, api) {
      type.update?.(entity, dt, api)

      const activeBubbles = Object.values(api.getEntities()).filter(
        (entity) => entity.type === "bubble",
      )

      if (activeBubbles.length < MAX_BUBBLES) {
        api.notify("add", {
          id: `bubble-${NEXT_ID++}`,
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
        api.notify("remove", entity.id)
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
          const entities = api.getEntities()
          entity.value = `Active bubbles: ${Object.values(entities).filter(({ type }) => type === "bubble").length}`
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
