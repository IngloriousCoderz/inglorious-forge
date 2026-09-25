import type { Circle } from "./circle"
import type { Line } from "./line"
import type { Point } from "./point"

/** Represents a line segment between two points. */
export interface Segment {
  /** The starting point of the segment. */
  from: Point
  /** The ending point of the segment. */
  to: Point
}

/** Calculates the coefficients of the line containing a segment. */
export function coefficients(segment: Segment): Line

/** Finds the closest point on a segment. */
export function closestPoint(segment: Segment, point: Point): Point

/** Calculates the shortest distance from a point to a segment. */
export function distanceFromPoint(segment: Segment, point: Point): number

/** Checks whether a segment intersects a circle. */
export function intersectsCircle(segment: Segment, circle: Circle): boolean
