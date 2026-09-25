export type Comparator<T> = (left: T, right: T) => number

/**
 * Checks whether an array contains a specific item.
 */
export function contains<T>(arr: readonly T[], item: T): boolean

/**
 * Ensures that a value is an array.
 */
export function ensureArray<T>(value: T): T extends readonly unknown[] ? T : T[]

/**
 * Checks whether a value is an array.
 */
export function isArray(value: unknown): value is readonly unknown[]

/**
 * Finds the maximum item in an array using a comparator.
 */
export function max<T extends number>(
  arr: readonly T[],
  comparator?: Comparator<T>,
): T

export function max<T>(arr: readonly T[], comparator: Comparator<T>): T

/**
 * Finds the minimum item in an array using a comparator.
 */
export function min<T extends number>(
  arr: readonly T[],
  comparator?: Comparator<T>,
): T

export function min<T>(arr: readonly T[], comparator: Comparator<T>): T

/**
 * Removes the smallest item from an array using a comparator.
 */
export function pop<T extends number>(
  arr: readonly T[],
  comparator?: Comparator<T>,
): T[]

export function pop<T>(arr: readonly T[], comparator: Comparator<T>): T[]

/**
 * Adds an item to an array immutably.
 */
export function push<T, U>(arr: readonly T[], item: U): Array<T | U>

/**
 * Removes an item from an array immutably.
 */
export function remove<T>(arr: readonly T[], item: T): T[]
