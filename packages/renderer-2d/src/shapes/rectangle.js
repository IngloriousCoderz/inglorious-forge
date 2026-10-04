/* eslint-disable no-magic-numbers */

import { zero } from "@inglorious/utils/vectors"

export function renderRectangle(entity, ctx) {
  const {
    offset = zero(),
    size,
    color = "black",
    backgroundColor = "transparent",
    thickness = 1,
  } = entity
  const [x, y, z] = offset
  const [width = 100, height = 50, depth = 0] = size
  const rectHeight = height + depth

  ctx.save()

  ctx.lineWidth = thickness
  ctx.strokeStyle = color
  ctx.fillStyle = backgroundColor

  ctx.fillRect(x - width / 2, -y - z - rectHeight / 2, width, rectHeight)
  ctx.strokeRect(x - width / 2, -y - z - rectHeight / 2, width, rectHeight)

  ctx.restore()
}
