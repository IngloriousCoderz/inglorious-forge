export type HeapComparator<T> = (a: T, b: T) => number

/**
 * Checks whether a heap contains a specific item.
 */
export function contains<T>(heap: readonly T[], item: T): boolean

/**
 * Converts an array into a heap.
 */
export function heapify<T extends number>(
  arr: readonly T[],
  comparator?: HeapComparator<T>,
): T[]

export function heapify<T>(
  arr: readonly T[],
  comparator: HeapComparator<T>,
): T[]

/**
 * Adds an item to a heap.
 */
export function push<T extends number>(
  heap: readonly T[],
  item: T,
  comparator?: HeapComparator<T>,
): T[]

export function push<T>(
  heap: readonly T[],
  item: T,
  comparator: HeapComparator<T>,
): T[]

/**
 * Returns the index of a node's left child.
 */
export function left(index: number): number

/**
 * Returns the index of a node's parent.
 */
export function parent(index: number): number

/**
 * Removes the root item from a heap.
 */
export function pop<T extends number>(
  heap: readonly T[],
  comparator?: HeapComparator<T>,
): T[]

export function pop<T>(heap: readonly T[], comparator: HeapComparator<T>): T[]

/**
 * Removes the root item and reorders the heap.
 */
export function remove<T extends number>(heap: readonly T[]): T[]

/**
 * Returns the index of a node's right child.
 */
export function right(index: number): number

/**
 * Returns a heap's root item.
 */
export function root<T>(heap: readonly T[]): T | undefined
