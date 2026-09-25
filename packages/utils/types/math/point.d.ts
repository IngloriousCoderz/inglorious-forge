import type { Vector3 } from "./vector"
import type { Circle } from "./circle"
import type { Line } from "./line"
import type { Rectangle } from "./rectangle"

/** Represents a point in 3D space. */
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
