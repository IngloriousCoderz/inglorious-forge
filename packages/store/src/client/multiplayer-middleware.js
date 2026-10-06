import { deserialize, extend, serialize } from "@inglorious/utils/object.js"

// A constant for the server's WebSocket URL.
const DEFAULT_SERVER_URL = `ws://${window.location.hostname}:3000`
const DEFAULT_RECONNECTION_DELAY = 1000

/**
 * Creates and returns the multiplayer middleware.
 * @returns {Function} The middleware function.
 */
export function multiplayerMiddleware(config = {}) {
  const serverUrl = config.serverUrl ?? DEFAULT_SERVER_URL
  const reconnectionDelay =
    config.reconnectionDelay ?? DEFAULT_RECONNECTION_DELAY

  const blacklist = config.blacklist ?? []
  const whitelist = config.whitelist ?? []
  const filter = config.filter ?? null

  let ws = null
  const localQueue = []

  // The middleware function that will be applied to the store.
  return (store) => (next) => (event) => {
    const shouldBeSent =
      (!blacklist.length || !blacklist.includes(event.type)) &&
      (!whitelist.length || whitelist.includes(event.type)) &&
      (!filter || filter(event))
    if (!shouldBeSent) {
      return next(event)
    }

    // Establish the connection on the first event.
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

    // Pass the event to the next middleware in the chain,
    // which is eventually the store's original dispatch function.
    return next(event)
  }

  /**
   * Attempts to establish a WebSocket connection to the server.
   */
  function establishConnection(store) {
    // If a connection already exists, close it first.
    if (ws) {
      ws.close()
    }
    ws = new WebSocket(serverUrl)

    // =====================================================================
    // WebSocket Event Handlers
    // =====================================================================

    ws.onopen = () => {
      // Send any queued events to the server.
      while (localQueue.length) {
        ws.send(serialize(localQueue.shift()))
      }
    }

    ws.onmessage = (event) => {
      const serverEvent = deserialize(event.data)

      if (serverEvent.type === "stateInit") {
        // Merge the server's initial state with the client's local state.
        const nextState = extend(store.getState(), serverEvent.payload)
        store.setState(nextState)
      } else {
        // Dispatch the event to the local store to update the client's state.
        store.dispatch({ ...serverEvent, fromServer: true })
      }
    }

    ws.onclose = () => {
      // Attempt to reconnect after a short delay.
      setTimeout(() => establishConnection(store), reconnectionDelay)
    }

    ws.onerror = () => {
      ws.close() // The 'onclose' handler will trigger the reconnect.
    }
  }
}
