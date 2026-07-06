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
     * Retrieves entities.
     * If `typeName` is omitted, returns the full entities state object.
     * If `typeName` is provided, returns an array of entities of that type.
     * @param {string} [typeName]
     * @returns {Object|Object[]}
     */
    getEntities: (typeName) => {
      const entities = store.getState()
      if (typeName == null) {
        return entities
      }

      return Object.values(entities).filter(
        (entity) => entity.type === typeName,
      )
    },
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
    /**
     * Notifies the store, but debounced: rapid calls sharing the same `type`
     * collapse into a single notification fired `wait` ms after the last call.
     * Use this to debounce a follow-up event from inside a handler.
     * @param {string} type
     * @param {any} [payload]
     * @param {number} [wait]
     * @returns {void}
     */
    notifyDebounced: store.notifyDebounced,
    ...extras,
  }
}
