import { entityAnchor } from "@inglorious/engine/physics/anchor.js"

const DEFAULT_POSITION = 0
const ORIGIN = 0
const NO_PIXELS = 0
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
// own reasons -- a thing's colour is a number, and one of those in here would be handed
// to the canvas as a fill style, which it ignores without complaint, leaving every thing
// drawn black.
/** The tinted frames belonging to one engine's api, made on first use. */
/**
 * The tinted frames of each image, whoever asked for them.
 *
 * Keyed by the image and then by what was cut out of it and the colour it was mixed with,
 * which is all a tinted frame depends on. Two engines drawing the same frame of the same
 * picture get one copy between them rather than one each.
 */
const tintedFramesPerImage = new WeakMap()

export function renderImage(entity, ctx, api) {
  const { image, flipX = false, flipY = false, opacity = OPAQUE, tint } = entity
  const {
    id,
    src,
    x = DEFAULT_POSITION,
    y = DEFAULT_POSITION,
    imageSize,
    tileSize = imageSize,
    scale = NATIVE_SCALE,
  } = image
  const [tileWidth, tileHeight] = tileSize
  const [frameWidth = tileWidth, frameHeight = tileHeight] =
    image.frameSize ?? []
  const [drawWidth, drawHeight] = image.frameSize ?? tileSize
  const [anchorX, anchorY] = entityAnchor(entity)

  const dx = flipX ? -drawWidth : DEFAULT_POSITION
  const dy = flipY ? -drawHeight : DEFAULT_POSITION

  const sourceParams = [x, y, frameWidth, frameHeight]

  const destParams = [dx, dy, drawWidth, drawHeight]

  ctx.save()

  ctx.globalAlpha = opacity

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

  const img = images.get(id)
  if (img && isReady(img)) {
    if (tint) {
      ctx.drawImage(tinted(img, sourceParams, tint), ...destParams)
    } else {
      ctx.drawImage(img, ...sourceParams, ...destParams)
    }
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
function tinted(img, params, tint) {
  const [sx, sy, width, height] = params
  const frames = tintedFramesFor(img)
  const key = `${img.id ?? img.src}|${sx},${sy},${width},${height}|${tint}`

  if (frames.has(key)) return frames.get(key)

  const copy = document.createElement("canvas")

  copy.width = width
  copy.height = height

  const copyCtx = copy.getContext("2d")

  copyCtx.drawImage(img, sx, sy, width, height, ORIGIN, ORIGIN, width, height)

  // Mixed, not painted over. Filling the colour in with `source-in` would keep only the
  // sprite's outline and throw its pixels away, which is a recolour rather than a tint:
  // the sprite's own shading goes with it, and a white one comes out flat.
  //
  // `multiply` is the mixing, so a tint of white leaves the sprite equal to itself and a
  // tint of anything else darkens or colours it the way laying ink over it would. It also
  // fills the transparent parts of the cell, which the original never did, so the sprite
  // is drawn once more over the top to put its own outline back.
  copyCtx.globalCompositeOperation = "multiply"
  copyCtx.fillStyle = tint
  copyCtx.fillRect(ORIGIN, ORIGIN, width, height)

  copyCtx.globalCompositeOperation = "destination-in"
  copyCtx.drawImage(img, sx, sy, width, height, ORIGIN, ORIGIN, width, height)

  frames.set(key, copy)

  return copy
}

function tintedFramesFor(img) {
  if (!tintedFramesPerImage.has(img)) tintedFramesPerImage.set(img, new Map())

  return tintedFramesPerImage.get(img)
}

/** Whether an image has finished arriving, and so can be drawn from. */
function isReady(img) {
  return (
    img.complete === undefined || (img.complete && img.naturalWidth > NO_PIXELS)
  )
}
