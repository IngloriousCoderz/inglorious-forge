/* eslint-disable no-magic-numbers */

import { renderText } from "@inglorious/renderer-2d/text.js"

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

  // Height is what the box measures on screen, which is the `y` extent and the `z`
  // extent together: a button sized `[100, 0, 26]` stands twenty-six tall, not zero.
  // Reading only the middle number draws a line through the label instead of a box
  // around it.
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

  // Drawn last, so a label is never painted over by the box it sits in. The middle of
  // the line is put on the middle of the button rather than on its top edge, so that a
  // label of any size sits in the middle of the thing it names.
  //
  // Skipped rather than left empty when there is no label: `renderText` draws an empty
  // string as a real call, which on a canvas with no font metrics behind it asks for a
  // line height it cannot measure.
  if (!label) return

  renderText(
    {
      // The entity first, because a button's own `size` is the box it draws rather than
      // the size of the lettering on it -- so the label size is said last, or the text
      // would be asked to be drawn at "80,40px".
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
