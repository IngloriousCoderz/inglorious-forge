export function createApi(store, extras) {
  return {
    /**
     * Retrieves all registered type definitions.
     * @returns {Object}
     */
    getTypes: store.getTypes,
    /**
     * Retrieves a specific type definition by name.
     * @param {string} typeName
     * @returns {Object}
     */
    getType: store.getType,
    /**
     * Replaces a type definition at runtime.
     * @param {string} typeName
     * @param {Object} type
     * @returns {void}
     */
    setType: store.setType,
    /**
     * Retrieves the full entities state.
     * @returns {Object}
     */
    getEntities: store.getState,
    /**
     * Retrieves a single entity by ID.
     * @param {string} id
     * @returns {Object | undefined}
     */
    getEntity: (id) => store.getState()[id],
    /**
     * Runs a selector against the current state.
     *
     * @template TResult
     * @param {(state: object) => TResult} selector
     * @returns {TResult}
     */
    select: (selector) => selector(store.getState()),
    /**
     * Dispatches an event object to the store.
     * @param {{ type: string, payload?: any }} event
     * @returns {void}
     */
    dispatch: store.dispatch,
    /**
     * Notifies the store of an event type and optional payload.
     * @param {string} type
     * @param {any} [payload]
     * @returns {void}
     */
    notify: store.notify,
    ...extras,
  }
}
