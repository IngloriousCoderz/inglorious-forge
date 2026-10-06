/**
 * A frame of a sprite sheet can be mirrored as well as picked, and a mirrored frame is
 * written as the frame's own number with a flag set in the top bit rather than as a
 * number of its own. Both renderers read that flag back out, and an author writing frames
 * would otherwise have to write the flag themselves.
 *
 * These live here so that the two renderers that read them and the frame lists that write
 * them agree on one set of numbers.
 */

// The bit that says a frame is mirrored. The ones below it are free for frame numbers,
// which is what lets a frame and its mirror be one number rather than two.
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
// Coercing to a signed 32 bit integer, which is what the bitwise operators work in.
const SIGNED_32_BIT = 0

export function flippedHorizontally(frame) {
  // The coercion says what a sum already means: ORing in the flag gives a number too
  // large for 32 bits, and every reader takes these apart with the bitwise operators,
  // which would truncate it to something different on the way past anyway.
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
  // The coercion says the same thing here as it does above: the flag leaves the frame's
  // number outside the 32 bits the readers work in.
  return FLIPPED_VERTICALLY_FLAG | frame | SIGNED_32_BIT
}
