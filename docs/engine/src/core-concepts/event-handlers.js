import { v } from "@inglorious/utils/v.js"

const ORIGIN = 0
const X = 0

export default {
  types: {
    character: {
      render(entity, ctx) {
        const {
          size = 24,
          orientation = 0,
          stroke = "black",
          fill = "transparent",
        } = entity

        const radius = size * 0.5

        ctx.save()
        ctx.rotate(-orientation)
        ctx.translate(radius - 1, 0)

        ctx.fillStyle = "black"

        ctx.beginPath()
        ctx.moveTo(0, 6)
        ctx.lineTo(0, -6)
        ctx.lineTo(6, 0)
        ctx.fill()
        ctx.closePath()
        ctx.restore()

        ctx.save()
        ctx.lineWidth = 1
        ctx.strokeStyle = stroke
        ctx.fillStyle = fill

        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, 2 * 3.14)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
      },

      update(entity, dt, api) {
        const game = api.getEntity("game")
        const [gameWidth] = game.size

        if (entity.position[X] > gameWidth) {
          entity.velocity[X] = -entity.maxSpeed
          entity.orientation = 3.14
        } else if (entity.position[X] < ORIGIN) {
          entity.velocity[X] = entity.maxSpeed
          entity.orientation = 0
        }

        entity.position[X] += entity.velocity[X] * dt
      },
    },
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    character: {
      type: "character",
      maxSpeed: 250,
      position: v(400, 0, 300),
      velocity: v(250, 0, 0),
      orientation: 0,
    },
  },
}
