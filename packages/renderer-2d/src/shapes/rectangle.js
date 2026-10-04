import {
  anchorOffset,
  entityAnchor,
} from "@inglorious/engine/physics/anchor.js"
import { sum, zero } from "@inglorious/utils/vectors"

const HALF = 2
const DEFAULT_THICKNESS = 1
const DEFAULT_WIDTH = 100
const DEFAULT_HEIGHT = 50
const NO_DEPTH = 0

/**
 * Draws a box, hung off the entity position by its `anchor`.
 *
 * The anchor defaults to the centre, so a plain rectangle straddles its
 * position. Set it to `[0, 1]` to have the box hang above and to the left of it
 * instead, which is how a platform sitting on the floor is usually described.
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

  const [x, y, z] = sum(
    entity.offset ?? zero(),
    anchorOffset(entityAnchor(entity), size),
  )

  const boxHeight = height + depth
  const left = x - width / HALF
  const top = -y - z - boxHeight / HALF

  ctx.save()

  ctx.lineWidth = thickness
  ctx.strokeStyle = color
  ctx.fillStyle = backgroundColor

  ctx.fillRect(left, top, width, boxHeight)
  ctx.strokeRect(left, top, width, boxHeight)

  ctx.restore()
}
