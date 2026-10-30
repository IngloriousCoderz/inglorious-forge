import { deserialize } from "@inglorious/utils/object.js"

const LAST_STATE = 1

const globalContainer = import.meta.hot
  ? ((import.meta.hot.data ??= {}).__INGLORIOUS_DEVTOOLS__ ??= {})
  : {}

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

      const next = store.dispatch
      store.dispatch = (event) => {
        const result = next(event)
        if (shouldLogEvent(event, config)) {
          sendAction(event, store.getState())
        }
        return result
      }

      return store
    },
  }
}

function connectDevTools(store, config = {}) {
  const updateMode = config.updateMode ?? "auto"

  const existing = getConnection()
  if (existing) {
    const sameMode = existing.updateMode === updateMode
    if (sameMode) {
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
  if (updateMode === "auto") {
    store.setState = (newState) => {
      baseSetState(newState)
      sendAction({ type: "stateInit", payload: newState }, store.getState())
    }
  }

  const devToolsInstance = window.__REDUX_DEVTOOLS_EXTENSION__.connect({
    name,
    features: {
      pause: true,
      lock: true,
      persist: true,
      export: true,
      import: "custom",
      jump: false,
      skip: false,
      reorder: false,
      dispatch: true,
      test: false,
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
    case "RESET": {
      store.reset()
      const existing = getConnection()
      existing?.devToolsInstance?.init(store.getState())
      break
    }

    case "ROLLBACK": {
      const newState = deserialize(message.state)
      store.setState(newState)
      break
    }

    case "COMMIT": {
      const existing = getConnection()
      existing?.devToolsInstance?.init(store.getState())
      break
    }

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
