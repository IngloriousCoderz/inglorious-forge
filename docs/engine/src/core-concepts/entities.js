import { v } from "@inglorious/utils/v.js"

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
    },
  },

  entities: {
    game: {
      type: "game",
      devMode: true,
    },

    character: {
      type: "character",
      position: v(400, 0, 300),
    },
  },
}
