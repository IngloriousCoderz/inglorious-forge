/**
 * @typedef {import('../../../types/controls/image-cropper.js').CropRect} CropRect
 * @typedef {import('../../../types/controls/image-cropper.js').CropImageOptions} CropImageOptions
 */

import { clampRect, fitRect, normalizeAspect } from "./helpers.js"

const DEFAULT_QUALITY = 0.9
const DEFAULT_TYPE = "image/jpeg"
const OPAQUE_TYPES = ["image/jpeg"]

/**
 * Crop an image file to a rect and encode the result, all in the browser.
 * Without a rect it takes the largest centred one at `aspectRatio`, or the
 * whole image. The output is capped at `maxWidth` x `maxHeight` and never
 * upscaled. Re-encoding also drops the camera metadata of the original.
 * @param {Blob} file
 * @param {CropRect | null} [rect] In image fractions, as the cropper reports it.
 * @param {CropImageOptions} [options]
 * @returns {Promise<Blob>}
 */
export async function cropImage(file, rect, options = {}) {
  const {
    aspectRatio = null,
    maxWidth = Infinity,
    maxHeight = Infinity,
    type = DEFAULT_TYPE,
    quality = DEFAULT_QUALITY,
    background = "white",
  } = options

  const source = await decodeImage(file)
  try {
    const { width, height } = sizeOf(source)
    const aspect = normalizeAspect(aspectRatio, width, height)
    const crop = rect
      ? clampRect(rect, { minSize: 0, aspect })
      : fitRect(aspect)
    const sw = crop.w * width
    const sh = crop.h * height
    const scale = Math.min(1, maxWidth / sw, maxHeight / sh)
    const output = {
      width: Math.max(1, Math.round(sw * scale)),
      height: Math.max(1, Math.round(sh * scale)),
    }

    const canvas = document.createElement("canvas")
    canvas.width = output.width
    canvas.height = output.height
    const context = canvas.getContext("2d")
    if (!context) throw new Error("Canvas is unavailable")

    if (OPAQUE_TYPES.includes(type) && background) {
      context.fillStyle = background
      context.fillRect(0, 0, output.width, output.height)
    }
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = "high"
    context.drawImage(
      source,
      crop.x * width,
      crop.y * height,
      sw,
      sh,
      0,
      0,
      output.width,
      output.height,
    )
    return await toBlob(canvas, type, quality)
  } finally {
    source.close?.()
  }
}

/**
 * Decode an image file once, honouring its EXIF orientation where the browser
 * can. Falls back to an <img> element when `createImageBitmap` is missing or
 * rejects the file.
 * @param {Blob} file
 * @returns {Promise<ImageBitmap | HTMLImageElement>}
 */
export async function decodeImage(file) {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" })
    } catch {
      try {
        return await createImageBitmap(file)
      } catch {
        // Fall through to the element decoder.
      }
    }
  }
  return decodeWithElement(file)
}

/**
 * @param {Blob} file
 * @returns {Promise<HTMLImageElement>}
 */
function decodeWithElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Could not read image"))
    }
    image.src = url
  })
}

/**
 * @param {ImageBitmap | HTMLImageElement} source
 * @returns {{ width: number, height: number }}
 */
function sizeOf(source) {
  return {
    width: source.naturalWidth ?? source.width,
    height: source.naturalHeight ?? source.height,
  }
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {string} type
 * @param {number} quality
 * @returns {Promise<Blob>}
 */
function toBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Could not encode image")),
      type,
      quality,
    )
  })
}
