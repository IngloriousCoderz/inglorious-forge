/**
 * Wraps the store with each middleware. A middleware takes the store and returns it,
 * changed or wrapped: one that only looks at events replaces `dispatch` with a function
 * that calls the previous one, and returns its result. The first middleware wraps all
 * the others, so events pass through them in the order they are listed.
 *
 * @param {Object} store - The store to wrap.
 * @param {Function[]} middlewares - The middlewares, each taking the store and returning it.
 * @returns {Object} The wrapped store.
 */
export function applyMiddlewares(store, middlewares) {
  return middlewares.reduceRight(
    (wrapped, middleware) => middleware(wrapped),
    store,
  )
}
