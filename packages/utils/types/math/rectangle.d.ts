import type { Circle } from "./circle"
import type { Point, PointInput } from "./point"

/** Represents the dimensions of a 3D object. */
export type Size = readonly [width: number, height: number, depth: number]

/** Represents an axis-aligned rectangle. */
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
