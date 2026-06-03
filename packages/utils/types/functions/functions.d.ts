type AnyFunction = (...args: any[]) => any

export type DebouncedFunction<T extends AnyFunction> = ((
  ...args: Parameters<T>
) => ReturnType<T> | undefined) & {
  cancel: () => void
  flush: () => ReturnType<T> | undefined
  pending: () => boolean
}

export type ThrottledFunction<T extends AnyFunction> = ((
  ...args: Parameters<T>
) => ReturnType<T> | undefined) & {
  cancel: () => void
  pending: () => boolean
}

/**
 * Composes multiple functions from right to left.
 */
export function compose<TArgs extends any[], TResult>(
  ...fns: [(...args: TArgs) => any, ...Array<(value: any) => any>]
): (...args: TArgs) => TResult

export function compose(): <T>(value: T) => T

/**
 * Creates a debounced function that delays invoking `fn` until after `wait`
 * milliseconds have elapsed since the last call.
 */
export function debounce<T extends AnyFunction>(
  fn: T,
  wait?: number,
): DebouncedFunction<T>

/**
 * Pipes multiple functions from left to right.
 */
export function pipe<TArgs extends any[], TResult>(
  ...fns: [(...args: TArgs) => any, ...Array<(value: any) => any>]
): (...args: TArgs) => TResult

export function pipe(): <T>(value: T) => T

/**
 * Creates a throttled function that invokes `fn` immediately, then ignores
 * calls until `wait` milliseconds have elapsed.
 */
export function throttle<T extends AnyFunction>(
  fn: T,
  wait?: number,
): ThrottledFunction<T>
