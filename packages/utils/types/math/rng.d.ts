/** Returns `undefined` when no values are supplied. */
export function choose(): undefined

/** Chooses a random supplied value. */
export function choose<T>(value: T, ...values: T[]): T

/** Generates a random number for the supplied bounds and step. */
export function random(): number
export function random(to: number): number
export function random(from: number, to: number): number
export function random(from: number, to: number, step: number): number

/** Generates a random value between two independent random values. */
export function randomBinomial(): number
