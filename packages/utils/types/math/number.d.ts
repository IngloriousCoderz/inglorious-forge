/** Returns the absolute value of a number. */
export function abs(num: number): number

/** Clamps a number to an inclusive range. */
export function clamp(num: number, min: number, max: number): number

/** Checks whether a number is within an inclusive range. */
export function isBetween(num: number, min: number, max: number): boolean

/** Checks whether two numbers are within a tolerance. */
export function isClose(num1: number, num2: number, tolerance?: number): boolean

/** Computes a positive modulus, returning the dividend for a zero divisor. */
export function mod(dividend: number, divisor: number): number

/** Snaps a number to the nearest multiple of a precision. */
export function snap(num: number, precision?: number): number

/** Alias for `mod`. */
export const remainder: typeof mod

/** Returns the sign of a number. */
export function sign(num: number): number

/** Computes the square root of a number. */
export function sqrt(num: number): number
