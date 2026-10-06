import { entityAnchor } from "@inglorious/engine/physics/anchor.js"

const DEFAULT_POSITION = 0
const WHOLE = 1
const OPAQUE = 1
const NATIVE_SCALE = 1

const NO_FLIP = 1
const FLIP = -1

// A tinted copy of a frame is made once and kept. Tinting means compositing, which means
// an offscreen canvas and a second draw, so doing it per frame for every particle on
// screen would cost more than the particle itself.
//
// The copies belong to an engine rather than to this module. Two engines on one page
// cannot get a wrong answer from sharing them -- the key decides the pixels on its own --
// but a module-level cache outlives every engine that filled it, holds canvases nothing
// will ever draw again, and hands them to whichever engine starts next. Keying on the api
// keeps each engine's to itself and lets them go when the engine does.
//
// The name is `tint` and not `color` because `color` is a field entities carry for their
// own reasons -- a brick's colour is a number, and one of those in here would be handed
// to the canvas as a fill style, which it ignores without complaint, leaving every brick
// drawn black.
const tintedFramesPerApi = new WeakMap()

/** The tinted frames belonging to one engine's api, made on first use. */
function tintedFramesFor(api) {
  if (!tintedFramesPerApi.has(api)) tintedFramesPerApi.set(api, new Map())

  return tintedFramesPerApi.get(api)
}

export function renderImage(entity, ctx, api) {
  const {
    image,
    sx = DEFAULT_POSITION,
    sy = DEFAULT_POSITION,
    flipX = false,
    flipY = false,
    opacity = OPAQUE,
    tint,
  } = entity
  const {
    id,
    src,
    imageSize,
    tileSize = imageSize,
    scale = NATIVE_SCALE,
  } = image
  // The region to take out of the sheet. A tile is the natural grid, but artwork
  // does not always come in one piece per cell: a sprite can be wider than the
  // grid it is cut from, or sit inside its cell with the background around it.
  // Without a `frameSize` the whole tile is both read and drawn, which is what
  // every sprite sheet that is cut on its grid already relies on.
  const [tileWidth, tileHeight] = tileSize
  const [frameWidth = tileWidth, frameHeight = tileHeight] =
    image.frameSize ?? []
  // The size the frame is drawn at. A cropped tile is drawn at the size of the
  // tile, not of the sheet it came out of, so this follows the tile unless a
  // partial frame gives both the region to read and the size to read it at.
  const [drawWidth, drawHeight] = image.frameSize ?? tileSize
  // The same anchor the hitbox and the gizmos are placed by, so a sprite and the
  // shape that goes with it cannot drift apart.
  const [anchorX, anchorY] = entityAnchor(entity)

  // A negative scale maps a `[from, from + size]` rectangle onto
  // `[-(from + size), -from]` around the translated origin, so drawing from
  // `-size` puts the mirrored tile back in the box the anchor picked.
  const dx = flipX ? -drawWidth : DEFAULT_POSITION
  const dy = flipY ? -drawHeight : DEFAULT_POSITION

  const imgParams = [
    sx * tileWidth,
    sy * tileHeight,
    frameWidth,
    frameHeight,
    dx,
    dy,
    drawWidth,
    drawHeight,
  ]

  ctx.save()

  ctx.globalAlpha = opacity

  // A pair scales each axis on its own, for artwork that is not the same shape as
  // the screen it has to fill. Skipped at native size, which keeps the scale calls a
  // transform list rather than a pair of no-ops.
  const [scaleX, scaleY] = Array.isArray(scale) ? scale : [scale, scale]
  if (scaleX !== NATIVE_SCALE || scaleY !== NATIVE_SCALE) {
    ctx.scale(scaleX, scaleY)
  }

  // Scaling comes first so that the anchor offset is measured in scaled units:
  // otherwise the tile is placed against its unscaled size and then scaled out from
  // under the anchor, which is how a stretched backdrop ends up hanging off the
  // bottom of the screen. The anchor counts from the bottom of the drawn box while
  // the canvas counts down from the top, so the vertical share is what is left over.
  ctx.translate(-drawWidth * anchorX, -drawHeight * (WHOLE - anchorY))

  if (flipX) {
    ctx.scale(FLIP, NO_FLIP)
  }

  if (flipY) {
    ctx.scale(NO_FLIP, FLIP)
  }

  const images = api.getType("Images")
  const img = images.get(id) || document.getElementById(id)
  if (img) {
    // An image is drawn in its own colours unless it is given one, in which case the
    // shape it is keeps whatever alpha it came with and only the colour is replaced.
    ctx.drawImage(tint ? tinted(api, img, imgParams, tint) : img, ...imgParams)
  } else if (src) {
    images.load(id, src)
  } else {
    console.warn(`Image '${id}' not found and no src provided for lazy loading`)
  }

  ctx.restore()
}

/**
 * The same frame of the same image, recoloured.
 *
 * `source-in` keeps the pixels the source already had and replaces their colour, so a
 * soft-edged sprite stays soft-edged and an empty corner stays empty -- which a fill or
 * a multiply would not do.
 */
function tinted(api, img, params, tint) {
  const [sx, sy, width, height] = params
  const frames = tintedFramesFor(api)
  const key = `${img.id ?? img.src}|${sx},${sy},${width},${height}|${tint}`

  if (frames.has(key)) return frames.get(key)

  const copy = document.createElement("canvas")

  copy.width = width
  copy.height = height

  const copyCtx = copy.getContext("2d")

  copyCtx.drawImage(img, sx, sy, width, height, 0, 0, width, height)
  copyCtx.globalCompositeOperation = "source-in"
  copyCtx.fillStyle = tint
  copyCtx.fillRect(0, 0, width, height)

  frames.set(key, copy)

  return copy
}
