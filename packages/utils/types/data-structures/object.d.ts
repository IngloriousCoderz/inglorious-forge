import type { Vector } from "../math/vectors"

export type ObjectValue<T> = T extends object ? T[keyof T] : never

export type PathKey<T, Key extends string> = T extends object
  ? Key extends keyof T
    ? Key
    : Key extends `${infer Index extends number}`
      ? Index extends keyof T
        ? Index
        : never
      : never
  : never

export type PathValue<T, Path extends string> = T extends object
  ? Path extends `${infer Key}.${infer Rest}`
    ? PathKey<T, Key> extends never
      ? unknown
      : PathValue<T[PathKey<T, Key>], Rest>
    : PathKey<T, Path> extends never
      ? unknown
      : T[PathKey<T, Path>]
  : unknown

export type DeserializedValue =
  | null
  | boolean
  | number
  | string
  | Vector
  | DeserializedValue[]
  | { [key: string]: DeserializedValue }

export type Recipe<T, Args extends unknown[] = []> = (
  draft: T,
  ...args: Args
) => T | void

export type ToStringResult<T> = T extends Function
  ? T
  : T extends string | readonly unknown[] | object
    ? string
    : T

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
 * Creates a deep clone of a value.
 */
export function clone<T>(obj: T): T

/**
 * Assigns default properties to a target in place.
 */
export function defaults<T extends object, D extends object>(
  target: T,
  defaultProps: D,
): DefaultsResult<T, D>

/**
 * Deserializes a value, restoring vector representations.
 */
export function deserialize(str: string): DeserializedValue

/**
 * Creates a new object by deeply merging source objects into a target.
 */
export function extend<
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
 * Filters the properties of an object using a callback.
 */
export function filter<T extends object>(
  obj: T,
  callback: (key: string, value: ObjectValue<T>, index: number) => boolean,
): Partial<T>

/**
 * Finds the first property of an object that matches a callback.
 */
export function find<T extends object>(
  obj: T,
  callback: (key: string, value: ObjectValue<T>, index: number) => boolean,
): Partial<T>

/**
 * Gets the value at a path in an object.
 */
export function get<T, Path extends string | null | undefined, D>(
  obj: T,
  path: Path,
  defaultValue: D,
): Path extends null | undefined ? D : PathValue<T, Extract<Path, string>> | D

export function get<T, Path extends string | null | undefined = string>(
  obj: T,
  path: Path,
): Path extends null | undefined
  ? undefined
  : PathValue<T, Extract<Path, string>> | undefined

/**
 * Checks whether a value is a plain object.
 */
export function isObject(value: unknown): value is Record<string, unknown>

/**
 * Maps the properties of an object using a callback.
 */
export function map<T extends object, R>(
  obj: T,
  callback: (key: string, value: ObjectValue<T>, obj: T) => R,
): Record<string, R>

/**
 * Merges source objects into a target in place.
 */
export function merge<
  T extends object,
  Sources extends readonly ObjectSource[],
>(target: T, ...sources: Sources): MergeSources<T, Sources>

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
 * Creates the next immutable state using a recipe.
 */
export function produce<T, Args extends unknown[] = []>(
  recipe: Recipe<T, Args>,
): (state: T, ...args: Args) => T

export function produce<T, Args extends unknown[] = []>(
  baseState: T,
  recipe: Recipe<T, Args>,
  ...args: Args
): T

/**
 * Serializes a value, converting vectors to plain objects.
 */
export function serialize(obj: unknown): string | undefined

/**
 * Sets the value at a path in an object and returns the object.
 */
export function set<T extends object>(
  obj: T,
  path: string | null | undefined,
  value: unknown,
): T

/**
 * Converts an object or array to a formatted string representation.
 */
export function toString<T>(
  obj: T,
  indentationLevel?: number,
): ToStringResult<T>
