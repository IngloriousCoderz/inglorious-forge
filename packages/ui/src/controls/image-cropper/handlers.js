/**
 * @typedef {import('../../../types/controls/image-cropper.js').ImageCropperProps} ImageCropperEntity
 * @typedef {import('../../../types/controls/image-cropper.js').CropRect} CropRect
 */

import {
  clampRect,
  DEFAULT_MIN_SIZE,
  DEFAULT_STEP,
  fitRect,
  FULL_RECT,
  matchesAspect,
  normalizeAspect,
} from "./helpers.js"

/**
 * Initialize missing image cropper state defaults.
 * The persistent state is `rect`, the frame in image fractions, plus the
 * image's natural size once it has loaded. Everything else is configuration.
 * @param {ImageCropperEntity} entity
 */
export function create(entity) {
  entity.rect ??= { ...FULL_RECT }
  entity.naturalWidth ??= 0
  entity.naturalHeight ??= 0
  entity.hasError ??= false

  entity.src ??= ""
  entity.alt ??= ""
  entity.label ??= ""
  entity.aspectRatio ??= null
  entity.minSize ??= DEFAULT_MIN_SIZE
  entity.step ??= DEFAULT_STEP
  entity.isDisabled ??= false
}

/**
 * The image failed to load: there is nothing to crop.
 * @param {ImageCropperEntity} entity
 */
export function imageError(entity) {
  entity.naturalWidth = 0
  entity.naturalHeight = 0
  entity.hasError = true
}

/**
 * The image loaded: record its size, which is what turns `aspectRatio` into a
 * frame shape. A frame that already has that shape is kept, so a previous crop
 * can be restored; any other is replaced by the largest centred one.
 * @param {ImageCropperEntity} entity
 * @param {{ width: number, height: number }} size
 */
export function imageLoad(entity, { width, height } = {}) {
  if (!width || !height) {
    imageError(entity)
    return
  }

  entity.naturalWidth = width
  entity.naturalHeight = height
  entity.hasError = false

  const aspect = normalizeAspect(entity.aspectRatio, width, height)
  const rect = entity.rect ?? FULL_RECT
  entity.rect =
    aspect && !matchesAspect(rect, aspect)
      ? fitRect(aspect)
      : clampRect(rect, { minSize: entity.minSize, aspect })
}

/**
 * Move or resize the frame. The rect is clamped to the image, the minimum size
 * and, once the image has loaded, the aspect ratio.
 * @param {ImageCropperEntity} entity
 * @param {CropRect} rect
 */
export function rectChange(entity, rect) {
  if (entity.isDisabled || !rect) return

  const aspect = normalizeAspect(
    entity.aspectRatio,
    entity.naturalWidth,
    entity.naturalHeight,
  )
  entity.rect = clampRect(rect, { minSize: entity.minSize, aspect })
}

/**
 * Show a different image. Its size is unknown until it loads, so the frame
 * starts over on the whole image unless a rect is passed along with it.
 * @param {ImageCropperEntity} entity
 * @param {string | { src: string, rect?: CropRect }} payload
 */
export function srcChange(entity, payload) {
  const { src = "", rect } =
    typeof payload === "string" ? { src: payload } : (payload ?? {})

  entity.rect = rect ? { ...rect } : { ...FULL_RECT }

  // The same src never fires another load, so the size it has still holds and
  // the frame is fitted to it right away.
  if (src === entity.src && entity.naturalWidth) {
    imageLoad(entity, {
      width: entity.naturalWidth,
      height: entity.naturalHeight,
    })
    return
  }

  entity.src = src
  entity.naturalWidth = 0
  entity.naturalHeight = 0
  entity.hasError = false
}
