/** Calculates the arithmetic mean of the supplied numbers. */
export function mean(...numbers: number[]): number

/** Alias for `mean`. */
export const average: typeof mean

/** Calculates the median of the supplied numbers. */
export function median(...numbers: number[]): number

/** Finds the most frequent supplied value. */
export function mode(...values: unknown[]): string | undefined
