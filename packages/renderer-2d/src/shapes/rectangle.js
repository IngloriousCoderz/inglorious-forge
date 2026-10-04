import {
  anchorMargins,
  entityAnchor,
} from "@inglorious/engine/physics/anchor.js"
import { v } from "@inglorious/utils/v.js"
import { zero } from "@inglorious/utils/vectors"

const X = 0
const Y = 1
const Z = 2
const DEFAULT_THICKNESS = 1
const DEFAULT_WIDTH = 100
const DEFAULT_HEIGHT = 50
const NO_DEPTH = 0

/**
 * Draws a box, hung off the entity position by its `anchor`.
 *
 * The anchor defaults to the centre, so a plain rectangle straddles its
 * position. Set it to `[0, 0]` to have the box stand on its position instead,
 * which is how a platform sitting on the floor is usually described.
 *
 * The box is measured from the same margins collision detection uses, so a gizmo
 * lands on the box it outlines rather than near it.
 */
export function renderRectangle(entity, ctx) {
  const {
    size,
    color = "black",
    backgroundColor = "transparent",
    thickness = DEFAULT_THICKNESS,
  } = entity

  const [width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, depth = NO_DEPTH] =
    size ?? []

  const { before, after } = anchorMargins(
    entityAnchor(entity),
    v(width, height, depth),
  )

  // The renderer has already moved the canvas onto the position, so the box is
  // laid out from the origin. The canvas counts down while the world's `y` and
  // `z` both count up, so the box reaches upwards by its far margins.
  const [offsetX, offsetY, offsetZ] = entity.offset ?? zero()
  const left = offsetX - before[X]
  const top = -(offsetY + after[Y]) - (offsetZ + after[Z])
  const boxWidth = before[X] + after[X]
  const boxHeight = before[Y] + after[Y] + before[Z] + after[Z]

  ctx.save()

  ctx.lineWidth = thickness
  ctx.strokeStyle = color
  ctx.fillStyle = backgroundColor

  ctx.fillRect(left, top, boxWidth, boxHeight)
  ctx.strokeRect(left, top, boxWidth, boxHeight)

  ctx.restore()
}
