import { v } from "@inglorious/utils/v.js"

const X = 0
const Y = 1
const Z = 2
const HALF = 2
const CENTER = 0.5
const NO_EXTENT = 0

/**
 * A shape is centred on its position unless it says otherwise.
 */
export const DEFAULT_ANCHOR = v(CENTER, CENTER, CENTER)

/**
 * The anchor an entity's shapes are positioned by.
 *
 * An anchor names the point of a shape that sits on the position, counting from
 * its top-left corner: `[0.5, 0.5]` is the middle, `[0, 1]` its bottom-left,
 * `[1, 0]` its top-right. Anchors count from the top on both vertical axes
 * because that is what you see on screen — the renderer flips `y` and `z` on the
 * way to the canvas, so `[0, 1]` puts a shape on the floor rather than in it.
 *
 * A third coordinate may be given for the depth axis; it defaults to the middle,
 * so a two-component anchor works for sprites and for flat 2D bodies alike.
 *
 * @example
 * ```js
 * // A platform described by its bottom-left corner, which is what you stand on.
 * { type: "Platform", position: v(0, 0, 0), size: v(64, 16, 0), anchor: [0, 1] }
 *
 * // A body straddling its position, which is the default.
 * { type: "Ball", position: v(10, 10, 0), size: v(4, 4, 0) }
 * ```
 */
export function entityAnchor(entity) {
  return entity.anchor ?? entity.image?.anchor ?? DEFAULT_ANCHOR
}

/**
 * The anchor a collision shape is positioned by. A shape can override the one its
 * entity uses, so that a sprite and its hitbox can be pinned differently.
 */
export function shapeAnchor(entity, collision) {
  return collision.anchor ?? entityAnchor(entity)
}

/**
 * How far the centre of a box sits from the point it is anchored to, per axis.
 *
 * Every axis works the same way, because the anchor counts from the same end the
 * coordinate does.
 */
export function anchorOffset(anchor, size) {
  const [anchorX = CENTER, anchorY = CENTER, anchorZ = CENTER] = anchor ?? []
  const [width, height, depth] = extentsOf(size)

  return v(
    (CENTER - anchorX) * width,
    (CENTER - anchorY) * height,
    (CENTER - anchorZ) * depth,
  )
}

/**
 * How much room a box takes on either side of the point it is anchored to, as
 * `before` and `after` vectors: what lies below and behind the point, and what
 * lies above and in front of it. Together the two are always the full extent,
 * whatever the anchor is.
 *
 * A shape anchored at `[0, 0]` therefore leaves nothing below it and its whole
 * height above it, which is what lets it rest on a floor.
 */
export function anchorMargins(anchor, size) {
  const offset = anchorOffset(anchor, size)
  const [width, height, depth] = halfExtentsOf(size)

  return {
    before: v(width - offset[X], height - offset[Y], depth - offset[Z]),
    after: v(width + offset[X], height + offset[Y], depth + offset[Z]),
  }
}

function extentsOf(size) {
  const [width = NO_EXTENT, height = NO_EXTENT, depth = NO_EXTENT] = size ?? []

  return [width, height, depth]
}

function halfExtentsOf(size) {
  const [width, height, depth] = extentsOf(size)

  return [width / HALF, height / HALF, depth / HALF]
}
