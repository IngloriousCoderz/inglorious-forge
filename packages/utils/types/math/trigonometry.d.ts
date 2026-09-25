/** Calculates the arctangent of a quotient in radians. */
export function atan2(y: number, x: number): number

/** Calculates the cosine of an angle in radians. */
export function cos(angle: number): number

/** Alias for `cos`. */
export const cosine: typeof cos

/** Returns pi. */
export function pi(): number

/** Calculates the sine of an angle in radians. */
export function sin(angle: number): number

/** Alias for `sin`. */
export const sine: typeof sin

/** Converts radians to degrees. */
export function toDegrees(radians: number): number

/** Converts degrees to radians. */
export function toRadians(degrees: number): number

/** Normalizes an angle to the range [-π, π]. */
export function toRange(angle: number): number
