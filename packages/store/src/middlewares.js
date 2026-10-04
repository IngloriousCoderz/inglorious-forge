import { compose } from "@inglorious/utils/functions"

/**
 * Applies a list of middleware functions to a store's dispatch method.
 * @param {...Function} middlewares The middleware functions to apply.
 * @returns {Function} A store enhancer function.
 */
export function applyMiddlewares(...middlewares) {
  return (store) => {
    let dispatch = () => {
      throw new Error(
        "Dispatching while constructing your middleware is not allowed.",
      )
    }

    // Enhanced store interface that middlewares receive
    const middlewareStore = {
      ...store,
      dispatch: (...args) => dispatch(...args),
      notify: (type, payload) => dispatch({ type, payload }),
    }

    // Create middleware chain - each middleware gets the store and can access baseApi
    const chain = middlewares.map((middleware) => middleware(middlewareStore))

    // Compose the middleware chain to create enhanced dispatch
    dispatch = compose(...chain)(store.dispatch)

    // Return enhanced API that external code will use
    return {
      ...middlewareStore,
      // Override dispatch/notify with the middleware-enhanced versions
      dispatch,
      notify: (type, payload) => dispatch({ type, payload }),
    }
  }
}
