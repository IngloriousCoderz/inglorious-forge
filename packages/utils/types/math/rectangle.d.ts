import type { Circle } from "./circle"
import type { Point, PointInput } from "./point"

/**
 * The dimensions of a 3D object, as `[width, height, depth]`.
 *
 * `width` is the extent along `x`, `height` the extent along `y` and `depth` the
 * extent along `z`. `height` and `depth` are **independent axes**, not halves of
 * one screen dimension, so in a 2D game that plays on the `xy` plane a size reads
 * as `v(w, h, 0)` — and an entity whose body is placed on the `xz` plane instead
 * reads as `v(w, 0, h)`.
 *
 * When a renderer has to flatten both vertical axes onto the screen, it adds
 * them: `@inglorious/renderer-2d` draws a rectangle `height + depth` tall. A
 * collision shape never does — `intersectsRectangle` tests the two axes
 * separately, which is why a body cannot collide with something that is merely
 * "near it" on the other axis.
 */
export type Size = readonly [width: number, height: number, depth: number]

/**
 * Represents an axis-aligned rectangle.
 *
 * `position` is the point the box hangs off and `size` is its extent, so with
 * the default centred anchor the position is the middle of the box. Set an
 * `anchor` to describe the box by a different point, such as `[0, 1]` for its
 * bottom-left corner.
 */
export interface Rectangle {
  /** The center of the rectangle. */
  position: Point
  /** The dimensions of the rectangle. */
  size: Size
}

/** Represents a rectangular platform. */
export interface Platform {
  /** The center of the platform. */
  position: Point
  /** The dimensions of the platform. */
  size: Size
}

/** Checks whether a rectangle intersects a point. */
export function intersectsPoint(
  rectangle: Rectangle,
  point: PointInput,
): boolean

/** Checks whether a rectangle intersects a circle. */
export function intersectsCircle(rectangle: Rectangle, circle: Circle): boolean

/** Checks whether two rectangles intersect. */
export function intersectsRectangle(
  rectangle1: Rectangle,
  rectangle2: Rectangle,
): boolean
