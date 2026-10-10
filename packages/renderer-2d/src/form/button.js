/* eslint-disable no-magic-numbers */

const DEFAULT_SIZE = [100, 50]

export function renderButton(entity, ctx) {
  const { size = DEFAULT_SIZE, color = "black", thickness = 1 } = entity
  const [width = DEFAULT_SIZE[0], height = DEFAULT_SIZE[1]] = size

  ctx.save()

  ctx.lineWidth = thickness
  ctx.strokeStyle = color

  if (entity.state === "pressed") {
    ctx.fillStyle = "white"
  } else {
    ctx.fillStyle = "black"
  }

  ctx.beginPath()
  ctx.fillRect(-width / 2, -height / 2, width, height)
  ctx.strokeRect(-width / 2, -height / 2, width, height)
  ctx.stroke()
  ctx.closePath()

  ctx.restore()
}
