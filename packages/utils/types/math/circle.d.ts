import type { Point, PointInput } from "./point"
import type { Rectangle } from "./rectangle"

/** Represents a circle with a center and radius. */
export interface Circle {
  /** The center of the circle. */
  position: Point
  /** The radius of the circle. */
  radius: number
}

/** Checks whether a circle intersects a point. */
export function intersectsPoint(circle: Circle, point: PointInput): boolean

/** Checks whether two circles intersect. */
export function intersectsCircle(circle1: Circle, circle2: Circle): boolean

/** Checks whether a circle intersects a rectangle. */
export function intersectsRectangle(
  circle: Circle,
  rectangle: Rectangle,
): boolean
