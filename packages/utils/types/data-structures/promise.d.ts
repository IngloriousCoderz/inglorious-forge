/**
 * Yields the results of some promises in the order they settle, not the order
 * given. The first rejection is thrown, and the promises still pending never
 * end up as unhandled rejections.
 *
 * @param promises - The promises to wait for. Plain values count as already fulfilled.
 * @returns The fulfilled values, fastest first.
 */
export function asSettled<T>(
  promises: Iterable<T | PromiseLike<T>>,
): AsyncGenerator<Awaited<T>>
