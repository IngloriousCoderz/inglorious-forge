import { crop } from "./crop.js"

const X = 0
const Y = 1
const WHOLE_SHEET = 0
const ONE_TILE_ACROSS = 1

/**
 * Where a sprite sheet is cut, so that a frame can be named by its number.
 *
 * A sheet is divided into rows and columns of tiles, and the tiles are read in order down
 * the sheet rather than along it: the seventh tile of a sheet six across is the first
 * tile of its second row. That ordering is the one the sprite behaviour and the tilemap
 * renderer already work in, so naming a tile by its number agrees with them.
 *
 * A sheet's width in tiles is not always the same as the width of one of its tiles, and
 * it cannot be worked out from the tile alone, so it is given here.
 *
 * @example
 * ```js
 * import { cropQuad } from "@inglorious/renderer-2d/image/crop-quad.js"
 *
 * const types = {
 *   Thing: [
 *     { render: renderImage },
 *     {
 *       create(entity) {
 *         // The twelfth tile of a sheet cut into 32x16 tiles, six across.
 *         cropQuad(entity, "the game", 11, { tileSize: [32, 16], tilesAcross: 6 })
 *       },
 *     },
 *   ],
 * }
 *
 * const entities = {
 *   thing: { type: "Thing", size: v(32, 16, 0) },
 * }
 * ```
 *
 * @param {object} entity - The entity to point at the tile. Mutated.
 * @param {string} id - The id of the image to crop from.
 * @param {number} quad - The tile's number, counted from the top left of the sheet.
 * @param {object} [frame] - How the sheet is divided.
 * @param {number[]} [frame.tileSize] - One tile, `[width, height]`.
 * @param {number} [frame.tilesAcross] - How many tiles the sheet is wide. Defaults to
 *   the sheet's own width in pixels over the tile's, which is right for a sheet of whole
 *   tiles.
 * @returns {object} The entity, so this can be used inline.
 */
export function cropQuad(entity, id, quad, { tileSize, tilesAcross } = {}) {
  const [width, height] = tileSize ?? [entity.size?.[X], entity.size?.[Y]]
  const [tileWidth, tileHeight] = tileSize ?? [width, height]

  // A sheet is as wide as its tiles allow unless it is padded, and a padded one has to
  // say how many tiles it holds across.
  const across =
    tilesAcross ??
    (tileWidth
      ? (entity.image?.imageSize?.[X] ?? WHOLE_SHEET) / tileWidth
      : ONE_TILE_ACROSS)

  return crop(entity, id, {
    x: (quad % across) * tileWidth,
    y: Math.floor(quad / across) * tileHeight,
    width,
    height,
    tileSize: [tileWidth, tileHeight],
  })
}
