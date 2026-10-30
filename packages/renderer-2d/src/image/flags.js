/**
 * A frame of a sprite sheet can be mirrored as well as picked, and a mirrored frame is
 * written as the frame's own number with a flag set in the top bit rather than as a
 * number of its own. Both renderers read that flag back out, and an author writing frames
 * would otherwise have to write the flag themselves.
 *
 * These live here so that the two renderers that read them and the frame lists that write
 * them agree on one set of numbers.
 */

export const FLIPPED_HORIZONTALLY_FLAG = 0x80000000
export const FLIPPED_VERTICALLY_FLAG = 0x40000000

/**
 * The number for a frame drawn mirrored left to right.
 *
 * @example
 * ```js
 * import { flippedHorizontally } from "@inglorious/renderer-2d/image/flags.js"
 *
 * const entities = {
 *   cat: {
 *     type: "Cat",
 *     sprite: {
 *       image: { id: "neko", imageSize: [192, 192], tileSize: [32, 32] },
 *       frames: { left: [flippedHorizontally(16), flippedHorizontally(22)] },
 *     },
 *   },
 * }
 * ```
 *
 * @param {number} frame - The frame's number on the sheet, counted from the top left.
 * @returns {number} The frame's number with the mirror set in it.
 */
const SIGNED_32_BIT = 0

export function flippedHorizontally(frame) {
  return FLIPPED_HORIZONTALLY_FLAG | frame | SIGNED_32_BIT
}

/**
 * The number for a frame drawn mirrored top to bottom.
 *
 * @example
 * ```js
 * import { flippedVertically } from "@inglorious/renderer-2d/image/flags.js"
 *
 * const frames = { ceiling: [flippedVertically(4)] }
 * ```
 *
 * @param {number} frame - The frame's number on the sheet, counted from the top left.
 * @returns {number} The frame's number with the mirror set in it.
 */
export function flippedVertically(frame) {
  return FLIPPED_VERTICALLY_FLAG | frame | SIGNED_32_BIT
}
