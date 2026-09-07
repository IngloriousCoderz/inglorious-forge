import { deserialize } from "@inglorious/utils/data-structures/object.js"

const LAST_STATE = 1

// HMR-safe container to persist a single DevTools connection across Vite reloads.
// Uses import.meta.hot.data when available (preferred), falls back to module scope.
const globalContainer = import.meta.hot
  ? ((import.meta.hot.data ??= {}).__INGLORIOUS_DEVTOOLS__ ??= {})
  : {}

// connection shape: {
//   devToolsInstance,
//   unsubscribe,
//   store,
//   updateMode,
//   restoreSetState: () => void,
// }

// Unified API for cleaner integration across apps and engine
export function createDevtools(config = {}) {
  return {
    connect(store) {
      connectDevTools(store, config)
    },

    disconnect() {
      disconnectDevTools()
    },

    send(action, state) {
      sendAction(action, state)
    },

    middleware(store) {
      connectDevTools(store, config)
      return (next) => (event) => {
        const result = next(event)
        if (shouldLogEvent(event, config)) {
          sendAction(event, store.getState())
        }
        return result
      }
    },
  }
}

function connectDevTools(store, config = {}) {
  const updateMode = config.updateMode ?? "auto"

  // Prevent duplicate connections; rewire if store or update mode changed
  const existing = getConnection()
  if (existing) {
    const sameMode = existing.updateMode === updateMode
    if (sameMode) {
      // Hot-swap store without resetting DevTools history
      existing.restoreSetState?.()
      const baseSetState = store.setState
      const restoreSetState =
        updateMode === "auto"
          ? () => {
              if (store.setState !== baseSetState) {
                store.setState = baseSetState
              }
            }
          : () => {
              // no-op when not wrapping setState
            }
      if (updateMode === "auto") {
        store.setState = (newState) => {
          baseSetState(newState)
          sendAction({ type: "stateInit", payload: newState }, store.getState())
        }
      }
      existing.store = store
      existing.restoreSetState = restoreSetState
    }

    // Different update mode: fully disconnect previous and proceed
    try {
      existing.unsubscribe?.()
    } finally {
      existing.restoreSetState?.()
      clearConnection()
    }
  }

  if (typeof window === "undefined" || !window.__REDUX_DEVTOOLS_EXTENSION__) {
    return
  }

  const name = config.name ?? document.title
  const baseSetState = store.setState
  const restoreSetState =
    updateMode === "auto"
      ? () => {
          if (store.setState !== baseSetState) {
            store.setState = baseSetState
          }
        }
      : () => {
          // noop; we didn't wrap setState
        }
  // Only add setState side-effects in auto update mode; manual update mode logs explicitly from engine.
  if (updateMode === "auto") {
    store.setState = (newState) => {
      baseSetState(newState)
      sendAction({ type: "stateInit", payload: newState }, store.getState())
    }
  }

  const devToolsInstance = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
    name,
    // predicate: // doesn't work
    // @see https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md#features
    features: {
      pause: true, // start/pause recording of dispatched actions
      lock: true, // lock/unlock dispatching actions and side effects
      persist: true, // persist states on page reloading
      export: true, // export history of actions in a file
      import: "custom", // import history of actions from a file
      jump: false, // jump back and forth (time travelling)
      skip: false, // skip (cancel) actions
      reorder: false, // drag and drop actions in the history list
      dispatch: true, // dispatch custom actions or action creators
      test: false, // generate tests for the selected actions
    },
  })

  const unsubscribe = devToolsInstance.subscribe((message) => {
    switch (message.type) {
      case "DISPATCH":
        handleDispatch(message)
        break

      case "ACTION":
        handleAction(message)
        break
    }
  })

  devToolsInstance.init(store.getState())

  setConnection({
    devToolsInstance,
    unsubscribe,
    store,
    updateMode,
    restoreSetState,
  })
}

function disconnectDevTools() {
  // The `disconnect` method on the devToolsInstance is not available in all
  // environments or versions of the extension.
  // Safest is to unsubscribe and release our reference, and restore setState.
  const existing = getConnection()
  if (!existing) return
  try {
    existing.unsubscribe?.()
  } finally {
    existing.restoreSetState?.()
    clearConnection()
  }
}

function handleDispatch(message) {
  const { store } = getConnection() ?? {}
  if (!store) return
  switch (message.payload.type) {
    // reset button
    case "RESET": {
      store.reset()
      const existing = getConnection()
      existing?.devToolsInstance?.init(store.getState())
      break
    }

    // revert button
    case "ROLLBACK": {
      const newState = deserialize(message.state)
      store.setState(newState)
      break
    }

    // commit button
    case "COMMIT": {
      const existing = getConnection()
      existing?.devToolsInstance?.init(store.getState())
      break
    }

    // import from file button
    case "IMPORT_STATE": {
      const { computedStates, actionsById } = message.payload.nextLiftedState

      const [firstComputedState] = computedStates
      const lastComputedState =
        computedStates[computedStates.length - LAST_STATE]
      if (lastComputedState) {
        store.setState(lastComputedState.state)
      }

      const flattenedActions = Object.values(actionsById)
        .flatMap(({ action }) => action.payload ?? action)
        .map((action, index) => [index, action])

      const existing = getConnection()
      existing?.devToolsInstance?.init(
        firstComputedState.state,
        Object.fromEntries(flattenedActions),
      )
      break
    }
  }
}

function sendAction(action, state) {
  const existing = getConnection()
  existing?.devToolsInstance?.send(action, state)
}

function getConnection() {
  return globalContainer.connection ?? null
}

function setConnection(connection) {
  globalContainer.connection = connection
}

function clearConnection() {
  delete globalContainer.connection
}

function handleAction(message) {
  const { store } = getConnection() ?? {}
  if (!store) return
  const action = deserialize(message.payload)
  store.dispatch(action)
}

function shouldLogEvent(event, config) {
  const {
    updateMode = "auto",
    blacklist = [],
    whitelist = [],
    filter = null,
  } = config
  if (updateMode !== "auto") return false
  const passesBlacklist = !blacklist.length || !blacklist.includes(event.type)
  const passesWhitelist = !whitelist.length || whitelist.includes(event.type)
  const passesFilter = !filter || filter(event)
  return passesBlacklist && passesWhitelist && passesFilter
}
