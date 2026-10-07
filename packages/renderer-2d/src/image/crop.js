/**
 * Points an entity at one frame of a sprite sheet.
 *
 * The renderer takes the crop in two places, which is a sharp edge: `sx`/`sy` come off
 * the entity while the grid and the region to read come off its image. Every sprite
 * otherwise has to remember that split and write it out by hand, so this does it once.
 *
 * The frame is the pixel position on the sheet and the size to take from it; the grid is
 * how the sheet is divided. `sx`/`sy` are tile indices on that grid, so a frame given in
 * pixels is divided down here.
 *
 * @example
 * ```js
 * const types = {
 *   Sprite: [
 *     { render: renderImage },
 *     {
 *       create(entity) {
 *         crop(entity, "sheet", { x: 96, y: 48, width: 8, height: 8 })
 *       },
 *     },
 *   ],
 * }
 *
 * const entities = {
 *   sprite: { type: "Sprite", image: { id: "sheet" } },
 * }
 * ```
 *
 * @param {object} entity - The entity to point at the frame. Mutated.
 * @param {string} id - The id of the image to crop from.
 * @param {object} frame - Where the frame is on the sheet and how big it is.
 * @param {number} [frame.x] - The frame's left edge, in pixels.
 * @param {number} [frame.y] - The frame's top edge, in pixels.
 * @param {number} [frame.width] - How much to read across.
 * @param {number} [frame.height] - How much to read down.
 * @param {number[]} [frame.tileSize] - How the sheet is divided, `[width, height]`.
 * @returns {object} The entity, so this can be used inline.
 */
const X = 0
const Y = 1

// A frame with no position given is the top left of the sheet.
const TOP_LEFT = 0

export function crop(entity, id, frame = {}) {
  const {
    x = TOP_LEFT,
    y = TOP_LEFT,
    width = entity.size?.[X],
    height = entity.size?.[Y],
    tileSize = [width, height],
  } = frame

  const [tileWidth, tileHeight] = tileSize

  // Whatever else the entity's image already carries, a scale for instance, is kept:
  // cropping says where to look, not what to do with what is found there.
  entity.image = {
    ...entity.image,
    ...(id ? { id } : {}),
    imageSize: [width, height],
    tileSize,
    // The frame is wider than a cell often enough that reading one whole tile is not
    // enough, and inset inside one is not either, so the region read is its own size.
    frameSize: [width, height],
  }

  entity.sx = tileWidth ? x / tileWidth : TOP_LEFT
  entity.sy = tileHeight ? y / tileHeight : TOP_LEFT

  return entity
}
