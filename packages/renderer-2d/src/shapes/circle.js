/* eslint-disable no-magic-numbers */

import { pi } from "@inglorious/utils/math/trigonometry.js"
import { zero } from "@inglorious/utils/vectors.js"

export function renderCircle(entity, ctx) {
  const {
    offset = zero(),
    radius = 24,
    color = "black",
    backgroundColor = "transparent",
    thickness = 1,
  } = entity
  const [x, y, z] = offset

  ctx.save()

  ctx.lineWidth = thickness
  ctx.strokeStyle = color
  ctx.fillStyle = backgroundColor

  ctx.beginPath()
  ctx.arc(x, -y - z, radius, 0, 2 * pi())
  ctx.fill()
  ctx.stroke()
  ctx.closePath()

  ctx.restore()
}
