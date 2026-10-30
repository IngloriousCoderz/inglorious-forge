import { deserialize, extend, serialize } from "@inglorious/utils/object.js"

const DEFAULT_RECONNECTION_DELAY = 1000

/**
 * Creates and returns the multiplayer middleware.
 * @returns {Function} The middleware function.
 */
export function multiplayerMiddleware(config = {}) {
  const serverUrl = config.serverUrl ?? defaultServerUrl()
  const reconnectionDelay =
    config.reconnectionDelay ?? DEFAULT_RECONNECTION_DELAY

  const blacklist = config.blacklist ?? []
  const whitelist = config.whitelist ?? []
  const filter = config.filter ?? null

  let ws = null
  const localQueue = []

  return (store) => {
    const next = store.dispatch
    store.dispatch = (event) => send(store, event, next)
    return store
  }

  /**
   * Sends an event to the server unless it is filtered out or came from there, then
   * passes it on to the next middleware, and eventually to the store.
   */
  function send(store, event, next) {
    const shouldBeSent =
      (!blacklist.length || !blacklist.includes(event.type)) &&
      (!whitelist.length || whitelist.includes(event.type)) &&
      (!filter || filter(event))
    if (!shouldBeSent) {
      return next(event)
    }

    if (!ws) {
      establishConnection(store)
    }

    if (!event.fromServer) {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(serialize(event))
      } else {
        localQueue.push(event)
      }
    }

    return next(event)
  }

  /**
   * Attempts to establish a WebSocket connection to the server.
   */
  function establishConnection(store) {
    if (ws) {
      ws.close()
    }
    ws = new WebSocket(serverUrl)

    ws.onopen = () => {
      while (localQueue.length) {
        ws.send(serialize(localQueue.shift()))
      }
    }

    ws.onmessage = (event) => {
      const serverEvent = deserialize(event.data)

      if (serverEvent.type === "stateInit") {
        const nextState = extend(store.getState(), serverEvent.payload)
        store.setState(nextState)
      } else {
        store.dispatch({ ...serverEvent, fromServer: true })
      }
    }

    ws.onclose = () => {
      setTimeout(() => establishConnection(store), reconnectionDelay)
    }

    ws.onerror = () => {
      ws.close()
    }
  }
}

/**
 * Where the server is, when the caller has not said.
 *
 * Read when it is asked for rather than when this module is imported, so that importing it
 * does not require a browser -- which is what lets the store be imported anywhere.
 *
 * @returns {string} The server's WebSocket URL.
 */
function defaultServerUrl() {
  return `ws://${window.location.hostname}:3000`
}
