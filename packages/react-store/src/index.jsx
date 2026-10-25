import { Provider, useSelector } from "react-redux"

/**
 * Creates a set of React hooks and a Provider component tailored to an Inglorious Store instance.
 * @param {import('@inglorious/store').Store} store The Inglorious Store instance.
 * @returns {{Provider: ({children}: {children: any}) => JSX.Element, useSelector: import('react-redux').useSelector, useEntity: (id: string | number) => object | undefined, useNotify: () => import('@inglorious/store').Store['notify']}}
 */
export function createReactStore(store) {
  /**
   * A React context Provider that makes the Inglorious Store available to any nested components.
   * @param {{children: React.ReactNode}} props
   */
  function StoreProvider({ children }) {
    return <Provider store={store}>{children}</Provider>
  }

  /**
   * A convenience hook to select a single entity by its ID from the store.
   * It subscribes the component to updates for that specific entity.
   * @param {string | number} id The ID of the entity to select.
   * @returns {object | undefined} The entity object if found, otherwise undefined.
   */
  function useEntity(id) {
    return useSelector((entities) => entities[id])
  }

  /**
   * A hook that returns the `notify` function from the Inglorious Store.
   * This is the primary way to dispatch events to the store from your components.
   * @returns {import('@inglorious/store').Store['notify']} The `notify` function.
   */
  function useNotify() {
    return store._api.notify
  }

  return { Provider: StoreProvider, useSelector, useEntity, useNotify }
}
