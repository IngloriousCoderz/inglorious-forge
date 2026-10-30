/**
 * @typedef {import('../../../types/controls/image-cropper.js').CropRect} CropRect
 * @typedef {{ minSize?: number, aspect?: number | null }} RectOptions
 */

import { clamp } from "@inglorious/utils/math/number.js"

export const DEFAULT_MIN_SIZE = 0.1
export const DEFAULT_STEP = 0.02
export const FULL_RECT = { x: 0, y: 0, w: 1, h: 1 }
export const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"]
export const PERCENT = 100

const ASPECT_TOLERANCE = 0.01
const HALF = 0.5

/**
 * Keep a rect inside the image, at least `minSize` on each side and, when an
 * aspect is given, at that width/height ratio (in image fractions).
 * @param {CropRect} rect
 * @param {RectOptions} [options]
 * @returns {CropRect}
 */
export function clampRect(rect, { minSize = DEFAULT_MIN_SIZE, aspect } = {}) {
  let { w, h } = rect
  if (aspect) {
    h = clamp(h, Math.max(minSize, minSize / aspect), Math.min(1, 1 / aspect))
    w = h * aspect
  } else {
    w = clamp(w, minSize, 1)
    h = clamp(h, minSize, 1)
  }
  return {
    x: clamp(rect.x, 0, 1 - w),
    y: clamp(rect.y, 0, 1 - h),
    w,
    h,
  }
}

/**
 * The largest centred rect at the given aspect, or the whole image without one.
 * @param {number | null} [aspect]
 * @returns {CropRect}
 */
export function fitRect(aspect) {
  if (!aspect) return { ...FULL_RECT }
  const w = Math.min(1, aspect)
  const h = w / aspect
  return { x: (1 - w) * HALF, y: (1 - h) * HALF, w, h }
}

/**
 * Which handle, if any, sits under a point; "move" inside the rect.
 * @param {{ x: number, y: number }} point In image fractions.
 * @param {CropRect} rect
 * @param {{ x: number, y: number }} tolerance Hit distance, in image fractions.
 * @returns {string | null}
 */
export function hitTest(point, rect, tolerance) {
  const right = rect.x + rect.w
  const bottom = rect.y + rect.h
  const nearLeft = Math.abs(point.x - rect.x) <= tolerance.x
  const nearRight = Math.abs(point.x - right) <= tolerance.x
  const nearTop = Math.abs(point.y - rect.y) <= tolerance.y
  const nearBottom = Math.abs(point.y - bottom) <= tolerance.y
  const withinX =
    point.x >= rect.x - tolerance.x && point.x <= right + tolerance.x
  const withinY =
    point.y >= rect.y - tolerance.y && point.y <= bottom + tolerance.y

  if (!withinX || !withinY) return null
  const vertical = (nearTop && "n") || (nearBottom && "s") || ""
  const horizontal = (nearLeft && "w") || (nearRight && "e") || ""
  return vertical + horizontal || "move"
}

/**
 * Whether a rect already has the given aspect (in image fractions).
 * @param {CropRect} rect
 * @param {number} aspect
 * @returns {boolean}
 */
export function matchesAspect(rect, aspect) {
  return Math.abs(rect.w / rect.h / aspect - 1) <= ASPECT_TOLERANCE
}

/**
 * Turn an output aspect ratio (width/height in pixels) into one in image
 * fractions, which is what every other helper works with.
 * @param {number | null | undefined} aspectRatio
 * @param {number} width The image's natural width.
 * @param {number} height The image's natural height.
 * @returns {number | null}
 */
export function normalizeAspect(aspectRatio, width, height) {
  if (!aspectRatio || !width || !height) return null
  return (aspectRatio * height) / width
}

/**
 * Move a rect without changing its size.
 * @param {CropRect} rect
 * @param {number} dx
 * @param {number} dy
 * @param {RectOptions} [options]
 * @returns {CropRect}
 */
export function panRect(rect, dx, dy, options) {
  return clampRect({ ...rect, x: rect.x + dx, y: rect.y + dy }, options)
}

/**
 * Drag one edge or corner; the opposite one stays put. With an aspect, an edge
 * keeps the rect centred on the other axis and a corner follows whichever axis
 * moved further.
 * @param {CropRect} start The rect when the drag began.
 * @param {string} handle One of HANDLES.
 * @param {number} dx Pointer travel since the drag began, in image fractions.
 * @param {number} dy
 * @param {RectOptions} [options]
 * @returns {CropRect}
 */
export function resizeRect(start, handle, dx, dy, options = {}) {
  const { minSize = DEFAULT_MIN_SIZE, aspect } = options
  const east = handle.includes("e")
  const west = handle.includes("w")
  const south = handle.includes("s")
  const north = handle.includes("n")
  const right = start.x + start.w
  const bottom = start.y + start.h

  if (!aspect) {
    const x = west ? clamp(start.x + dx, 0, right - minSize) : start.x
    const y = north ? clamp(start.y + dy, 0, bottom - minSize) : start.y
    const w = east ? clamp(start.w + dx, minSize, 1 - start.x) : right - x
    const h = south ? clamp(start.h + dy, minSize, 1 - start.y) : bottom - y
    return clampRect({ x, y, w, h }, options)
  }

  const centerX = start.x + start.w * HALF
  const centerY = start.y + start.h * HALF
  const widthFromX = east ? start.w + dx : west ? start.w - dx : null
  const heightFromY = south ? start.h + dy : north ? start.h - dy : null
  const widthFromY = heightFromY == null ? null : heightFromY * aspect
  const followsX =
    widthFromY == null ||
    (widthFromX != null && Math.abs(dx) >= Math.abs(dy * aspect))

  const maxWidth = east
    ? 1 - start.x
    : west
      ? right
      : 2 * Math.min(centerX, 1 - centerX)
  const maxHeight = south
    ? 1 - start.y
    : north
      ? bottom
      : 2 * Math.min(centerY, 1 - centerY)
  const w = clamp(
    followsX ? widthFromX : widthFromY,
    Math.max(minSize, minSize * aspect),
    Math.min(maxWidth, maxHeight * aspect),
  )
  const h = w / aspect

  return {
    x: east ? start.x : west ? right - w : centerX - w * HALF,
    y: south ? start.y : north ? bottom - h : centerY - h * HALF,
    w,
    h,
  }
}

/**
 * Grow or shrink a rect around its centre.
 * @param {CropRect} rect
 * @param {number} factor Above 1 grows, below 1 shrinks.
 * @param {RectOptions} [options]
 * @returns {CropRect}
 */
export function scaleRect(rect, factor, options) {
  const w = rect.w * factor
  const h = rect.h * factor
  return clampRect(
    {
      x: rect.x + (rect.w - w) * HALF,
      y: rect.y + (rect.h - h) * HALF,
      w,
      h,
    },
    options,
  )
}
