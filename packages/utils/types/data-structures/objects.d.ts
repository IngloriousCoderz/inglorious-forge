export type Merger = (targetValue: unknown, sourceValue: unknown) => unknown

export type ObjectSource = object | null | undefined

export type MergeObject<T extends object, S extends object> = Omit<T, keyof S> &
  S

export type MergeSources<
  T extends object,
  Sources extends readonly unknown[],
> = Sources extends readonly [
  infer Source,
  ...infer Rest extends readonly unknown[],
]
  ? Source extends object
    ? MergeSources<MergeObject<T, Source>, Rest>
    : MergeSources<T, Rest>
  : T

export type DefaultsResult<T extends object, D extends object> = Omit<
  T,
  keyof D
> & {
  [K in keyof D]: K extends keyof T
    ? Exclude<T[K], null | undefined> | D[K]
    : D[K]
}

/**
 * Creates a new object by deeply merging source objects into a target.
 */
export function extend<
  T extends object,
  Sources extends readonly ObjectSource[],
>(target: T, ...sources: Sources): MergeSources<T, Sources>

/**
 * Merges source objects into a target in place.
 */
export function merge<
  T extends object,
  Sources extends readonly ObjectSource[],
>(target: T, ...sources: Sources): MergeSources<T, Sources>

/**
 * Creates a new deeply merged object using a custom merger.
 */
export function extendWith<
  T extends object,
  Sources extends readonly ObjectSource[],
>(
  merger: null | undefined,
  target: T,
  ...sources: Sources
): MergeSources<T, Sources>

export function extendWith<
  T extends object,
  Sources extends readonly ObjectSource[],
>(merger: Merger, target: T, ...sources: Sources): Record<string, unknown>

export function extendWith<
  T extends object,
  Sources extends readonly ObjectSource[],
>(
  merger: Merger | null | undefined,
  target: T,
  ...sources: Sources
): Record<string, unknown>

/**
 * Deeply merges into a target in place using a custom merger.
 */
export function mergeWith<
  T extends object,
  Sources extends readonly ObjectSource[],
>(
  merger: null | undefined,
  target: T,
  ...sources: Sources
): MergeSources<T, Sources>

export function mergeWith<
  T extends object,
  Sources extends readonly ObjectSource[],
>(merger: Merger, target: T, ...sources: Sources): Record<string, unknown>

export function mergeWith<
  T extends object,
  Sources extends readonly ObjectSource[],
>(
  merger: Merger | null | undefined,
  target: T,
  ...sources: Sources
): Record<string, unknown>

/**
 * Assigns default properties to a target in place.
 */
export function defaults<T extends object, D extends object>(
  target: T,
  defaultProps: D,
): DefaultsResult<T, D>
