/**
 * Yields the results of some promises in the order they settle, not the order given,
 * so each can be used as soon as it is ready.
 *
 * The first rejection is thrown. Every promise is settled first, so the ones still
 * pending never end up as unhandled rejections, even when several fail or the caller
 * stops iterating early.
 *
 * @template T
 * @param {Iterable<T | PromiseLike<T>>} promises - The promises to wait for. Plain values count as already fulfilled.
 * @returns {AsyncGenerator<T>} The fulfilled values, fastest first.
 */
export async function* asSettled(promises) {
  const pending = new Map(
    Array.from(promises, (promise, index) => [
      index,
      Promise.resolve(promise).then(
        (value) => ({ index, isFulfilled: true, value }),
        (reason) => ({ index, isFulfilled: false, reason }),
      ),
    ]),
  )

  while (pending.size) {
    const { index, isFulfilled, value, reason } = await Promise.race(
      pending.values(),
    )
    pending.delete(index)
    if (!isFulfilled) {
      throw reason
    }
    yield value
  }
}
