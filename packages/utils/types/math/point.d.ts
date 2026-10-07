import type { Vector3 } from "./vector"
import type { Circle } from "./circle"
import type { Line } from "./line"
import type { Rectangle } from "./rectangle"

/**
 * A point in the Inglorious coordinate system: `[x, y, z]`.
 *
 * The world is **y-up**: the origin sits on the floor, and a bigger `y` is
 * always a higher place in the world. Gravity subtracts from it, a jump adds to
 * it, and an object resting on the ground has `y = 0`.
 *
 * `z` is the depth axis, and it is **y-up as well** — it is not screen-down, so
 * both vertical axes grow upwards. Renderers are what turn them into screen
 * coordinates: `@inglorious/renderer-2d` projects a point to
 * `canvasY = viewportHeight - y - z`, which puts `(0, 0, 0)` at the bottom-left
 * corner of the canvas and turns both axes upside down.
 *
 * @example Reading a position in a 2D game
 * ```js
 * // Ground level, and a hundred pixels above it.
 * v(0, 0, 0) // the floor
 * v(0, 100, 0) // a hundred pixels up
 *
 * // Falling means losing height, in 2D as well as in 3D.
 * entity.velocity[1] -= GRAVITY * dt
 *
 * // Keep a body on the ground.
 * entity.position[1] = 0
 * ```
 */
export type Point = readonly [x: number, y: number, z: number]

/** Accepts a 3D point, branded vector, or object with a point position. */
export type PointInput = Point | Vector3 | { position: Point | Vector3 }

/** Calculates the distance from a point to a line. */
export function getDistanceFromLine(point: Point, line: Line): number

/** Checks whether two points occupy the same position. */
export function intersectsPoint(point1: PointInput, point2: PointInput): boolean

/** Checks whether a point intersects a circle. */
export function intersectsCircle(point: PointInput, circle: Circle): boolean

/** Checks whether a point intersects a rectangle. */
export function intersectsRectangle(
  point: PointInput,
  rectangle: Rectangle,
): boolean
