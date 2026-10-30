/* eslint-disable no-magic-numbers */

import { renderText } from "../text.js"

const DEFAULT_SIZE = [100, 50]
const NO_DEPTH = 0
const DEFAULT_LABEL_SIZE = 14
const HALF = 2

export function renderButton(entity, ctx) {
  const {
    size = DEFAULT_SIZE,
    color = "black",
    thickness = 1,
    label = "",
    labelColor = color,
    labelSize = DEFAULT_LABEL_SIZE,
  } = entity
  const [width = DEFAULT_SIZE[0], height = DEFAULT_SIZE[1], depth = NO_DEPTH] =
    size ?? []

  const boxHeight = height + depth

  ctx.save()

  ctx.lineWidth = thickness
  ctx.strokeStyle = color

  if (entity.state === "pressed") {
    ctx.fillStyle = "white"
  } else {
    ctx.fillStyle = "black"
  }

  ctx.beginPath()
  ctx.fillRect(-width / HALF, -boxHeight / HALF, width, boxHeight)
  ctx.strokeRect(-width / HALF, -boxHeight / HALF, width, boxHeight)
  ctx.stroke()
  ctx.closePath()

  ctx.restore()

  if (!label) return

  renderText(
    {
      ...entity,
      size: labelSize,
      color: labelColor,
      textAlign: "center",
      baseline: "middle",
      value: label,
    },
    ctx,
  )
}
