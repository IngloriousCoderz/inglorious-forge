import type { Circle } from "./circle"
import type { Point } from "./point"

/** Represents a 2D line as `ax + bz + c = 0`. */
export type Line = readonly [a: number, b: number, c: number]

/** Calculates the shortest distance from a point to a line. */
export function distanceFromPoint(line: Line, point: Point): number

/** Checks whether a line intersects a circle. */
export function intersectsCircle(line: Line, circle: Circle): boolean
