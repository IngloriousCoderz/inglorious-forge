//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty
var __exportAll = (all, no_symbols) => {
  let target = {}
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
    })
  if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" })
  return target
}
//#endregion
//#region smoke-setup.js
var noop = () => {}
var FakeAudioContext = class {
  constructor() {
    this.state = "running"
    this.destination = {}
  }
  resume() {
    return Promise.resolve()
  }
  createGain() {
    return {
      gain: { value: 1 },
      connect: noop,
    }
  }
  createBufferSource() {
    return {
      connect: noop,
      start: noop,
      stop: noop,
    }
  }
  decodeAudioData() {
    return Promise.resolve({})
  }
}
globalThis.window = {
  AudioContext: FakeAudioContext,
  addEventListener: noop,
  removeEventListener: noop,
  devicePixelRatio: 1,
  location: {
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
  },
}
globalThis.document = {
  body: {
    ownerDocument: {
      addEventListener: noop,
      removeEventListener: noop,
    },
  },
  getElementById: () => null,
}
Object.defineProperty(globalThis, "navigator", {
  value: { getGamepads: () => [] },
  configurable: true,
})
globalThis.fetch = () =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(/* @__PURE__ */ new ArrayBuffer(1)),
  })
//#endregion
//#region ../../../packages/engine/src/behaviors/audio.js
var DEFAULT_VOLUME = 1
/**
 * Fetches and decodes one sound. A sound that is missing, or that the browser
 * cannot decode, is reported and skipped: losing one effect is not worth refusing
 * to start.
 */
async function load(context, cache, name, url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`Sound '${name}' could not be fetched from ${url}`)
      return
    }
    const audioBuffer = await context.decodeAudioData(
      await response.arrayBuffer(),
    )
    cache.set(name, audioBuffer)
  } catch (error) {
    console.warn(`Sound '${name}' could not be loaded from ${url}`, error)
  }
}
function audio() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const audioBufferCache = /* @__PURE__ */ new Map()
  const activeSources = /* @__PURE__ */ new Map()
  function resume() {
    window.removeEventListener("pointerdown", resume)
    window.removeEventListener("keydown", resume)
    audioContext.resume()
  }
  return {
    create() {
      window.addEventListener("pointerdown", resume)
      window.addEventListener("keydown", resume)
    },
    async init(entity) {
      const sounds = entity.sounds || {}
      await Promise.all(
        Object.entries(sounds).map(([name, { url }]) =>
          load(audioContext, audioBufferCache, name, url),
        ),
      )
    },
    soundPlay(entity, name) {
      const { volume = DEFAULT_VOLUME, loop } = entity.sounds[name] || {}
      const audioBuffer = audioBufferCache.get(name)
      if (!audioBuffer) return
      activeSources.get(name)?.stop()
      const source = audioContext.createBufferSource()
      const gainNode = audioContext.createGain()
      source.buffer = audioBuffer
      gainNode.gain.value = volume
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)
      source.loop = loop
      source.start()
      activeSources.set(name, source)
    },
    soundStop(entity, name) {
      activeSources.get(name)?.stop()
      activeSources.delete(name)
    },
    stop() {
      window.removeEventListener("pointerdown", resume)
      window.removeEventListener("keydown", resume)
      for (const source of activeSources.values()) source.stop()
      activeSources.clear()
    },
  }
}
//#endregion
//#region ../../../packages/engine/src/behaviors/game.js
function game() {
  return {
    pause(entity) {
      entity.paused = true
    },
    resume(entity) {
      entity.paused = false
    },
    keyboardKeyUp(entity, code) {
      switch (code) {
        case "KeyC":
          entity.debug = !entity.debug
          break
        case "KeyD":
          entity.devMode = !entity.devMode
      }
    },
  }
}
//#endregion
//#region ../../../packages/engine/src/behaviors/images.js
function images() {
  const imageCache = /* @__PURE__ */ new Map()
  const loadingPromises = /* @__PURE__ */ new Map()
  return {
    async init(entity) {
      const images = entity.images || {}
      await Promise.all(
        Object.entries(images).map(async ([id, { url }]) => {
          const img = await loadImage(url)
          img.id = id
          imageCache.set(id, img)
        }),
      )
    },
    async load(id, src) {
      if (imageCache.has(id)) return imageCache.get(id)
      if (loadingPromises.has(id)) return loadingPromises.get(id)
      const promise = loadImage(src).then((img) => {
        img.id = id
        imageCache.set(id, img)
        loadingPromises.delete(id)
        return img
      })
      loadingPromises.set(id, promise)
      return promise
    },
    get(id) {
      return imageCache.get(id)
    },
    stop() {
      imageCache.clear()
      loadingPromises.clear()
    },
  }
}
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () =>
      reject(/* @__PURE__ */ new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}
//#endregion
//#region ../../../packages/store/src/api.js
function createApi(store, extras) {
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
      if (typeName == null) return entities
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
    ...extras,
  }
}
//#endregion
//#region ../../../packages/utils/src/functions/functions.js
/**
 * Composes multiple functions from right to left, as if every function wraps the next one.
 * The first function (rightmost) can take multiple arguments; the remaining functions must be unary.
 *
 * @param {...Function} fns - Functions to compose.
 * @returns {Function} A function that takes the initial arguments and applies the composed functions.
 */
function compose(...fns) {
  if (!fns.length) return (x) => x
  const [last, ...rest] = fns.reverse()
  return (...args) => rest.reduce((acc, fn) => fn(acc), last(...args))
}
/**
 * Checks if a value is a function.
 *
 * @param {*} func - The value to check.
 * @returns {boolean} True if the value is a function, false otherwise.
 */
function isFunction(func) {
  return typeof func === "function"
}
/**
 * Pipes multiple functions from left to right, as if the functions are applied one by one.
 * The first function (leftmost) can take multiple arguments; the remaining functions must be unary.
 *
 * @param {...Function} fns - Functions to pipe.
 * @returns {Function} A function that takes the initial arguments and applies the piped functions.
 */
function pipe(...fns) {
  if (!fns.length) return (x) => x
  const [first, ...rest] = fns
  return (...args) => rest.reduce((acc, fn) => fn(acc), first(...args))
}
//#endregion
//#region ../../../packages/utils/src/data-structures/array.js
/**
 * Ensures that the given value is an array. If it's not an array, it wraps it in one.
 *
 * @param {*} value - The value to check.
 * @returns {Array} - The original array or the value wrapped in a new array.
 */
function ensureArray(value) {
  return isArray(value) ? value : [value]
}
/**
 * Checks if a value is an array.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is an array, false otherwise.
 */
function isArray(value) {
  return Array.isArray(value)
}
//#endregion
//#region ../../../packages/utils/src/v.js
/**
 * @typedef {import("../types/math/vectors").Vector} Vector
 */
/**
 * Ensures that a given value is a vector.
 *
 * If the value is an array of finite numbers but not already a vector (i.e., it lacks the `__isVector__` property),
 * this function converts it into a vector by calling `v()`. If the value is already a vector or not a numeric array,
 * it is returned unchanged. This is particularly useful for ensuring that the results of standard array operations
 * (like `.map()` or `.filter()`) which return a new array are correctly re-tagged as vectors.
 * @param {*} value The value to check and potentially convert.
 * @returns {Vector|*} The value as a vector, or the original value if no conversion was needed.
 */
function ensureV(value) {
  if (
    isArray(value) &&
    !value.__isVector__ &&
    value.every((coord) => isFinite(coord))
  )
    return v(...value)
  return value
}
/**
 * A utility function to create a vector from a list of coordinates.
 * This is a shorthand for `[x, y, z, ...]`.
 * It also tags the array with a non-enumerable `__isVector__` property for
 * efficient type checking.
 * @param {...number} coords - The coordinates of the vector.
 * @returns {Vector} The created vector.
 */
function v(...coords) {
  Object.defineProperty(coords, "__isVector__", {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  })
  return coords
}
//#endregion
//#region ../../../packages/utils/src/data-structures/objects.js
/**
 * Deserializes an object, converting plain object representations back into
 * their original types, such as vector-like objects. This is the inverse
 * operation of `serialize`.
 *
 * - Recursively deserializes nested objects.
 * - Converts objects with a `_type: "vector"` property and `coords` array
 *   back into a vector-like object using the `v` factory function.
 * - Copies all other property values as-is.
 *
 * @param {string} str - The JSON string to deserialize.
 * @returns {Object} The deserialized object.
 */
function deserialize(str) {
  return revive(JSON.parse(str))
  function revive(value) {
    if (isArray(value)) return value.map(revive)
    if (isObject(value)) {
      if (value._type === "vector" && value.coords) return v(...value.coords)
      const deserialized = {}
      for (const key in value)
        if (Object.prototype.hasOwnProperty.call(value, key))
          deserialized[key] = revive(value[key])
      return deserialized
    }
    return value
  }
}
/**
 * Creates a new object by deeply merging a target object with one or more source objects.
 * This function is immutable; it does not modify the original `target` or `sources`.
 * Nested objects are merged recursively.
 * Arrays from a source object will overwrite arrays in the target object.
 *
 * @param {Object} target - The base object.
 * @param {...Object} sources - The source objects to merge into the target object.
 * @returns {Object} - A new object containing the merged properties.
 * @see {@link merge} for a mutable version.
 */
function extend(target, ...sources) {
  return extendWith(void 0, target, ...sources)
}
/**
 * Creates a new object by deeply merging a target object with one or more source objects,
 * using a custom merger function to handle specific properties.
 * This function is immutable.
 *
 * @param {Function} [merger] - A function to customize merging behavior. It receives `(targetValue, sourceValue)`. If it returns `undefined`, the default merge logic is used.
 * @param {Object} target - The base object.
 * @param {...Object} sources - The source objects to merge.
 * @returns {Object} A new object with the merged properties.
 */
function extendWith(merger, target, ...sources) {
  return mergeWith(merger, {}, target, ...sources)
}
/**
 * Filters the properties of an object based on a callback function.
 *
 * @param {Object} obj - The object to filter.
 * @param {Function} callback - A function that determines whether a property should be included.
 *                              Receives (key, value, obj) as arguments.
 * @returns {Object} A new object with the filtered properties.
 */
function filter(obj, callback) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value], obj) =>
      callback(key, value, obj),
    ),
  )
}
/**
 * Checks if a value is a plain object.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is a plain object, false otherwise.
 */
function isObject(value) {
  return value != null && value.constructor === Object
}
/**
 * Maps the properties of an object using a callback function.
 *
 * @param {Object} obj - The object to map.
 * @param {Function} callback - A function that transforms each property.
 *                              Receives (key, value, obj) as arguments.
 * @returns {Object} A new object with the mapped properties.
 */
function map(obj, callback) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    acc[key] = callback(key, value, obj)
    return acc
  }, {})
}
/**
 * Merges multiple source objects into a target object, using a custom merger function.
 * This function is mutable; it modifies the `target` object in place.
 *
 * @param {Function} [merger] - A function to customize merging behavior. It receives `(targetValue, sourceValue)`. If it returns `undefined`, the default merge logic is used.
 * @param {Object} target - The target object to merge into.
 * @param {...Object} sources - The source objects to merge from.
 * @returns {Object} The merged target object.
 */
function mergeWith(merger, target, ...sources) {
  return sources
    .filter((source) => source != null)
    .reduce((acc, source) => deepMerge(acc, source, merger), target)
}
/**
 * Serializes an object, converting special types like vectors into a plain
 * object representation. This is useful for processes like saving state to a
 * file or sending it over a network.
 *
 * - Recursively serializes nested objects.
 * - Converts objects with a `__isVector__` property into a serializable
 *   format: `{ _type: "vector", coords: [...] }`.
 * - Copies all other property values as-is.
 *
 * @param {Object} obj - The object to serialize.
 * @returns {string} The serialized JSON string.
 */
function serialize(obj) {
  function replacer(key, value) {
    if (value?.__isVector__)
      return {
        _type: "vector",
        coords: Array.from(value),
      }
    if (isObject(value)) {
      const serialized = {}
      for (const k in value)
        if (Object.prototype.hasOwnProperty.call(value, k))
          serialized[k] = replacer(void 0, value[k])
      return serialized
    }
    return value
  }
  return JSON.stringify(obj, replacer)
}
/**
 * Recursively merges properties from a source object into a target object.
 * This is a helper function for `merge` and `extend`.
 *
 * @param {Object} target - The target object to merge into.
 * @param {Object} source - The source object to merge from.
 * @param {Function} [merger] - An optional function to customize merging behavior for specific keys.
 * @returns {Object} - The modified target object.
 */
function deepMerge(target, source, merger) {
  for (const [key, value] of Object.entries(source)) {
    if (isFunction(merger)) {
      const mergedValue = merger(target[key], value)
      if (mergedValue !== void 0) {
        target[key] = mergedValue
        continue
      }
    }
    if (isArray(value)) target[key] = value
    else if (isObject(value)) {
      if (!isObject(target[key])) target[key] = {}
      target[key] = deepMerge(target[key], value, merger)
    } else target[key] = value
  }
  return target
}
//#endregion
//#region ../../../packages/store/src/client/devtools.js
var LAST_STATE = 1
var globalContainer = {}
function createDevtools(config = {}) {
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
        if (shouldLogEvent(event, config)) sendAction(event, store.getState())
        return result
      }
    },
  }
}
function connectDevTools(store, config = {}) {
  const updateMode = config.updateMode ?? "auto"
  const existing = getConnection()
  if (existing) {
    if (existing.updateMode === updateMode) {
      existing.restoreSetState?.()
      const baseSetState = store.setState
      const restoreSetState =
        updateMode === "auto"
          ? () => {
              if (store.setState !== baseSetState) store.setState = baseSetState
            }
          : () => {}
      if (updateMode === "auto")
        store.setState = (newState) => {
          baseSetState(newState)
          sendAction(
            {
              type: "stateInit",
              payload: newState,
            },
            store.getState(),
          )
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
  if (typeof window === "undefined" || !window.__REDUX_DEVTOOLS_EXTENSION__)
    return
  const name = config.name ?? document.title
  const baseSetState = store.setState
  const restoreSetState =
    updateMode === "auto"
      ? () => {
          if (store.setState !== baseSetState) store.setState = baseSetState
        }
      : () => {}
  if (updateMode === "auto")
    store.setState = (newState) => {
      baseSetState(newState)
      sendAction(
        {
          type: "stateInit",
          payload: newState,
        },
        store.getState(),
      )
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
    case "RESET":
      store.reset()
      getConnection()?.devToolsInstance?.init(store.getState())
      break
    case "ROLLBACK": {
      const newState = deserialize(message.state)
      store.setState(newState)
      break
    }
    case "COMMIT":
      getConnection()?.devToolsInstance?.init(store.getState())
      break
    case "IMPORT_STATE": {
      const { computedStates, actionsById } = message.payload.nextLiftedState
      const [firstComputedState] = computedStates
      const lastComputedState =
        computedStates[computedStates.length - LAST_STATE]
      if (lastComputedState) store.setState(lastComputedState.state)
      const flattenedActions = Object.values(actionsById)
        .flatMap(({ action }) => action.payload ?? action)
        .map((action, index) => [index, action])
      getConnection()?.devToolsInstance?.init(
        firstComputedState.state,
        Object.fromEntries(flattenedActions),
      )
      break
    }
  }
}
function sendAction(action, state) {
  getConnection()?.devToolsInstance?.send(action, state)
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
//#endregion
//#region ../../../packages/store/src/client/multiplayer-middleware.js
var DEFAULT_SERVER_URL = `ws://${window.location.hostname}:3000`
var DEFAULT_RECONNECTION_DELAY = 1e3
/**
 * Creates and returns the multiplayer middleware.
 * @returns {Function} The middleware function.
 */
function multiplayerMiddleware(config = {}) {
  const serverUrl = config.serverUrl ?? DEFAULT_SERVER_URL
  const reconnectionDelay =
    config.reconnectionDelay ?? DEFAULT_RECONNECTION_DELAY
  const blacklist = config.blacklist ?? []
  const whitelist = config.whitelist ?? []
  const filter = config.filter ?? null
  let ws = null
  const localQueue = []
  return (store) => (next) => (event) => {
    if (!(
      (!blacklist.length || !blacklist.includes(event.type)) &&
      (!whitelist.length || whitelist.includes(event.type)) &&
      (!filter || filter(event))
    ))
      return next(event)
    if (!ws) establishConnection(store)
    if (!event.fromServer) {
      if (ws?.readyState === WebSocket.OPEN) ws.send(serialize(event))
      else localQueue.push(event)
    }
    return next(event)
  }
  /**
   * Attempts to establish a WebSocket connection to the server.
   */
  function establishConnection(store) {
    if (ws) ws.close()
    ws = new WebSocket(serverUrl)
    ws.onopen = () => {
      while (localQueue.length) ws.send(serialize(localQueue.shift()))
    }
    ws.onmessage = (event) => {
      const serverEvent = deserialize(event.data)
      if (serverEvent.type === "stateInit") {
        const nextState = extend(store.getState(), serverEvent.payload)
        store.setState(nextState)
      } else
        store.dispatch({
          ...serverEvent,
          fromServer: true,
        })
    }
    ws.onclose = () => {
      setTimeout(() => establishConnection(store), reconnectionDelay)
    }
    ws.onerror = () => {
      ws.close()
    }
  }
}
//#endregion
//#region ../../../packages/utils/src/data-structures/string.js
/**
 * Convert kebab-case or PascalCase to camelCase.
 *
 * @param {string} input - The string to convert.
 * @returns {string} The camelCased string.
 */
function toCamelCase(input) {
  const [firstChar, ...rest] = input.replace(/-([a-z0-9])/gi, (_, c) =>
    c.toUpperCase(),
  )
  return [firstChar.toLowerCase(), ...rest].join("")
}
//#endregion
//#region ../../../node_modules/.pnpm/mutative@1.3.0/node_modules/mutative/dist/mutative.esm.mjs
var Operation = {
  Remove: "remove",
  Replace: "replace",
  Add: "add",
}
var PROXY_DRAFT = Symbol.for("__MUTATIVE_PROXY_DRAFT__")
var RAW_RETURN_SYMBOL = Symbol("__MUTATIVE_RAW_RETURN_SYMBOL__")
var iteratorSymbol = Symbol.iterator
var dataTypes = {
  mutable: "mutable",
  immutable: "immutable",
}
var internal = {}
function has(target, key) {
  return target instanceof Map
    ? target.has(key)
    : Object.prototype.hasOwnProperty.call(target, key)
}
function getDescriptor(target, key) {
  if (key in target) {
    let prototype = Reflect.getPrototypeOf(target)
    while (prototype) {
      const descriptor = Reflect.getOwnPropertyDescriptor(prototype, key)
      if (descriptor) return descriptor
      prototype = Reflect.getPrototypeOf(prototype)
    }
  }
}
function isBaseSetInstance(obj) {
  return Object.getPrototypeOf(obj) === Set.prototype
}
function isBaseMapInstance(obj) {
  return Object.getPrototypeOf(obj) === Map.prototype
}
function latest(proxyDraft) {
  var _a
  return (_a = proxyDraft.copy) !== null && _a !== void 0
    ? _a
    : proxyDraft.original
}
/**
 * Check if the value is a draft
 */
function isDraft(target) {
  return !!getProxyDraft(target)
}
function getProxyDraft(value) {
  if (typeof value !== "object") return null
  return value === null || value === void 0 ? void 0 : value[PROXY_DRAFT]
}
function getValue(value) {
  var _a
  const proxyDraft = getProxyDraft(value)
  return proxyDraft
    ? (_a = proxyDraft.copy) !== null && _a !== void 0
      ? _a
      : proxyDraft.original
    : value
}
/**
 * Check if a value is draftable
 */
function isDraftable(value, options) {
  if (!value || typeof value !== "object") return false
  let markResult
  return (
    Object.getPrototypeOf(value) === Object.prototype ||
    Array.isArray(value) ||
    value instanceof Map ||
    value instanceof Set ||
    (!!(options === null || options === void 0 ? void 0 : options.mark) &&
      ((markResult = options.mark(value, dataTypes)) === dataTypes.immutable ||
        typeof markResult === "function"))
  )
}
function getPath(target, path = []) {
  if (Object.hasOwnProperty.call(target, "key")) {
    const parentCopy = target.parent.copy
    const proxyDraft = getProxyDraft(get(parentCopy, target.key))
    if (
      proxyDraft !== null &&
      (proxyDraft === null || proxyDraft === void 0
        ? void 0
        : proxyDraft.original) !== target.original
    )
      return null
    const isSet = target.parent.type === 3
    const key = isSet
      ? Array.from(target.parent.setMap.keys()).indexOf(target.key)
      : target.key
    if (!((isSet && parentCopy.size > key) || has(parentCopy, key))) return null
    path.push(key)
  }
  if (target.parent) return getPath(target.parent, path)
  path.reverse()
  try {
    resolvePath(target.copy, path)
  } catch (e) {
    return null
  }
  return path
}
function getType(target) {
  if (Array.isArray(target)) return 1
  if (target instanceof Map) return 2
  if (target instanceof Set) return 3
  return 0
}
function get(target, key) {
  return getType(target) === 2 ? target.get(key) : target[key]
}
function set(target, key, value) {
  if (getType(target) === 2) target.set(key, value)
  else target[key] = value
}
function peek(target, key) {
  const state = getProxyDraft(target)
  return (state ? latest(state) : target)[key]
}
function isEqual(x, y) {
  if (x === y) return x !== 0 || 1 / x === 1 / y
  else return x !== x && y !== y
}
function revokeProxy(proxyDraft) {
  if (!proxyDraft) return
  while (proxyDraft.finalities.revoke.length > 0)
    proxyDraft.finalities.revoke.pop()()
}
function escapePath(path, pathAsArray) {
  return pathAsArray
    ? path
    : [""]
        .concat(path)
        .map((_item) => {
          const item = `${_item}`
          if (item.indexOf("/") === -1 && item.indexOf("~") === -1) return item
          return item.replace(/~/g, "~0").replace(/\//g, "~1")
        })
        .join("/")
}
function resolvePath(base, path) {
  for (let index = 0; index < path.length - 1; index += 1) {
    const key = path[index]
    base = get(getType(base) === 3 ? Array.from(base) : base, key)
    if (typeof base !== "object")
      throw new Error(`Cannot resolve patch at '${path.join("/")}'.`)
  }
  return base
}
function strictCopy(target) {
  const copy = Object.create(Object.getPrototypeOf(target))
  Reflect.ownKeys(target).forEach((key) => {
    let desc = Reflect.getOwnPropertyDescriptor(target, key)
    if (desc.enumerable && desc.configurable && desc.writable) {
      copy[key] = target[key]
      return
    }
    if (!desc.writable) {
      desc.writable = true
      desc.configurable = true
    }
    if (desc.get || desc.set)
      desc = {
        configurable: true,
        writable: true,
        enumerable: desc.enumerable,
        value: target[key],
      }
    Reflect.defineProperty(copy, key, desc)
  })
  return copy
}
var propIsEnum = Object.prototype.propertyIsEnumerable
function shallowCopy(original, options) {
  let markResult
  if (Array.isArray(original)) return Array.prototype.concat.call(original)
  else if (original instanceof Set) {
    if (!isBaseSetInstance(original)) {
      const SubClass = Object.getPrototypeOf(original).constructor
      return new SubClass(original.values())
    }
    return Set.prototype.difference
      ? Set.prototype.difference.call(original, /* @__PURE__ */ new Set())
      : new Set(original.values())
  } else if (original instanceof Map) {
    if (!isBaseMapInstance(original)) {
      const SubClass = Object.getPrototypeOf(original).constructor
      return new SubClass(original)
    }
    return new Map(original)
  } else if (
    (options === null || options === void 0 ? void 0 : options.mark) &&
    ((markResult = options.mark(original, dataTypes)), markResult !== void 0) &&
    markResult !== dataTypes.mutable
  ) {
    if (markResult === dataTypes.immutable) return strictCopy(original)
    else if (typeof markResult === "function") {
      if (options.enablePatches || options.enableAutoFreeze)
        throw new Error(
          `You can't use mark and patches or auto freeze together.`,
        )
      return markResult()
    }
    throw new Error(`Unsupported mark result: ${markResult}`)
  } else if (
    typeof original === "object" &&
    Object.getPrototypeOf(original) === Object.prototype
  ) {
    const copy = {}
    Object.keys(original).forEach((key) => {
      copy[key] = original[key]
    })
    Object.getOwnPropertySymbols(original).forEach((key) => {
      if (propIsEnum.call(original, key)) copy[key] = original[key]
    })
    return copy
  } else
    throw new Error(
      `Please check mark() to ensure that it is a stable marker draftable function.`,
    )
}
function ensureShallowCopy(target) {
  if (target.copy) return
  target.copy = shallowCopy(target.original, target.options)
}
function deepClone(target) {
  if (!isDraftable(target)) return getValue(target)
  if (Array.isArray(target)) return target.map(deepClone)
  if (target instanceof Map) {
    const iterable = Array.from(target.entries()).map(([k, v]) => [
      k,
      deepClone(v),
    ])
    if (!isBaseMapInstance(target)) {
      const SubClass = Object.getPrototypeOf(target).constructor
      return new SubClass(iterable)
    }
    return new Map(iterable)
  }
  if (target instanceof Set) {
    const iterable = Array.from(target).map(deepClone)
    if (!isBaseSetInstance(target)) {
      const SubClass = Object.getPrototypeOf(target).constructor
      return new SubClass(iterable)
    }
    return new Set(iterable)
  }
  const copy = Object.create(Object.getPrototypeOf(target))
  for (const key in target) copy[key] = deepClone(target[key])
  return copy
}
function cloneIfNeeded(target) {
  return isDraft(target) ? deepClone(target) : target
}
function markChanged(proxyDraft) {
  var _a
  proxyDraft.assignedMap =
    (_a = proxyDraft.assignedMap) !== null && _a !== void 0
      ? _a
      : /* @__PURE__ */ new Map()
  if (!proxyDraft.operated) {
    proxyDraft.operated = true
    if (proxyDraft.parent) markChanged(proxyDraft.parent)
  }
}
function throwFrozenError() {
  throw new Error("Cannot modify frozen object")
}
function deepFreeze(target, subKey, updatedValues, stack, keys) {
  {
    updatedValues =
      updatedValues !== null && updatedValues !== void 0
        ? updatedValues
        : /* @__PURE__ */ new WeakMap()
    stack = stack !== null && stack !== void 0 ? stack : []
    keys = keys !== null && keys !== void 0 ? keys : []
    const value = updatedValues.has(target) ? updatedValues.get(target) : target
    if (stack.length > 0) {
      const index = stack.indexOf(value)
      if (value && typeof value === "object" && index !== -1) {
        if (stack[0] === value) throw new Error(`Forbids circular reference`)
        throw new Error(
          `Forbids circular reference: ~/${keys
            .slice(0, index)
            .map((key, index) => {
              if (typeof key === "symbol") return `[${key.toString()}]`
              const parent = stack[index]
              if (
                typeof key === "object" &&
                (parent instanceof Map || parent instanceof Set)
              )
                return Array.from(parent.keys()).indexOf(key)
              return key
            })
            .join("/")}`,
        )
      }
      stack.push(value)
      keys.push(subKey)
    } else stack.push(value)
  }
  if (Object.isFrozen(target) || isDraft(target)) {
    stack.pop()
    keys.pop()
    return
  }
  switch (getType(target)) {
    case 2:
      for (const [key, value] of target) {
        deepFreeze(key, key, updatedValues, stack, keys)
        deepFreeze(value, key, updatedValues, stack, keys)
      }
      target.set = target.clear = target.delete = throwFrozenError
      break
    case 3:
      for (const value of target)
        deepFreeze(value, value, updatedValues, stack, keys)
      target.add = target.clear = target.delete = throwFrozenError
      break
    case 1:
      Object.freeze(target)
      let index = 0
      for (const value of target) {
        deepFreeze(value, index, updatedValues, stack, keys)
        index += 1
      }
      break
    default:
      Object.freeze(target)
      Object.keys(target).forEach((name) => {
        const value = target[name]
        deepFreeze(value, name, updatedValues, stack, keys)
      })
  }
  stack.pop()
  keys.pop()
}
function forEach(target, iter) {
  const type = getType(target)
  if (type === 0)
    Reflect.ownKeys(target).forEach((key) => {
      iter(key, target[key], target)
    })
  else if (type === 1) {
    let index = 0
    for (const entry of target) {
      iter(index, entry, target)
      index += 1
    }
  } else target.forEach((entry, index) => iter(index, entry, target))
}
function handleValue(target, handledSet, options) {
  if (
    isDraft(target) ||
    !isDraftable(target, options) ||
    handledSet.has(target) ||
    Object.isFrozen(target)
  )
    return
  const isSet = target instanceof Set
  const setMap = isSet ? /* @__PURE__ */ new Map() : void 0
  handledSet.add(target)
  forEach(target, (key, value) => {
    var _a
    if (isDraft(value)) {
      const proxyDraft = getProxyDraft(value)
      ensureShallowCopy(proxyDraft)
      const updatedValue =
        ((_a = proxyDraft.assignedMap) === null || _a === void 0
          ? void 0
          : _a.size) || proxyDraft.operated
          ? proxyDraft.copy
          : proxyDraft.original
      set(isSet ? setMap : target, key, updatedValue)
    } else handleValue(value, handledSet, options)
  })
  if (setMap) {
    const set = target
    const values = Array.from(set)
    set.clear()
    values.forEach((value) => {
      set.add(setMap.has(value) ? setMap.get(value) : value)
    })
  }
}
function finalizeAssigned(proxyDraft, key) {
  const copy = proxyDraft.type === 3 ? proxyDraft.setMap : proxyDraft.copy
  if (
    proxyDraft.finalities.revoke.length > 1 &&
    proxyDraft.assignedMap.get(key) &&
    copy
  )
    handleValue(
      get(copy, key),
      proxyDraft.finalities.handledSet,
      proxyDraft.options,
    )
}
function finalizeSetValue(target) {
  if (target.type === 3 && target.copy) {
    target.copy.clear()
    target.setMap.forEach((value) => {
      target.copy.add(getValue(value))
    })
  }
}
function finalizePatches(target, generatePatches, patches, inversePatches) {
  if (
    target.operated &&
    target.assignedMap &&
    target.assignedMap.size > 0 &&
    !target.finalized
  ) {
    if (patches && inversePatches) {
      const basePath = getPath(target)
      if (basePath) generatePatches(target, basePath, patches, inversePatches)
    }
    target.finalized = true
  }
}
function markFinalization(target, key, value, generatePatches) {
  const proxyDraft = getProxyDraft(value)
  if (proxyDraft) {
    if (!proxyDraft.callbacks) proxyDraft.callbacks = []
    proxyDraft.callbacks.push((patches, inversePatches) => {
      var _a
      const copy = target.type === 3 ? target.setMap : target.copy
      if (isEqual(get(copy, key), value)) {
        let updatedValue = proxyDraft.original
        if (proxyDraft.copy) updatedValue = proxyDraft.copy
        finalizeSetValue(target)
        finalizePatches(target, generatePatches, patches, inversePatches)
        if (target.options.enableAutoFreeze) {
          target.options.updatedValues =
            (_a = target.options.updatedValues) !== null && _a !== void 0
              ? _a
              : /* @__PURE__ */ new WeakMap()
          target.options.updatedValues.set(updatedValue, proxyDraft.original)
        }
        set(copy, key, updatedValue)
      }
    })
    if (target.options.enableAutoFreeze) {
      if (proxyDraft.finalities !== target.finalities)
        target.options.enableAutoFreeze = false
    }
  }
  if (isDraftable(value, target.options))
    target.finalities.draft.push(() => {
      if (
        isEqual(
          get(target.type === 3 ? target.setMap : target.copy, key),
          value,
        )
      )
        finalizeAssigned(target, key)
    })
}
function generateArrayPatches(
  proxyState,
  basePath,
  patches,
  inversePatches,
  pathAsArray,
) {
  let { original, assignedMap, options } = proxyState
  let copy = proxyState.copy
  if (copy.length < original.length) {
    ;[original, copy] = [copy, original]
    ;[patches, inversePatches] = [inversePatches, patches]
  }
  for (let index = 0; index < original.length; index += 1)
    if (assignedMap.get(index.toString()) && copy[index] !== original[index]) {
      const path = escapePath(basePath.concat([index]), pathAsArray)
      patches.push({
        op: Operation.Replace,
        path,
        value: cloneIfNeeded(copy[index]),
      })
      inversePatches.push({
        op: Operation.Replace,
        path,
        value: cloneIfNeeded(original[index]),
      })
    }
  for (let index = original.length; index < copy.length; index += 1) {
    const path = escapePath(basePath.concat([index]), pathAsArray)
    patches.push({
      op: Operation.Add,
      path,
      value: cloneIfNeeded(copy[index]),
    })
  }
  if (original.length < copy.length) {
    const { arrayLengthAssignment = true } = options.enablePatches
    if (arrayLengthAssignment) {
      const path = escapePath(basePath.concat(["length"]), pathAsArray)
      inversePatches.push({
        op: Operation.Replace,
        path,
        value: original.length,
      })
    } else
      for (let index = copy.length; original.length < index; index -= 1) {
        const path = escapePath(basePath.concat([index - 1]), pathAsArray)
        inversePatches.push({
          op: Operation.Remove,
          path,
        })
      }
  }
}
function generatePatchesFromAssigned(
  { original, copy, assignedMap },
  basePath,
  patches,
  inversePatches,
  pathAsArray,
) {
  assignedMap.forEach((assignedValue, key) => {
    const originalValue = get(original, key)
    const value = cloneIfNeeded(get(copy, key))
    const op = !assignedValue
      ? Operation.Remove
      : has(original, key)
        ? Operation.Replace
        : Operation.Add
    if (isEqual(originalValue, value) && op === Operation.Replace) return
    const path = escapePath(basePath.concat(key), pathAsArray)
    patches.push(
      op === Operation.Remove
        ? {
            op,
            path,
          }
        : {
            op,
            path,
            value,
          },
    )
    inversePatches.push(
      op === Operation.Add
        ? {
            op: Operation.Remove,
            path,
          }
        : op === Operation.Remove
          ? {
              op: Operation.Add,
              path,
              value: originalValue,
            }
          : {
              op: Operation.Replace,
              path,
              value: originalValue,
            },
    )
  })
}
function generateSetPatches(
  { original, copy },
  basePath,
  patches,
  inversePatches,
  pathAsArray,
) {
  let index = 0
  original.forEach((value) => {
    if (!copy.has(value)) {
      const path = escapePath(basePath.concat([index]), pathAsArray)
      patches.push({
        op: Operation.Remove,
        path,
        value,
      })
      inversePatches.unshift({
        op: Operation.Add,
        path,
        value,
      })
    }
    index += 1
  })
  index = 0
  copy.forEach((value) => {
    if (!original.has(value)) {
      const path = escapePath(basePath.concat([index]), pathAsArray)
      patches.push({
        op: Operation.Add,
        path,
        value,
      })
      inversePatches.unshift({
        op: Operation.Remove,
        path,
        value,
      })
    }
    index += 1
  })
}
function generatePatches(proxyState, basePath, patches, inversePatches) {
  const { pathAsArray = true } = proxyState.options.enablePatches
  switch (proxyState.type) {
    case 0:
    case 2:
      return generatePatchesFromAssigned(
        proxyState,
        basePath,
        patches,
        inversePatches,
        pathAsArray,
      )
    case 1:
      return generateArrayPatches(
        proxyState,
        basePath,
        patches,
        inversePatches,
        pathAsArray,
      )
    case 3:
      return generateSetPatches(
        proxyState,
        basePath,
        patches,
        inversePatches,
        pathAsArray,
      )
  }
}
var readable = false
var checkReadable = (value, options, ignoreCheckDraftable = false) => {
  if (
    typeof value === "object" &&
    value !== null &&
    (!isDraftable(value, options) || ignoreCheckDraftable) &&
    !readable
  )
    throw new Error(
      `Strict mode: Mutable data cannot be accessed directly, please use 'unsafe(callback)' wrap.`,
    )
}
var mapHandler = {
  get size() {
    return latest(getProxyDraft(this)).size
  },
  has(key) {
    return latest(getProxyDraft(this)).has(key)
  },
  set(key, value) {
    const target = getProxyDraft(this)
    const source = latest(target)
    if (!source.has(key) || !isEqual(source.get(key), value)) {
      ensureShallowCopy(target)
      markChanged(target)
      target.assignedMap.set(key, true)
      target.copy.set(key, value)
      markFinalization(target, key, value, generatePatches)
    }
    return this
  },
  delete(key) {
    if (!this.has(key)) return false
    const target = getProxyDraft(this)
    ensureShallowCopy(target)
    markChanged(target)
    if (target.original.has(key)) target.assignedMap.set(key, false)
    else target.assignedMap.delete(key)
    target.copy.delete(key)
    return true
  },
  clear() {
    const target = getProxyDraft(this)
    if (!this.size) return
    ensureShallowCopy(target)
    markChanged(target)
    target.assignedMap = /* @__PURE__ */ new Map()
    for (const [key] of target.original) target.assignedMap.set(key, false)
    target.copy.clear()
  },
  forEach(callback, thisArg) {
    latest(getProxyDraft(this)).forEach((_value, _key) => {
      callback.call(thisArg, this.get(_key), _key, this)
    })
  },
  get(key) {
    var _a, _b
    const target = getProxyDraft(this)
    const value = latest(target).get(key)
    const mutable =
      ((_b = (_a = target.options).mark) === null || _b === void 0
        ? void 0
        : _b.call(_a, value, dataTypes)) === dataTypes.mutable
    if (target.options.strict) checkReadable(value, target.options, mutable)
    if (mutable) return value
    if (target.finalized || !isDraftable(value, target.options)) return value
    if (value !== target.original.get(key)) return value
    const draft = internal.createDraft({
      original: value,
      parentDraft: target,
      key,
      finalities: target.finalities,
      options: target.options,
    })
    ensureShallowCopy(target)
    target.copy.set(key, draft)
    return draft
  },
  keys() {
    return latest(getProxyDraft(this)).keys()
  },
  values() {
    const iterator = this.keys()
    return {
      [iteratorSymbol]: () => this.values(),
      next: () => {
        const result = iterator.next()
        if (result.done) return result
        return {
          done: false,
          value: this.get(result.value),
        }
      },
    }
  },
  entries() {
    const iterator = this.keys()
    return {
      [iteratorSymbol]: () => this.entries(),
      next: () => {
        const result = iterator.next()
        if (result.done) return result
        const value = this.get(result.value)
        return {
          done: false,
          value: [result.value, value],
        }
      },
    }
  },
  [iteratorSymbol]() {
    return this.entries()
  },
}
var mapHandlerKeys = Reflect.ownKeys(mapHandler)
var getNextIterator =
  (target, iterator, { isValuesIterator }) =>
  () => {
    var _a, _b
    const result = iterator.next()
    if (result.done) return result
    const key = result.value
    let value = target.setMap.get(key)
    const currentDraft = getProxyDraft(value)
    const mutable =
      ((_b = (_a = target.options).mark) === null || _b === void 0
        ? void 0
        : _b.call(_a, value, dataTypes)) === dataTypes.mutable
    if (target.options.strict) checkReadable(key, target.options, mutable)
    if (
      !mutable &&
      !currentDraft &&
      isDraftable(key, target.options) &&
      !target.finalized &&
      target.original.has(key)
    ) {
      const proxy = internal.createDraft({
        original: key,
        parentDraft: target,
        key,
        finalities: target.finalities,
        options: target.options,
      })
      target.setMap.set(key, proxy)
      value = proxy
    } else if (currentDraft) value = currentDraft.proxy
    return {
      done: false,
      value: isValuesIterator ? value : [value, value],
    }
  }
var setHandler = {
  get size() {
    return getProxyDraft(this).setMap.size
  },
  has(value) {
    const target = getProxyDraft(this)
    if (target.setMap.has(value)) return true
    ensureShallowCopy(target)
    const valueProxyDraft = getProxyDraft(value)
    if (valueProxyDraft && target.setMap.has(valueProxyDraft.original))
      return true
    return false
  },
  add(value) {
    const target = getProxyDraft(this)
    if (!this.has(value)) {
      ensureShallowCopy(target)
      markChanged(target)
      target.assignedMap.set(value, true)
      target.setMap.set(value, value)
      markFinalization(target, value, value, generatePatches)
    }
    return this
  },
  delete(value) {
    if (!this.has(value)) return false
    const target = getProxyDraft(this)
    ensureShallowCopy(target)
    markChanged(target)
    const valueProxyDraft = getProxyDraft(value)
    if (valueProxyDraft && target.setMap.has(valueProxyDraft.original)) {
      target.assignedMap.set(valueProxyDraft.original, false)
      return target.setMap.delete(valueProxyDraft.original)
    }
    if (!valueProxyDraft && target.setMap.has(value))
      target.assignedMap.set(value, false)
    else target.assignedMap.delete(value)
    return target.setMap.delete(value)
  },
  clear() {
    if (!this.size) return
    const target = getProxyDraft(this)
    ensureShallowCopy(target)
    markChanged(target)
    for (const value of target.original) target.assignedMap.set(value, false)
    target.setMap.clear()
  },
  values() {
    const target = getProxyDraft(this)
    ensureShallowCopy(target)
    const iterator = target.setMap.keys()
    return {
      [Symbol.iterator]: () => this.values(),
      next: getNextIterator(target, iterator, { isValuesIterator: true }),
    }
  },
  entries() {
    const target = getProxyDraft(this)
    ensureShallowCopy(target)
    const iterator = target.setMap.keys()
    return {
      [Symbol.iterator]: () => this.entries(),
      next: getNextIterator(target, iterator, { isValuesIterator: false }),
    }
  },
  keys() {
    return this.values()
  },
  [iteratorSymbol]() {
    return this.values()
  },
  forEach(callback, thisArg) {
    const iterator = this.values()
    let result = iterator.next()
    while (!result.done) {
      callback.call(thisArg, result.value, result.value, this)
      result = iterator.next()
    }
  },
}
if (Set.prototype.difference)
  Object.assign(setHandler, {
    intersection(other) {
      return Set.prototype.intersection.call(new Set(this.values()), other)
    },
    union(other) {
      return Set.prototype.union.call(new Set(this.values()), other)
    },
    difference(other) {
      return Set.prototype.difference.call(new Set(this.values()), other)
    },
    symmetricDifference(other) {
      return Set.prototype.symmetricDifference.call(
        new Set(this.values()),
        other,
      )
    },
    isSubsetOf(other) {
      return Set.prototype.isSubsetOf.call(new Set(this.values()), other)
    },
    isSupersetOf(other) {
      return Set.prototype.isSupersetOf.call(new Set(this.values()), other)
    },
    isDisjointFrom(other) {
      return Set.prototype.isDisjointFrom.call(new Set(this.values()), other)
    },
  })
var setHandlerKeys = Reflect.ownKeys(setHandler)
var proxyHandler = {
  get(target, key, receiver) {
    var _a, _b
    const copy = (_a = target.copy) === null || _a === void 0 ? void 0 : _a[key]
    if (copy && target.finalities.draftsCache.has(copy)) return copy
    if (key === PROXY_DRAFT) return target
    let markResult
    if (target.options.mark) {
      const value =
        key === "size" &&
        (target.original instanceof Map || target.original instanceof Set)
          ? Reflect.get(target.original, key)
          : Reflect.get(target.original, key, receiver)
      markResult = target.options.mark(value, dataTypes)
      if (markResult === dataTypes.mutable) {
        if (target.options.strict) checkReadable(value, target.options, true)
        return value
      }
    }
    const source = latest(target)
    if (source instanceof Map && mapHandlerKeys.includes(key)) {
      if (key === "size")
        return Object.getOwnPropertyDescriptor(mapHandler, "size").get.call(
          target.proxy,
        )
      return mapHandler[key].bind(target.proxy)
    }
    if (source instanceof Set && setHandlerKeys.includes(key)) {
      if (key === "size")
        return Object.getOwnPropertyDescriptor(setHandler, "size").get.call(
          target.proxy,
        )
      return setHandler[key].bind(target.proxy)
    }
    if (!has(source, key)) {
      const desc = getDescriptor(source, key)
      return desc
        ? `value` in desc
          ? desc.value
          : (_b = desc.get) === null || _b === void 0
            ? void 0
            : _b.call(target.proxy)
        : void 0
    }
    const value = source[key]
    if (target.options.strict) checkReadable(value, target.options)
    if (target.finalized || !isDraftable(value, target.options)) return value
    if (value === peek(target.original, key)) {
      ensureShallowCopy(target)
      target.copy[key] = createDraft({
        original: target.original[key],
        parentDraft: target,
        key: target.type === 1 ? Number(key) : key,
        finalities: target.finalities,
        options: target.options,
      })
      if (typeof markResult === "function") {
        const subProxyDraft = getProxyDraft(target.copy[key])
        ensureShallowCopy(subProxyDraft)
        markChanged(subProxyDraft)
        return subProxyDraft.copy
      }
      return target.copy[key]
    }
    if (isDraft(value)) target.finalities.draftsCache.add(value)
    return value
  },
  set(target, key, value) {
    var _a
    if (target.type === 3 || target.type === 2)
      throw new Error(`Map/Set draft does not support any property assignment.`)
    let _key
    if (
      target.type === 1 &&
      key !== "length" &&
      !(
        Number.isInteger((_key = Number(key))) &&
        _key >= 0 &&
        (key === 0 || _key === 0 || String(_key) === String(key))
      )
    )
      throw new Error(
        `Only supports setting array indices and the 'length' property.`,
      )
    const desc = getDescriptor(latest(target), key)
    if (desc === null || desc === void 0 ? void 0 : desc.set) {
      desc.set.call(target.proxy, value)
      return true
    }
    const current = peek(latest(target), key)
    const currentProxyDraft = getProxyDraft(current)
    if (currentProxyDraft && isEqual(currentProxyDraft.original, value)) {
      target.copy[key] = value
      target.assignedMap =
        (_a = target.assignedMap) !== null && _a !== void 0
          ? _a
          : /* @__PURE__ */ new Map()
      target.assignedMap.set(key, false)
      return true
    }
    if (
      isEqual(value, current) &&
      (value !== void 0 || has(target.original, key))
    )
      return true
    ensureShallowCopy(target)
    markChanged(target)
    if (has(target.original, key) && isEqual(value, target.original[key]))
      target.assignedMap.delete(key)
    else target.assignedMap.set(key, true)
    target.copy[key] = value
    markFinalization(target, key, value, generatePatches)
    return true
  },
  has(target, key) {
    return key in latest(target)
  },
  ownKeys(target) {
    return Reflect.ownKeys(latest(target))
  },
  getOwnPropertyDescriptor(target, key) {
    const source = latest(target)
    const descriptor = Reflect.getOwnPropertyDescriptor(source, key)
    if (!descriptor) return descriptor
    return {
      writable: true,
      configurable: target.type !== 1 || key !== "length",
      enumerable: descriptor.enumerable,
      value: source[key],
    }
  },
  getPrototypeOf(target) {
    return Reflect.getPrototypeOf(target.original)
  },
  setPrototypeOf() {
    throw new Error(`Cannot call 'setPrototypeOf()' on drafts`)
  },
  defineProperty() {
    throw new Error(`Cannot call 'defineProperty()' on drafts`)
  },
  deleteProperty(target, key) {
    var _a
    if (target.type === 1)
      return proxyHandler.set.call(this, target, key, void 0, target.proxy)
    if (peek(target.original, key) !== void 0 || key in target.original) {
      ensureShallowCopy(target)
      markChanged(target)
      target.assignedMap.set(key, false)
    } else {
      target.assignedMap =
        (_a = target.assignedMap) !== null && _a !== void 0
          ? _a
          : /* @__PURE__ */ new Map()
      target.assignedMap.delete(key)
    }
    if (target.copy) delete target.copy[key]
    return true
  },
}
function createDraft(createDraftOptions) {
  const { original, parentDraft, key, finalities, options } = createDraftOptions
  const type = getType(original)
  const proxyDraft = {
    type,
    finalized: false,
    parent: parentDraft,
    original,
    copy: null,
    proxy: null,
    finalities,
    options,
    setMap: type === 3 ? new Map(original.entries()) : void 0,
  }
  if (key || "key" in createDraftOptions) proxyDraft.key = key
  const { proxy, revoke } = Proxy.revocable(
    type === 1 ? Object.assign([], proxyDraft) : proxyDraft,
    proxyHandler,
  )
  finalities.revoke.push(revoke)
  proxyDraft.proxy = proxy
  if (parentDraft) {
    const target = parentDraft
    target.finalities.draft.push((patches, inversePatches) => {
      var _a, _b
      const oldProxyDraft = getProxyDraft(proxy)
      let copy = target.type === 3 ? target.setMap : target.copy
      const draft = get(copy, key)
      const proxyDraft = getProxyDraft(draft)
      if (proxyDraft) {
        let updatedValue = proxyDraft.original
        if (proxyDraft.operated) updatedValue = getValue(draft)
        finalizeSetValue(proxyDraft)
        finalizePatches(proxyDraft, generatePatches, patches, inversePatches)
        if (target.options.enableAutoFreeze) {
          target.options.updatedValues =
            (_a = target.options.updatedValues) !== null && _a !== void 0
              ? _a
              : /* @__PURE__ */ new WeakMap()
          target.options.updatedValues.set(updatedValue, proxyDraft.original)
        }
        set(copy, key, updatedValue)
      }
      ;(_b = oldProxyDraft.callbacks) === null ||
        _b === void 0 ||
        _b.forEach((callback) => {
          callback(patches, inversePatches)
        })
    })
  } else {
    const target = getProxyDraft(proxy)
    target.finalities.draft.push((patches, inversePatches) => {
      finalizeSetValue(target)
      finalizePatches(target, generatePatches, patches, inversePatches)
    })
  }
  return proxy
}
internal.createDraft = createDraft
function finalizeDraft(
  result,
  returnedValue,
  patches,
  inversePatches,
  enableAutoFreeze,
) {
  var _a
  const proxyDraft = getProxyDraft(result)
  const original =
    (_a =
      proxyDraft === null || proxyDraft === void 0
        ? void 0
        : proxyDraft.original) !== null && _a !== void 0
      ? _a
      : result
  const hasReturnedValue = !!returnedValue.length
  if (
    proxyDraft === null || proxyDraft === void 0 ? void 0 : proxyDraft.operated
  )
    while (proxyDraft.finalities.draft.length > 0)
      proxyDraft.finalities.draft.pop()(patches, inversePatches)
  const state = hasReturnedValue
    ? returnedValue[0]
    : proxyDraft
      ? proxyDraft.operated
        ? proxyDraft.copy
        : proxyDraft.original
      : result
  if (proxyDraft) revokeProxy(proxyDraft)
  if (enableAutoFreeze)
    deepFreeze(
      state,
      state,
      proxyDraft === null || proxyDraft === void 0
        ? void 0
        : proxyDraft.options.updatedValues,
    )
  return [
    state,
    patches && hasReturnedValue
      ? [
          {
            op: Operation.Replace,
            path: [],
            value: returnedValue[0],
          },
        ]
      : patches,
    inversePatches && hasReturnedValue
      ? [
          {
            op: Operation.Replace,
            path: [],
            value: original,
          },
        ]
      : inversePatches,
  ]
}
function draftify(baseState, options) {
  var _a
  const finalities = {
    draft: [],
    revoke: [],
    handledSet: /* @__PURE__ */ new WeakSet(),
    draftsCache: /* @__PURE__ */ new WeakSet(),
  }
  let patches
  let inversePatches
  if (options.enablePatches) {
    patches = []
    inversePatches = []
  }
  const draft =
    ((_a = options.mark) === null || _a === void 0
      ? void 0
      : _a.call(options, baseState, dataTypes)) === dataTypes.mutable ||
    !isDraftable(baseState, options)
      ? baseState
      : createDraft({
          original: baseState,
          parentDraft: null,
          finalities,
          options,
        })
  return [
    draft,
    (returnedValue = []) => {
      const [finalizedState, finalizedPatches, finalizedInversePatches] =
        finalizeDraft(
          draft,
          returnedValue,
          patches,
          inversePatches,
          options.enableAutoFreeze,
        )
      return options.enablePatches
        ? [finalizedState, finalizedPatches, finalizedInversePatches]
        : finalizedState
    },
  ]
}
function handleReturnValue(options) {
  const { rootDraft, value, useRawReturn = false, isRoot = true } = options
  forEach(value, (key, item, source) => {
    const proxyDraft = getProxyDraft(item)
    if (
      proxyDraft &&
      rootDraft &&
      proxyDraft.finalities === rootDraft.finalities
    ) {
      options.isContainDraft = true
      const currentValue = proxyDraft.original
      if (source instanceof Set) {
        const arr = Array.from(source)
        source.clear()
        arr.forEach((_item) => source.add(key === _item ? currentValue : _item))
      } else set(source, key, currentValue)
    } else if (typeof item === "object" && item !== null) {
      options.value = item
      options.isRoot = false
      handleReturnValue(options)
    }
  })
  if (isRoot) {
    if (!options.isContainDraft)
      console.warn(
        `The return value does not contain any draft, please use 'rawReturn()' to wrap the return value to improve performance.`,
      )
    if (useRawReturn)
      console.warn(
        `The return value contains drafts, please don't use 'rawReturn()' to wrap the return value.`,
      )
  }
}
function getCurrent(target) {
  var _a
  const proxyDraft = getProxyDraft(target)
  if (
    !isDraftable(
      target,
      proxyDraft === null || proxyDraft === void 0
        ? void 0
        : proxyDraft.options,
    )
  )
    return target
  const type = getType(target)
  if (proxyDraft && !proxyDraft.operated) return proxyDraft.original
  let currentValue
  function ensureShallowCopy() {
    currentValue =
      type === 2
        ? !isBaseMapInstance(target)
          ? new (Object.getPrototypeOf(target).constructor)(target)
          : new Map(target)
        : type === 3
          ? Array.from(proxyDraft.setMap.values())
          : shallowCopy(
              target,
              proxyDraft === null || proxyDraft === void 0
                ? void 0
                : proxyDraft.options,
            )
  }
  if (proxyDraft) {
    proxyDraft.finalized = true
    try {
      ensureShallowCopy()
    } finally {
      proxyDraft.finalized = false
    }
  } else currentValue = target
  forEach(currentValue, (key, value) => {
    if (proxyDraft && isEqual(get(proxyDraft.original, key), value)) return
    const newValue = getCurrent(value)
    if (newValue !== value) {
      if (currentValue === target) ensureShallowCopy()
      set(currentValue, key, newValue)
    }
  })
  if (type === 3) {
    const value =
      (_a =
        proxyDraft === null || proxyDraft === void 0
          ? void 0
          : proxyDraft.original) !== null && _a !== void 0
        ? _a
        : currentValue
    return !isBaseSetInstance(value)
      ? new (Object.getPrototypeOf(value).constructor)(currentValue)
      : new Set(currentValue)
  }
  return currentValue
}
function current(target) {
  if (!isDraft(target))
    throw new Error(`current() is only used for Draft, parameter: ${target}`)
  return getCurrent(target)
}
/**
 * `makeCreator(options)` to make a creator function.
 *
 * ## Example
 *
 * ```ts
 * import { makeCreator } from '../index';
 *
 * const baseState = { foo: { bar: 'str' }, arr: [] };
 * const create = makeCreator({ enableAutoFreeze: true });
 * const state = create(
 *   baseState,
 *   (draft) => {
 *     draft.foo.bar = 'str2';
 *   },
 * );
 *
 * expect(state).toEqual({ foo: { bar: 'str2' }, arr: [] });
 * expect(state).not.toBe(baseState);
 * expect(state.foo).not.toBe(baseState.foo);
 * expect(state.arr).toBe(baseState.arr);
 * expect(Object.isFrozen(state)).toBeTruthy();
 * ```
 */
var makeCreator = (arg) => {
  if (
    arg !== void 0 &&
    Object.prototype.toString.call(arg) !== "[object Object]"
  )
    throw new Error(
      `Invalid options: ${String(arg)}, 'options' should be an object.`,
    )
  return function create(arg0, arg1, arg2) {
    var _a, _b, _c
    if (typeof arg0 === "function" && typeof arg1 !== "function")
      return function (base, ...args) {
        return create(base, (draft) => arg0.call(this, draft, ...args), arg1)
      }
    const base = arg0
    const mutate = arg1
    let options = arg2
    if (typeof arg1 !== "function") options = arg1
    if (
      options !== void 0 &&
      Object.prototype.toString.call(options) !== "[object Object]"
    )
      throw new Error(
        `Invalid options: ${options}, 'options' should be an object.`,
      )
    options = Object.assign(Object.assign({}, arg), options)
    const state = isDraft(base) ? current(base) : base
    const mark = Array.isArray(options.mark)
      ? (value, types) => {
          for (const mark of options.mark) {
            if (typeof mark !== "function")
              throw new Error(
                `Invalid mark: ${mark}, 'mark' should be a function.`,
              )
            const result = mark(value, types)
            if (result) return result
          }
        }
      : options.mark
    const enablePatches =
      (_a = options.enablePatches) !== null && _a !== void 0 ? _a : false
    const strict = (_b = options.strict) !== null && _b !== void 0 ? _b : false
    const _options = {
      enableAutoFreeze:
        (_c = options.enableAutoFreeze) !== null && _c !== void 0 ? _c : false,
      mark,
      strict,
      enablePatches,
    }
    if (
      !isDraftable(state, _options) &&
      typeof state === "object" &&
      state !== null
    )
      throw new Error(
        `Invalid base state: create() only supports plain objects, arrays, Set, Map or using mark() to mark the state as immutable.`,
      )
    const [draft, finalize] = draftify(state, _options)
    if (typeof arg1 !== "function") {
      if (!isDraftable(state, _options))
        throw new Error(
          `Invalid base state: create() only supports plain objects, arrays, Set, Map or using mark() to mark the state as immutable.`,
        )
      return [draft, finalize]
    }
    let result
    try {
      result = mutate(draft)
    } catch (error) {
      revokeProxy(getProxyDraft(draft))
      throw error
    }
    const returnValue = (value) => {
      const proxyDraft = getProxyDraft(draft)
      if (!isDraft(value)) {
        if (
          value !== void 0 &&
          !isEqual(value, draft) &&
          (proxyDraft === null || proxyDraft === void 0
            ? void 0
            : proxyDraft.operated)
        )
          throw new Error(
            `Either the value is returned as a new non-draft value, or only the draft is modified without returning any value.`,
          )
        const rawReturnValue =
          value === null || value === void 0 ? void 0 : value[RAW_RETURN_SYMBOL]
        if (rawReturnValue) {
          const _value = rawReturnValue[0]
          if (_options.strict && typeof value === "object" && value !== null)
            handleReturnValue({
              rootDraft: proxyDraft,
              value,
              useRawReturn: true,
            })
          return finalize([_value])
        }
        if (value !== void 0) {
          if (typeof value === "object" && value !== null)
            handleReturnValue({
              rootDraft: proxyDraft,
              value,
            })
          return finalize([value])
        }
      }
      if (value === draft || value === void 0) return finalize([])
      const returnedProxyDraft = getProxyDraft(value)
      if (_options === returnedProxyDraft.options) {
        if (returnedProxyDraft.operated)
          throw new Error(`Cannot return a modified child draft.`)
        return finalize([current(value)])
      }
      return finalize([value])
    }
    if (result instanceof Promise)
      return result.then(returnValue, (error) => {
        revokeProxy(getProxyDraft(draft))
        throw error
      })
    return returnValue(result)
  }
}
/**
 * `create(baseState, callback, options)` to create the next state
 *
 * ## Example
 *
 * ```ts
 * import { create } from '../index';
 *
 * const baseState = { foo: { bar: 'str' }, arr: [] };
 * const state = create(
 *   baseState,
 *   (draft) => {
 *     draft.foo.bar = 'str2';
 *   },
 * );
 *
 * expect(state).toEqual({ foo: { bar: 'str2' }, arr: [] });
 * expect(state).not.toBe(baseState);
 * expect(state.foo).not.toBe(baseState.foo);
 * expect(state.arr).toBe(baseState.arr);
 * ```
 */
var create = makeCreator()
Object.prototype.constructor.toString()
//#endregion
//#region ../../../packages/store/src/entities.js
/**
 * @typedef {Object.<string, any>} Entity - An object representing an entity.
 * @typedef {Object.<string, Entity>} Entities - A collection of named entities.
 */
/**
 * Augments a single entity by adding a unique ID.
 *
 * @param {string} id The unique ID for the entity.
 * @param {Entity} entity The raw entity object.
 * @returns {Entity} The augmented entity, including its ID.
 */
function augmentEntity(id, entity) {
  return {
    ...entity,
    id,
  }
}
/**
 * Augments a collection of raw entities, adding a unique ID to each one.
 *
 * @param {Entities} entities The raw entities to be augmented.
 * @returns {Entities} The augmented entities.
 */
function augmentEntities(entities) {
  return map(entities, augmentEntity)
}
//#endregion
//#region ../../../packages/store/src/event-map.js
/**
 * @typedef {Object.<string, any>} Type - An object representing an augmented entity type.
 * @typedef {Object.<string, any>} Entity - An object representing a entity.
 */
var SPLIT_LIMIT = 2
/**
 * A class to manage the mapping of event names to the entity IDs that handle them.
 * This is used for optimized event handling with support for scoped events.
 */
var EventMap = class {
  /**
   * Creates an instance of EventMap and initializes it with entities and their types.
   *
   * @param {Object.<string, Type>} types - An object containing all augmented type definitions.
   * @param {Object.<string, Entity>} entities - An object containing all entities.
   */
  constructor(types, entities) {
    /**
     * Maps handler names to type names to Sets of entity IDs.
     * Structure: handlerName -> typeName -> Set<entityId>
     * Example: 'submit' -> 'form' -> Set(['loginForm', 'signupForm'])
     *
     * @type {Map<string, Map<string, Set<string>>>}
     */
    this.handlerToTypeToEntities = /* @__PURE__ */ new Map()
    /**
     * Maps entity IDs to their type names for quick lookup.
     *
     * @type {Map<string, string>}
     */
    this.entityTypes = /* @__PURE__ */ new Map()
    for (const entityId in entities) {
      const entity = entities[entityId]
      const type = types[entity.type]
      if (type) this.addEntity(entityId, type, entity.type)
    }
  }
  /**
   * Adds an entity's ID to the Sets for all event handlers defined in its type.
   * This should be called when a new entity is created or its type is changed via setType.
   *
   * @param {string} entityId - The ID of the entity.
   * @param {Type} type - The augmented type object of the entity.
   * @param {string} typeName - The name of the entity's type.
   */
  addEntity(entityId, type, typeName) {
    this.entityTypes.set(entityId, typeName)
    for (const handlerName in type) {
      if (typeof type[handlerName] !== "function") continue
      if (!this.handlerToTypeToEntities.has(handlerName))
        this.handlerToTypeToEntities.set(handlerName, /* @__PURE__ */ new Map())
      const typeMap = this.handlerToTypeToEntities.get(handlerName)
      if (!typeMap.has(typeName))
        typeMap.set(typeName, /* @__PURE__ */ new Set())
      typeMap.get(typeName).add(entityId)
    }
  }
  /**
   * Removes an entity's ID from the Sets for all event handlers defined in its type.
   * This should be called when an entity is removed or its type is changed via setType.
   *
   * @param {string} entityId - The ID of the entity.
   * @param {Type} type - The augmented type object of the entity.
   * @param {string} typeName - The name of the entity's type.
   */
  removeEntity(entityId, type, typeName) {
    this.entityTypes.delete(entityId)
    for (const handlerName in type) {
      const typeMap = this.handlerToTypeToEntities.get(handlerName)
      if (typeMap) {
        const entitySet = typeMap.get(typeName)
        if (entitySet) entitySet.delete(entityId)
      }
    }
  }
  /**
   * Retrieves the array of entity IDs that should handle a given event.
   * Supports scoped events:
   * - 'submit' -> all entities with 'submit' handler
   * - 'form:submit' -> all form entities with 'submit' handler
   * - 'form#loginForm:submit' -> only loginForm entity (of type form)
   * - '#loginForm:submit' -> only loginForm entity
   *
   * @param {string} eventString - The event string (e.g., 'submit', 'form:submit', 'form[id]:submit')
   * @returns {string[]} An array of entity IDs that should handle this event.
   */
  getEntitiesForEvent(eventString) {
    const {
      type: targetType,
      entityId: targetEntityId,
      event: handlerName,
    } = parseEvent(eventString)
    const typeMap = this.handlerToTypeToEntities.get(handlerName)
    if (!typeMap) return []
    if (targetEntityId) {
      const type = targetType ?? this.entityTypes.get(targetEntityId)
      const entitySet = typeMap.get(type)
      return entitySet && entitySet.has(targetEntityId) ? [targetEntityId] : []
    }
    if (targetType) {
      const entitySet = typeMap.get(targetType)
      return entitySet ? Array.from(entitySet) : []
    }
    const allEntities = []
    for (const entitySet of typeMap.values()) allEntities.push(...entitySet)
    return allEntities
  }
}
/**
 * Parses an event string into its components.
 * @param {string} eventString - The event string (e.g., 'submit', 'form:submit', 'form#loginForm:submit')
 * @returns {{ type: string|null, entityId: string|null, event: string }}
 */
function parseEvent(eventString) {
  const [left, event] = eventString.split(":", SPLIT_LIMIT)
  if (!event)
    return {
      type: null,
      entityId: null,
      event: left,
    }
  const [type, entityId] = left.split("#", SPLIT_LIMIT)
  return {
    type: type || null,
    entityId: entityId || null,
    event,
  }
}
//#endregion
//#region ../../../packages/store/src/middlewares.js
/**
 * Applies a list of middleware functions to a store's dispatch method.
 * @param {...Function} middlewares The middleware functions to apply.
 * @returns {Function} A store enhancer function.
 */
function applyMiddlewares(...middlewares) {
  return (store) => {
    let dispatch = () => {
      throw new Error(
        "Dispatching while constructing your middleware is not allowed.",
      )
    }
    const middlewareStore = {
      ...store,
      dispatch: (...args) => dispatch(...args),
      notify: (type, payload) =>
        dispatch({
          type,
          payload,
        }),
    }
    dispatch = compose(
      ...middlewares.map((middleware) => middleware(middlewareStore)),
    )(store.dispatch)
    return {
      ...middlewareStore,
      dispatch,
      notify: (type, payload) =>
        dispatch({
          type,
          payload,
        }),
    }
  }
}
//#endregion
//#region ../../../packages/store/src/types.js
/**
 * Augments a single type by composing its behaviors and mixins.
 * If a behavior is an object, it's treated as a mixin and its properties are extended onto the type.
 * If a behavior is a function, it's called with the current type object to apply its logic.
 *
 * @param {Type|AugmentFunction[]} type The raw type definition, which can be an object or an array of mixins/functions.
 * @returns {Type} The fully composed and augmented type object.
 */
function augmentType(type) {
  return pipe(
    ...ensureArray(type).map(
      (behavior) => (type) =>
        extend(
          type,
          typeof behavior === "function" ? behavior(type) : behavior,
        ),
    ),
  )({})
}
/**
 * @typedef {Object.<string, any>} Type - An object representing an entity's base type or a behavioral mixin.
 * @typedef {Object.<string, Type>} Types - A collection of named type definitions.
 * @typedef {Function} AugmentFunction - A function that applies augmentations.
 */
/**
 * Augments a collection of raw type definitions into a usable format.
 * This process applies all behaviors and mixins to each type.
 *
 * @param {Types} types The raw types to be augmented.
 * @returns {Types} The augmented types, with all behaviors composed.
 */
function augmentTypes(types) {
  return map(types, (_, type) => augmentType(type))
}
//#endregion
//#region ../../../packages/store/src/store.js
/** Copies only the entities that change, using a draft proxy. */
var STRUCTURAL_SHARING = "structural-sharing"
var UPDATE_STRATEGIES = [STRUCTURAL_SHARING, "full-clone"]
/**
 * Creates a store to manage state and events.
 *
 * Events are queued and drained by {@link createStore|update}. The `updateStrategy` option
 * controls how the state is copied before the queued events are applied:
 *
 * - `"structural-sharing"` (default) - Applies events to a draft proxy, so only the entities
 *   that actually changed are copied. Unchanged entities keep their previous reference, which
 *   makes change detection cheap for consumers that rely on reference equality. This is the
 *   right choice for UI stores, where a small number of entities change at a time.
 * - `"full-clone"` - Deep-clones the whole state with `structuredClone` and applies events directly
 *   to the copy, without a proxy. The cost is proportional to the total state size on every
 *   update, but there is no per-entity proxy overhead, so it scales better when thousands of
 *   entities change every frame, as in a game simulation.
 *
 * Under both strategies the current state is kept intact while the queued events are applied to a
 * separate draft, and the two are swapped only once every event has been processed. Handlers and
 * systems therefore always receive the draft as their first argument and mutate it directly, and
 * subscribers are notified only after the swap. This also means that, during an update,
 * `api.getEntity()` and `api.getEntities()` read the *previous* state rather than the in-flight
 * changes, under either strategy.
 *
 * @param {StoreConfig} config - Configuration options for the store.
 * @param {Types} [config.types] - The initial types configuration.
 * @param {Entities} [config.entities] - The initial entities configuration.
 * @param {Object[]} [config.systems] - The initial systems configuration.
 * @param {Function[]} [config.middlewares] - The initial middlewares configuration.
 * @param {boolean} [config.autoCreateEntities=false] - Creates entities if not defined in `config.entities`.
 * @param {"auto" | "manual"} [config.updateMode="auto"] - Whether each event triggers an update, or updates are batched until `update()` is called.
 * @param {UpdateStrategy} [config.updateStrategy="structural-sharing"] - How the state is copied before events are applied.
 * @returns {Store} The store with methods to interact with state and events.
 * @throws {TypeError} If `updateStrategy` is not a supported strategy.
 */
function createStore({
  types: originalTypes = {},
  entities: originalEntities = {},
  systems = [],
  middlewares = [],
  autoCreateEntities = false,
  updateMode = "auto",
  updateStrategy = STRUCTURAL_SHARING,
} = {}) {
  assertUpdateStrategy(updateStrategy)
  const listeners = /* @__PURE__ */ new Set()
  const types = augmentTypes(originalTypes)
  let state, eventMap, incomingEvents, isProcessing, isHalted
  reset()
  const baseStore = {
    subscribe,
    update,
    notify,
    dispatch,
    getTypes,
    getType,
    setType,
    getState,
    setState,
    reset,
  }
  const store = middlewares.length
    ? applyMiddlewares(...middlewares)(baseStore)
    : baseStore
  const api = createApi(store, store.extras)
  store._api = api
  if (updateMode === "auto" && incomingEvents.length) update()
  return store
  /**
   * Subscribes a listener to state updates.
   * @param {Function} listener - The listener function to call on updates.
   * @returns {Function} A function to unsubscribe the listener.
   */
  function subscribe(listener) {
    listeners.add(listener)
    return function unsubscribe() {
      listeners.delete(listener)
    }
  }
  /**
   * Updates the state based on elapsed time and processes events.
   *
   * The current state is left untouched while the queued events are applied to a separate
   * draft, according to the configured `updateStrategy`. The draft only replaces the current
   * state once every queued event has been processed, and subscribers are notified afterwards.
   *
   * @returns {Event[]} The events processed during this update.
   */
  function update() {
    if (isProcessing) return []
    isProcessing = true
    const processedEvents = []
    let nextState
    if (updateStrategy === STRUCTURAL_SHARING)
      nextState = create(state, patch, {
        enableAutoFreeze: state.game?.devMode,
      })
    else {
      const draft = structuredClone(state)
      patch(draft)
      nextState = draft
    }
    state = nextState
    isProcessing = false
    listeners.forEach((onUpdate) => onUpdate())
    return processedEvents
    /**
     * Applies every queued event to the given draft.
     *
     * The draft is either the proxy returned by `create` (structural sharing) or the
     * deep copy produced by `structuredClone` (full clone). The current state is not
     * modified, and only becomes the new state once this function returns.
     *
     * @param {Entities} draft - The draft to apply the queued events to.
     * @returns {void}
     */
    function patch(draft) {
      while (incomingEvents.length) {
        const event = incomingEvents.shift()
        processedEvents.push(event)
        if (event.type === "pause") isHalted = true
        if (event.type === "resume") isHalted = false
        if (event.type === "add") {
          addEntity(draft, event.payload)
          continue
        }
        if (event.type === "remove") {
          removeEntity(draft, event.payload)
          continue
        }
        const { event: handlerName } = parseEvent(event.type)
        const entityIds = eventMap.getEntitiesForEvent(event.type)
        const halted = isHalted && handlerName === "update"
        for (const id of entityIds) {
          const entity = draft[id]
          const type = types[entity.type]
          if (halted && !entity.updatesWhilePaused) continue
          const handle = type[handlerName]
          handle?.(entity, event.payload, api)
        }
        if (event.type.endsWith(":destroy")) {
          const [target] = event.type.split(":")
          const [, id] = target.split("#")
          const entity = draft[id]
          if (entity) {
            const type = types[entity.type]
            const typeName = entity.type
            delete draft[id]
            eventMap.removeEntity(id, type, typeName)
          }
        }
        systems.forEach((system) => {
          const handle = system[handlerName]
          handle?.(draft, event.payload, api)
        })
      }
    }
  }
  /**
   * Notifies the store of a new event.
   * Supports scoped events:
   * - 'submit' - broadcast to all entities with submit handler
   * - 'form:submit' - only form entities
   * - 'form[loginForm]:submit' - only loginForm entity
   *
   * Two of these are the store's own. 'pause' stops the store handing out 'update'
   * events, and 'resume' starts it again, which is how anything that moves by
   * integrating a delta time stops without being told about it. A type declares
   * `updatesWhilePaused` to keep updating regardless. Both keep dispatching to types
   * that handle them, unlike 'add' and 'remove'.
   *
   * @param {string} type - The event type to notify.
   * @param {any} payload - The event payload.
   */
  function notify(type, payload) {
    store.dispatch({
      type,
      payload,
    })
  }
  /**
   * Dispatches an event to be processed in the next update cycle.
   * @param {Object} event - The event object.
   * @param {string} event.type - The type of the event.
   * @param {any} [event.payload] - The payload of the event.
   */
  function dispatch(event) {
    incomingEvents.push(event)
    if (updateMode === "auto") update()
  }
  /**
   * Retrieves the augmented types configuration.
   * This includes composed behaviors and event handlers wrapped for immutability.
   * @returns {Object} The augmented types configuration.
   */
  function getTypes() {
    return types
  }
  /**
   * Retrieves an augmented type configuration given its name.
   * @param {string} typeName - The type of the entity.
   * @returns {Object} The augmented type configuration.
   */
  function getType(typeName) {
    return types[typeName]
  }
  /**
   * Sets an augmented type configuration given its name.
   * @param {string} typeName - The name of the type to set.
   * @param {Type} type - The type configuration.
   * @returns {void}
   */
  function setType(typeName, type) {
    const oldType = types[typeName]
    originalTypes[typeName] = type
    types[typeName] = augmentType(type)
    const newType = types[typeName]
    for (const [id, entity] of Object.entries(state))
      if (entity.type === typeName) {
        eventMap.removeEntity(id, oldType, typeName)
        eventMap.addEntity(id, newType, typeName)
      }
    const entityId = toCamelCase(typeName)
    if (autoCreateEntities && !state[entityId])
      notify("add", {
        id: entityId,
        type: typeName,
      })
  }
  /**
   * Retrieves the current state.
   * @returns {Object} The current state.
   */
  function getState() {
    return state
  }
  /**
   * Sets the entire state of the store.
   * This is useful for importing state or setting initial state from a server.
   * @param {Entities} nextState - The new state to set.
   * @returns {void}
   */
  function setState(nextState) {
    const oldEntities = state ?? {}
    let newEntities = augmentEntities(nextState)
    const oldEntityIds = new Set(Object.keys(oldEntities))
    const newEntityIds = new Set(Object.keys(newEntities))
    const entitiesToCreate = [...newEntityIds].filter(
      (id) => !oldEntityIds.has(id),
    )
    const entitiesToDestroy = [...oldEntityIds].filter(
      (id) => !newEntityIds.has(id),
    )
    const entitiesToUpdate = [...newEntityIds].filter((id) =>
      oldEntityIds.has(id),
    )
    state = oldEntities
    eventMap = new EventMap(types, oldEntities)
    incomingEvents = []
    isProcessing = false
    entitiesToDestroy.forEach((id) => {
      removeEntity(state, id)
    })
    entitiesToCreate.forEach((id) => {
      const entity = newEntities[id]
      addEntity(state, {
        id,
        ...entity,
      })
    })
    entitiesToUpdate.forEach((id) => {
      const oldType = oldEntities[id].type
      const newEntity = newEntities[id]
      state[id] = newEntity
      if (newEntity.type !== oldType) {
        eventMap.removeEntity(id, types[oldType], oldType)
        eventMap.addEntity(id, types[newEntity.type], newEntity.type)
      }
    })
    if (autoCreateEntities)
      for (const typeName of Object.keys(types)) {
        const entityId = toCamelCase(typeName)
        if (!Object.values(state).some((entity) => entity.type === typeName))
          addEntity(state, {
            id: entityId,
            type: typeName,
          })
      }
  }
  /**
   * Resets the store to its initial state.
   * @returns {void}
   */
  function reset() {
    isHalted = false
    setState(originalEntities)
  }
  /**
   * Adds an entity to the state and registers its event handlers.
   * @param {Entities} draft - The draft (structural sharing) or the copy (full clone) to mutate.
   * @param {Entity} payload - The entity to add, including its id.
   * @returns {void}
   */
  function addEntity(draft, payload) {
    const { id, ...entity } = payload
    draft[id] = augmentEntity(id, entity)
    const type = types[entity.type]
    eventMap.addEntity(id, type, entity.type)
    incomingEvents.unshift({ type: `#${id}:create` })
  }
  /**
   * Queues the destruction of an entity. The entity is removed by the `#id:destroy` event.
   * @param {Entities} draft - The draft (structural sharing) or the copy (full clone) to mutate.
   * @param {string} id - The id of the entity to remove.
   * @returns {void}
   */
  function removeEntity(draft, id) {
    incomingEvents.unshift({ type: `#${id}:destroy` })
  }
}
/**
 * Validates the given update strategy.
 * @param {UpdateStrategy} updateStrategy - The update strategy to validate.
 * @returns {void}
 * @throws {TypeError} If the update strategy is not supported.
 */
function assertUpdateStrategy(updateStrategy) {
  if (UPDATE_STRATEGIES.includes(updateStrategy)) return
  throw new TypeError(
    `Unsupported update strategy: ${updateStrategy}. Expected one of: ${UPDATE_STRATEGIES.join(", ")}.`,
  )
}
/**
 * @typedef {"structural-sharing" | "full-clone"} UpdateStrategy - How the state is copied before events are applied.
 * @typedef {Object} StoreConfig - Configuration options accepted by {@link createStore}.
 * @typedef {Object.<string, any>} Type - An augmented entity type.
 * @typedef {Object.<string, Type>} Types - A collection of augmented types.
 * @typedef {Object.<string, any>} Entity - An object representing an entity.
 * @typedef {Object.<string, Entity>} Entities - A collection of entities indexed by id.
 * @typedef {(listener: () => void) => () => void} Listener - Subscribes to state updates and returns an unsubscribe function.
 * @typedef {Object} Store - The store returned by {@link createStore}.
 */
//#endregion
//#region ../../../packages/utils/src/math/numbers.js
/**
 * Returns the absolute value of a number.
 * @param {number} num - The number to get the absolute value of.
 * @returns {number} The absolute value of the input number.
 */
function abs(num) {
  return Math.abs(num)
}
/**
 * Clamps a number within the inclusive range specified by min and max.
 * @param {number} num - The number to clamp.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} The clamped value.
 */
function clamp$1(num, min, max) {
  if (num < min) return min
  if (num > max) return max
  return num
}
/**
 * Checks if a number is between a minimum and maximum value, inclusive.
 * @param {number} num - The number to check.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {boolean} True if the number is between min and max, false otherwise.
 */
function isBetween(num, min, max) {
  return num >= min && num <= max
}
/**
 * Computes the modulus of two numbers, ensuring a positive result.
 * If the divisor is zero, it returns the dividend to avoid `NaN`.
 * @param {number} dividend - The number to be divided.
 * @param {number} divisor - The number to divide by.
 * @returns {number} The modulus result.
 */
function mod$1(dividend, divisor) {
  if (!divisor) return dividend
  return ((dividend % divisor) + divisor) % divisor
}
//#endregion
//#region ../../../packages/utils/src/math/triangle.js
/**
 * Calculates the length of the hypothenuse (or magnitude) for a given set of numbers
 * using the Pythagorean theorem.
 * @param {number[]} nums - A list of numbers representing the sides of a right triangle.
 * @returns {number} The length of the hypothenuse.
 */
function hypothenuse(...nums) {
  return Math.hypot(...nums)
}
//#endregion
//#region ../../../packages/utils/src/math/vectors.js
/**
 * @typedef {import("../../types/math/vectors").Vector} Vector
 * @typedef {import("../../types/math/vectors").Vector2} Vector2
 * @typedef {import("../../types/math/vectors").Vector3} Vector3
 * @typedef {import("../../types/math/vectors").Vector7} Vector7
 */
/**
 * The vector with every component at zero. Useful for naming the components you
 * care about, and for building a vector up from scratch:
 *
 *     const [, NO_RISE, NO_DEPTH] = ZERO_VECTOR
 *     const position = v(10, 20, NO_DEPTH)
 *
 * Vectors are mutable arrays, so copy it rather than storing it where something
 * writes to one, such as an entity position. Copy it with `v(...ZERO_VECTOR)`,
 * since a plain spread drops the tag `isVector` looks for.
 */
var ZERO_VECTOR = v(0, 0, 0)
v(1, 0, 0)
/**
 * Alias for the sum function.
 * @type {typeof sum}
 */
var add = sum
/**
 * Clamps the magnitude of the vector between the given min and max values.
 * @param {Vector} vector - The input vector.
 * @param {number|Vector} min - The minimum magnitude or a vector representing the lower bounds for each component.
 * @param {number|Vector} max - The maximum magnitude or a vector representing the upper bounds for each component.
 * @returns {Vector} The clamped vector.
 */
function clamp(vector, min, max) {
  const length = magnitude(vector)
  if (typeof min === "number" && length < min) return setMagnitude(vector, min)
  if (typeof max === "number" && length > max) return setMagnitude(vector, max)
  if (typeof min !== "number" && typeof max !== "number")
    return v(
      ...vector.map((coordinate, index) =>
        clamp$1(coordinate, min[index], max[index]),
      ),
    )
  return vector
}
/**
 * Computes the distance between multiple vectors.
 * @param {...Vector2 | Vector3} vectors - The vectors to compute the distance between.
 * @returns {number} The distance between the vectors.
 */
function distance(...vectors) {
  return magnitude(subtract(...vectors))
}
/**
 * Computes the component-wise division of vectors. A scalar operand is applied
 * to every component.
 * @param {...(Vector2 | Vector3 | number)} operands - The vectors to divide, or a scalar to divide each component by.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function divide(...operands) {
  return v(...operands.reduce(divideCoordinates))
}
/**
 * Divides a scalar by each component of the vector.
 * @param {number} scalar - The dividend.
 * @param {Vector} vector - The divisor vector.
 * @returns {Vector} The resulting vector.
 */
function divideBy(scalar, vector) {
  return v(...vector.map((coordinate) => scalar / coordinate))
}
/**
 * Computes the dot product of multiple vectors.
 * @param {...Vector2 | Vector3} vectors - The vectors to compute the dot product for.
 * @returns {number} The resulting scalar value of the dot product.
 */
function dot(...vectors) {
  return vectors
    .reduce(dotMultiplyCoordinates)
    .reduce((coord1, coord2) => coord1 + coord2)
}
/**
 * Checks if a value is a vector.
 * This is determined by checking for the `__isVector__` property, which is
 * added by the `v()` factory function for efficient type checking.
 * @param {*} value - The value to check.
 * @returns {boolean} True if the value is a vector, false otherwise.
 */
function isVector(value) {
  return !!value?.__isVector__
}
/**
 * Calculates the magnitude (length) of the vector.
 * @param {Vector} vector - The input vector.
 * @returns {number} The magnitude of the vector.
 */
function magnitude(vector) {
  return hypothenuse(...vector)
}
/**
 * Computes the component-wise modulus of vectors. A scalar operand is applied
 * to every component.
 * @param {...(Vector2 | Vector3 | number)} operands - The vectors to compute the modulus for, or a scalar divisor for each component.
 * @returns {Vector2 | Vector3} The resulting vector after the modulus.
 */
function mod(...operands) {
  return v(...operands.reduce(modCoordinates))
}
/**
 * Calculates the modulus of a scalar with each component of the vector.
 * @param {number} scalar - The dividend.
 * @param {Vector} vector - The divisor vector.
 * @returns {Vector} The resulting vector.
 */
function modOf(scalar, vector) {
  return v(...vector.map((coordinate) => mod$1(scalar, coordinate)))
}
/**
 * Computes the component-wise multiplication of vectors. A scalar operand is
 * applied to every component.
 * @param {...(Vector2 | Vector3 | number)} operands - The vectors to multiply, or a scalar to multiply each component by.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function multiply(...operands) {
  return v(...operands.reduce(multiplyCoordinates))
}
/**
 * Normalizes the vector to have a magnitude of 1.
 * @param {Vector} vector - The input vector.
 * @returns {Vector} The normalized vector.
 */
function normalize(vector) {
  const length = magnitude(vector)
  return v(...vector.map((coordinate) => coordinate / length))
}
/**
 * Alias for the multiply function.
 * @type {typeof multiply}
 */
var scale$1 = multiply
/**
 * Sets the magnitude of the vector while maintaining its direction.
 * @param {Vector} vector - The input vector.
 * @param {number} length - The new magnitude.
 * @returns {Vector} The vector with the updated magnitude.
 */
function setMagnitude(vector, length) {
  return scale$1(normalize(vector), length)
}
/**
 * Subtracts multiple vectors.
 * @param {...Vector2 | Vector3} vectors - The vectors to subtract.
 * @returns {Vector2 | Vector3} The resulting vector after subtraction.
 */
function subtract(...vectors) {
  return v(...vectors.reduce(subtractCoordinates))
}
/**
 * Sums multiple vectors.
 * @param {...Vector2 | Vector3} vectors - The vectors to sum.
 * @returns {Vector2 | Vector3} The resulting vector after summation.
 */
function sum(...vectors) {
  return v(...vectors.reduce(sumCoordinates))
}
/**
 * Creates a zero vector of 3 dimensions.
 * @returns {Vector3} The zero vector.
 */
function zero() {
  return v(...ZERO_VECTOR)
}
/**
 * Reads the value at the given index of a vector operand, broadcasting a
 * scalar operand to every index.
 * @param {number | Vector2 | Vector3 | Vector7} operand - A vector or a scalar.
 * @param {number} index - The index of the coordinate to read.
 * @returns {number} The coordinate value.
 */
function broadcast(operand, index) {
  return typeof operand === "number" ? operand : operand[index]
}
/**
 * Divides the coordinates of two vectors component-wise. Scalars are broadcast.
 * @param {Vector2 | Vector3} vector1 - The dividend vector.
 * @param {number | Vector2 | Vector3} vector2 - The divisor vector or scalar.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function divideCoordinates(vector1, vector2) {
  return v(
    ...vector1.map(
      (coordinate, index) => coordinate / broadcast(vector2, index),
    ),
  )
}
/**
 * Multiplies the coordinates of two vectors component-wise. Scalars are broadcast.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {number | Vector2 | Vector3} vector2 - The second vector or scalar.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function dotMultiplyCoordinates(vector1, vector2) {
  return v(...vector1.map((coordinate, index) => coordinate * vector2[index]))
}
/**
 * Computes the component-wise modulus of two vectors. Scalars are broadcast.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {number | Vector2 | Vector3} vector2 - The second vector or scalar.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function modCoordinates(vector1, vector2) {
  return v(
    ...vector1.map((coordinate, index) =>
      mod$1(coordinate, broadcast(vector2, index)),
    ),
  )
}
/**
 * Multiplies the coordinates of two vectors component-wise. Scalars are broadcast.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {number | Vector2 | Vector3} vector2 - The second vector or scalar.
 * @returns {Vector2 | Vector3} The resulting vector.
 */
function multiplyCoordinates(vector1, vector2) {
  return v(
    ...vector1.map(
      (coordinate, index) => coordinate * broadcast(vector2, index),
    ),
  )
}
/**
 * Subtracts the coordinates of two vectors.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {Vector2 | Vector3} vector2 - The second vector.
 * @returns {Vector2 | Vector3} The resulting vector after subtraction.
 */
function subtractCoordinates(vector1, vector2) {
  return v(...vector1.map((coordinate, index) => coordinate - vector2[index]))
}
/**
 * Adds the coordinates of two vectors.
 * @param {Vector2 | Vector3} vector1 - The first vector.
 * @param {Vector2 | Vector3} vector2 - The second vector.
 * @returns {Vector2 | Vector3} The resulting vector after addition.
 */
function sumCoordinates(vector1, vector2) {
  return v(...vector1.map((coordinate, index) => coordinate + vector2[index]))
}
//#endregion
//#region ../../../packages/engine/src/core/core-events.js
var coreEvents = [
  "create",
  "update",
  "destroy",
  "gamepadAxis",
  "gamepadPress",
  "gamepadRelease",
  "keyboardKeyDown",
  "keyboardKeyUp",
  "inputAxis",
  "inputPress",
  "inputRelease",
  "mouseMove",
  "mouseClick",
  "touchStart",
  "touchMove",
  "touchEnd",
  "spriteAnimationEnd",
]
//#endregion
//#region ../../../packages/engine/src/core/loops/animation-frame.js
var ONE_SECOND$5 = 1e3
var AnimationFrameLoop = class {
  _id = null
  _previousTime = /* @__PURE__ */ new Date()
  start(engine) {
    this._tick(engine)
  }
  stop() {
    window.cancelAnimationFrame(this._id)
    this._id = null
  }
  _tick(engine) {
    const currentTime = /* @__PURE__ */ new Date()
    this._id = window.requestAnimationFrame(() => this._tick(engine))
    const dt = currentTime - this._previousTime
    engine.update(dt / ONE_SECOND$5)
    this._previousTime = currentTime
  }
}
//#endregion
//#region ../../../packages/engine/src/core/loops/elapsed.js
var ONE_SECOND$4 = 1e3
var ElapsedLoop = class {
  _shouldStop = false
  start(engine) {
    let previousTime = Date.now()
    while (!this._shouldStop) {
      const currentTime = Date.now()
      const dt = currentTime - previousTime
      engine.update(dt / ONE_SECOND$4)
      previousTime = currentTime
    }
  }
  stop() {
    this._shouldStop = true
  }
}
//#endregion
//#region ../../../packages/engine/src/core/loops/fixed.js
var ONE_SECOND$3 = 1e3
var FixedLoop = class {
  _shouldStop = false
  async start(engine, msPerUpdate) {
    let previousTime = Date.now()
    while (!this._shouldStop) {
      const currentTime = Date.now()
      const dt = currentTime - previousTime
      engine.update(dt / ONE_SECOND$3)
      previousTime = currentTime
      await sleep(Date.now() - currentTime + msPerUpdate)
    }
  }
  stop() {
    this._shouldStop = true
  }
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
//#endregion
//#region ../../../packages/engine/src/core/loops/flash.js
var FlashLoop = class {
  _shouldStop = false
  start(engine) {
    while (!this._shouldStop) engine.update()
  }
  stop() {
    this._shouldStop = true
  }
}
//#endregion
//#region ../../../packages/engine/src/core/loops/lag.js
var ONE_SECOND$2 = 1e3
var LagLoop = class {
  _shouldStop = false
  start(engine, msPerUpdate) {
    let previousTime = Date.now()
    let lag = 0
    while (!this._shouldStop) {
      const currentTime = Date.now()
      const dt = currentTime - previousTime
      previousTime = currentTime
      lag += dt
      while (lag >= msPerUpdate) {
        engine.update(dt / ONE_SECOND$2)
        lag -= msPerUpdate
      }
    }
  }
  stop() {
    this._shouldStop = true
  }
}
//#endregion
//#region ../../../packages/engine/src/core/loops/index.js
var Loop = {
  flash: FlashLoop,
  fixed: FixedLoop,
  elapsed: ElapsedLoop,
  lag: LagLoop,
  animationFrame: AnimationFrameLoop,
}
//#endregion
//#region ../../../packages/engine/src/physics/anchor.js
var CENTER = 0.5
var NO_EXTENT = 0
/**
 * A shape is centred on its position unless it says otherwise.
 */
var DEFAULT_ANCHOR = v(CENTER, CENTER, CENTER)
/**
 * The anchor an entity's shapes are positioned by.
 *
 * An anchor names the point of a shape that sits on the position, counting from
 * its top-left corner: `[0.5, 0.5]` is the middle, `[0, 1]` its bottom-left,
 * `[1, 0]` its top-right. Anchors count from the top on both vertical axes
 * because that is what you see on screen — the renderer flips `y` and `z` on the
 * way to the canvas, so `[0, 1]` puts a shape on the floor rather than in it.
 *
 * A third coordinate may be given for the depth axis; it defaults to the middle,
 * so a two-component anchor works for sprites and for flat 2D bodies alike.
 *
 * @example
 * ```js
 * // A platform described by its bottom-left corner, which is what you stand on.
 * { type: "Platform", position: v(0, 0, 0), size: v(64, 16, 0), anchor: [0, 1] }
 *
 * // A body straddling its position, which is the default.
 * { type: "Ball", position: v(10, 10, 0), size: v(4, 4, 0) }
 * ```
 */
function entityAnchor(entity) {
  return entity.anchor ?? entity.image?.anchor ?? DEFAULT_ANCHOR
}
/**
 * The anchor a collision shape is positioned by. A shape can override the one its
 * entity uses, so that a sprite and its hitbox can be pinned differently.
 */
function shapeAnchor(entity, collision) {
  return collision.anchor ?? entityAnchor(entity)
}
/**
 * How far the centre of a box sits from the point it is anchored to, per axis.
 *
 * Every axis works the same way, because the anchor counts from the same end the
 * coordinate does.
 */
function anchorOffset(anchor, size) {
  const [anchorX = CENTER, anchorY = CENTER, anchorZ = CENTER] = anchor ?? []
  const [width, height, depth] = extentsOf(size)
  return v(
    (CENTER - anchorX) * width,
    (CENTER - anchorY) * height,
    (CENTER - anchorZ) * depth,
  )
}
function extentsOf(size) {
  const [width = NO_EXTENT, height = NO_EXTENT, depth = NO_EXTENT] = size ?? []
  return [width, height, depth]
}
//#endregion
//#region ../../../packages/utils/src/math/line.js
/**
 * @typedef {import("../../types/math/line").Line} Line
 * @typedef {import("../../types/math/point").Point} Point
 * @typedef {import("../../types/math/circle").Circle} Circle
 */
var line_exports = /* @__PURE__ */ __exportAll({
  distanceFromPoint: () => distanceFromPoint$1,
  intersectsCircle: () => intersectsCircle$4,
})
/**
 * Calculates the shortest distance from a point to a line in 2D space.
 * @param {Line} line - The line represented by the equation ax + bz + c = 0, where `line` is [a, b, c].
 * @param {Point} point - The point in 3D space represented as [x, y, z].
 * @returns {number} The shortest distance from the point to the line.
 */
function distanceFromPoint$1(line, point) {
  const [a, b, c] = line
  const [x, , z] = point
  return abs(a * x + b * z + c) / hypothenuse(a, b)
}
/**
 * Determines whether a line intersects with the perimeter of a circle.
 * @param {Line} line - The line represented by the equation ax + bz + c = 0, where `line` is [a, b, c].
 * @param {Circle} circle - The circle defined by its position (center) and radius.
 * @returns {boolean} `true` if the line intersects the circle's perimeter, otherwise `false`.
 */
function intersectsCircle$4(line, circle) {
  return distanceFromPoint$1(line, circle.position) <= circle.radius
}
//#endregion
//#region ../../../packages/utils/src/math/point.js
var point_exports = /* @__PURE__ */ __exportAll({
  getDistanceFromLine: () => getDistanceFromLine,
  intersectsCircle: () => intersectsCircle$3,
  intersectsPoint: () => intersectsPoint$2,
  intersectsRectangle: () => intersectsRectangle$2,
})
/**
 * A point in the Inglorious coordinate system: `[x, y, z]`.
 *
 * The world is y-up: the origin sits on the floor, and a bigger `y` is always a
 * higher place in the world. Gravity subtracts from it, a jump adds to it, and an
 * object resting on the ground has `y = 0`.
 *
 * `z` is the depth axis, and it is y-up as well — it is not screen-down, so both
 * vertical axes grow upwards. Renderers turn them into screen coordinates:
 * `@inglorious/renderer-2d` projects a point to `canvasY = height - y - z`,
 * which puts `(0, 0, 0)` at the bottom-left of the canvas and turns both axes
 * upside down.
 *
 * @example Reading a position in a 2D game
 * ```js
 * v(0, 0, 0) // the floor
 * v(0, 100, 0) // a hundred pixels up
 *
 * entity.velocity[1] -= GRAVITY * dt // falling loses height
 * entity.position[1] = 0 // keeping a body on the ground
 * ```
 *
 * @typedef {import("../../types/math/point").Point} Point
 * @typedef {import("../../types/math/point").PointInput} PointInput
 * @typedef {import("../../types/math/line").Line} Line
 * @typedef {import("../../types/math/circle").Circle} Circle
 * @typedef {import("../../types/math/rectangle").Rectangle} Rectangle
 */
var SQUARED$1 = 2
var HALF$3 = 2
/**
 * Calculates the distance from a point to a line.
 * @param {Point} point - The point as a 3D coordinate [x, y, z].
 * @param {Line} line - The line to calculate the distance from.
 * @returns {number} The distance from the point to the line.
 */
function getDistanceFromLine(point, line) {
  return distanceFromPoint$1(line, point)
}
/**
 * Checks if two points intersect.
 * @param {PointInput} point1 - The first point as a 3D coordinate [x, y, z].
 * @param {PointInput} point2 - The second point as a 3D coordinate [x, y, z].
 * @returns {boolean} True if the points intersect, false otherwise.
 */
function intersectsPoint$2(point1, point2) {
  const [x1, y1, z1] = ensurePoint(point1)
  const [x2, y2, z2] = ensurePoint(point2)
  return x1 === x2 && y1 === y2 && z1 === z2
}
/**
 * Checks if a point intersects with a circle.
 * @param {PointInput} point - The point as a 3D coordinate [x, y, z].
 * @param {Circle} circle - The circle with a position and radius.
 * @returns {boolean} True if the point intersects the circle, false otherwise.
 */
function intersectsCircle$3(point, circle) {
  const [x, y, z] = ensurePoint(point)
  const [cx, cy, cz] = circle.position
  const radius = circle.radius
  return (
    (x - cx) ** SQUARED$1 + (y - cy) ** SQUARED$1 + (z - cz) ** SQUARED$1 <=
    radius ** SQUARED$1
  )
}
/**
 * Checks if a point intersects with a rectangle.
 * @param {PointInput} point - The point as a 3D coordinate [x, y, z].
 * @param {Rectangle} rectangle - The rectangle with a position and size.
 * @returns {boolean} True if the point intersects the rectangle, false otherwise.
 */
function intersectsRectangle$2(point, rectangle) {
  const [x, y, z] = ensurePoint(point)
  const [rectX, rectY, rectZ] = rectangle.position
  const [width, height, depth] = rectangle.size
  const left = rectX - width / HALF$3
  const right = rectX + width / HALF$3
  const bottom = rectY - height / HALF$3
  const top = rectY + height / HALF$3
  const back = rectZ - depth / HALF$3
  const front = rectZ + depth / HALF$3
  return (
    isBetween(x, left, right) &&
    isBetween(y, bottom, top) &&
    isBetween(z, back, front)
  )
}
function ensurePoint(value) {
  if (!isVector(value)) return value.position
  return value
}
//#endregion
//#region ../../../packages/utils/src/math/circle.js
/**
 * @typedef {import("../../types/math/point").PointInput} PointInput
 * @typedef {import("../../types/math/circle").Circle} Circle
 * @typedef {import("../../types/math/rectangle").Rectangle} Rectangle
 */
var circle_exports = /* @__PURE__ */ __exportAll({
  intersectsCircle: () => intersectsCircle$2,
  intersectsPoint: () => intersectsPoint$1,
  intersectsRectangle: () => intersectsRectangle$1,
})
var HALF$2 = 2
var SQUARED = 2
var INITIAL_SUM = 0
/**
 * Checks if a circle intersects with a point.
 * @param {Circle} circle - The circle to check.
 * @param {PointInput} point - The point to check.
 * @returns {boolean} True if the point intersects the circle, false otherwise.
 */
function intersectsPoint$1(circle, point) {
  return intersectsCircle$3(point, circle)
}
/**
 * Checks if two circles intersect.
 * @param {Circle} circle1 - The first circle.
 * @param {Circle} circle2 - The second circle.
 * @returns {boolean} True if the circles intersect, false otherwise.
 */
function intersectsCircle$2(circle1, circle2) {
  return (
    hypothenuse(...subtract(circle1.position, circle2.position)) <=
    circle1.radius + circle2.radius
  )
}
/**
 * Checks if a circle intersects with a rectangle.
 * @param {Circle} circle - The circle to check.
 * @param {Rectangle} rectangle - The rectangle to check.
 * @returns {boolean} True if the circle intersects the rectangle, false otherwise.
 */
function intersectsRectangle$1(circle, rectangle) {
  const [rectX, rectY, rectZ] = rectangle.position
  const [width, height, depth] = rectangle.size
  const left = rectX - width / HALF$2
  const right = rectX + width / HALF$2
  const bottom = rectY - height / HALF$2
  const top = rectY + height / HALF$2
  const back = rectZ - depth / HALF$2
  const front = rectZ + depth / HALF$2
  const closestPoint = clamp(
    circle.position,
    [left, bottom, back],
    [right, top, front],
  )
  return (
    subtract(circle.position, closestPoint).reduce(
      (sum, value) => sum + value ** SQUARED,
      INITIAL_SUM,
    ) <=
    circle.radius ** SQUARED
  )
}
//#endregion
//#region ../../../packages/utils/src/math/rectangle.js
/**
 * `height` and `depth` are independent axes, not halves of one screen
 * dimension, so a body on the `xy` plane is sized `v(w, h, 0)` and one on the
 * `xz` plane `v(w, 0, h)`. `@inglorious/renderer-2d` flattens both onto the
 * screen and draws a rectangle `height + depth` tall, while
 * {@link intersectsRectangle} tests the two axes separately.
 *
 * @typedef {import("../../types/math/rectangle").Size} Size
 * @typedef {import("../../types/math/circle").Circle} Circle
 * @typedef {import("../../types/math/point").PointInput} PointInput
 * @typedef {import("../../types/math/rectangle").Rectangle} Rectangle
 */
var rectangle_exports = /* @__PURE__ */ __exportAll({
  intersectsCircle: () => intersectsCircle$1,
  intersectsPoint: () => intersectsPoint,
  intersectsRectangle: () => intersectsRectangle,
})
var HALF$1 = 2
/**
 * Checks if a rectangle intersects with a point.
 *
 * The rectangle's `position` is its center, and `size` extends around it. An
 * anchored shape is the exception: its `anchor` picks which point sits on the
 * position, so the two only line up when the anchor matches, such as
 * `[0.5, 0.5]` for a centred one.
 * @param {Rectangle} rectangle - The rectangle to check.
 * @param {PointInput} point - The point to check.
 * @returns {boolean} True if the point intersects the circle, false otherwise.
 */
function intersectsPoint(rectangle, point) {
  return intersectsRectangle$2(point, rectangle)
}
/**
 * Checks if a rectangle intersects with a circle.
 * @param {Rectangle} rectangle - The rectangle to check.
 * @param {Circle} circle - The circle to check.
 * @returns {boolean} True if the rectangle intersects the circle, false otherwise.
 */
function intersectsCircle$1(rectangle, circle) {
  return intersectsRectangle$1(circle, rectangle)
}
/**
 * Determines whether a rectangle intersects another in 3D space.
 * @param {Rectangle} rectangle1 - The first rectangle, defined by its position (x, y, z) and size (width, height, depth).
 * @param {Rectangle} rectangle2 - The second rectangle, defined by its position (x, y, z) and size (width, height, depth).
 * @returns {boolean} True if the two rectangles intersect, false otherwise.
 */
function intersectsRectangle(rectangle1, rectangle2) {
  const [x1, y1, z1] = rectangle1.position
  const [w1, h1, d1] = rectangle1.size
  const halfW1 = w1 / HALF$1
  const halfH1 = h1 / HALF$1
  const halfD1 = d1 / HALF$1
  const left1 = x1 - halfW1
  const right1 = x1 + halfW1
  const bottom1 = y1 - halfH1
  const top1 = y1 + halfH1
  const back1 = z1 - halfD1
  const front1 = z1 + halfD1
  const [x2, y2, z2] = rectangle2.position
  const [w2, h2, d2] = rectangle2.size
  const halfW2 = w2 / HALF$1
  const halfH2 = h2 / HALF$1
  const halfD2 = d2 / HALF$1
  const left2 = x2 - halfW2
  const right2 = x2 + halfW2
  const bottom2 = y2 - halfH2
  const top2 = y2 + halfH2
  const back2 = z2 - halfD2
  const front2 = z2 + halfD2
  return (
    left1 <= right2 &&
    right1 >= left2 &&
    bottom1 <= top2 &&
    top1 >= bottom2 &&
    back1 <= front2 &&
    front1 >= back2
  )
}
//#endregion
//#region ../../../packages/utils/src/math/hitmask.js
var hitmask_exports = /* @__PURE__ */ __exportAll({
  findCollisions: () => findCollisions,
})
var FIRST = 0
var HALF = 2
var LAST = 1
function findCollisions(hitmask, target) {
  const [tilemapX, tilemapY, tilemapZ] = hitmask.position
  const [tileWidth, tileDepth] = hitmask.tileSize
  const halfTileWidth = tileWidth / HALF
  const halfTileDepth = tileDepth / HALF
  const dRows = Math.ceil(hitmask.heights.length / hitmask.columns)
  const tilemapWidth = hitmask.columns * tileWidth
  const tilemapDepth = dRows * tileDepth
  const tilemapLeft = tilemapX - tilemapWidth / HALF
  const tilemapBack = tilemapZ - tilemapDepth / HALF
  const [targetX, , targetZ] = target.position
  const [targetWidth, , targetDepth] = target.size
  const targetHalfWidth = targetWidth / HALF
  const targetHalfDepth = targetDepth / HALF
  const targetLeft = targetX - targetHalfWidth
  const targetRight = targetX + targetHalfWidth
  const targetBack = targetZ - targetHalfDepth
  const targetFront = targetZ + targetHalfDepth
  const minTileX = Math.floor((targetLeft - tilemapLeft) / tileWidth)
  const maxTileX = Math.floor((targetRight - tilemapLeft) / tileWidth)
  const minTileZ = Math.floor((targetBack - tilemapBack) / tileDepth)
  const maxTileZ = Math.floor((targetFront - tilemapBack) / tileDepth)
  for (let i = minTileX; i <= maxTileX; i++)
    for (let j = minTileZ; j <= maxTileZ; j++) {
      if (
        !isBetween(i, FIRST, hitmask.columns - LAST) ||
        !isBetween(j, FIRST, dRows - LAST)
      )
        continue
      const tileIndex = (dRows - LAST - j) * hitmask.columns + i
      const tileHeightValue = hitmask.heights[tileIndex]
      if (tileHeightValue) {
        if (
          intersectsRectangle(target, {
            position: [
              tilemapLeft + i * tileWidth + halfTileWidth,
              tilemapY,
              tilemapBack + j * tileDepth + halfTileDepth,
            ],
            size: [tileWidth, tileHeightValue, tileDepth],
          })
        )
          return true
      }
    }
  return false
}
//#endregion
//#region ../../../packages/utils/src/math/segment.js
/**
 * @typedef {import("../../types/math/segment").Segment} Segment
 * @typedef {import("../../types/math/point").Point} Point
 * @typedef {import("../../types/math/circle").Circle} Circle
 */
var segment_exports = /* @__PURE__ */ __exportAll({
  closestPoint: () => closestPoint,
  coefficients: () => coefficients,
  distanceFromPoint: () => distanceFromPoint,
  intersectsCircle: () => intersectsCircle,
})
var BEFORE_SEGMENT = 0
/**
 * Calculates the coefficients [a, b, c] of the line equation ax + bz + c = 0
 * for a given segment in 2D space.
 * @param {Segment} segment - The segment defined by its start (`from`) and end (`to`) points.
 * @returns {[number, number, number]} An array [a, b, c] representing the line equation.
 */
function coefficients(segment) {
  const [x1, , z1] = segment.from
  const [x2, , z2] = segment.to
  return [z1 - z2, x2 - x1, (x1 - x2) * z1 + x1 * (z2 - z1)]
}
/**
 * Finds the closest point on a segment to a given point in 3D space.
 * @param {Segment} segment - The segment defined by its start (`from`) and end (`to`) points.
 * @param {Point} point - The point in 3D space represented as [x, y, z].
 * @returns {Point} The closest point on the segment to the given point.
 */
function closestPoint(segment, point) {
  const shiftedSegment = subtract(segment.to, segment.from)
  const projectionLength =
    dot(shiftedSegment, subtract(point, segment.from)) /
    magnitude(shiftedSegment)
  if (projectionLength < BEFORE_SEGMENT) return segment.from
  if (projectionLength > magnitude(shiftedSegment)) return segment.to
  const projectedPoint = setMagnitude(shiftedSegment, projectionLength)
  return sum(segment.from, projectedPoint)
}
/**
 * Calculates the shortest distance from a point to a segment in 3D space.
 * @param {Segment} segment - The segment defined by its start (`from`) and end (`to`) points.
 * @param {Point} point - The point in 3D space represented as [x, y, z].
 * @returns {number} The shortest distance from the point to the segment.
 */
function distanceFromPoint(segment, point) {
  return distance(point, closestPoint(segment, point))
}
/**
 * Determines whether a segment intersects with the perimeter of a circle.
 * @param {Segment} segment - The segment defined by its start (`from`) and end (`to`) points.
 * @param {Circle} circle - The circle defined by its position (center) and radius.
 * @returns {boolean} `true` if the segment intersects the circle's perimeter, otherwise `false`.
 */
function intersectsCircle(segment, circle) {
  return distanceFromPoint(segment, circle.position) <= circle.radius
}
//#endregion
//#region ../../../packages/engine/src/collision/detection.js
var Z = 2
var Shape = {
  circle: circle_exports,
  line: line_exports,
  point: point_exports,
  rectangle: rectangle_exports,
  segment: segment_exports,
  hitmask: hitmask_exports,
}
/**
 * Finds the first collision between a point and a list of entities.
 *
 * @param {Point} entity - The point to check for collisions.
 * @param {Options} options - Options for collision detection.
 * @returns {Entity | undefined} The first entity that collides with the point, or undefined if none are found.
 */
function findCollision(entity, entities, collisionGroup = "hitbox") {
  const otherEntities = filter(
    entities,
    (id, { collisions }) => id !== entity.id && collisions?.[collisionGroup],
  )
  return Object.values(otherEntities)
    .toSorted((a, b) => a.position[Z] - b.position[Z])
    .find((target) => collidesWith(entity, target, collisionGroup))
}
function collidesWith(entity, target, collisionGroup = "hitbox") {
  const entityShape = getCollisionShape(entity, collisionGroup)
  const targetShape = getCollisionShape(target, collisionGroup)
  if (!entityShape || !targetShape) return false
  return shapeCollidesWith(entityShape, targetShape)
}
function shapeCollidesWith(entity, target) {
  const shapeFns = Shape[entity.shape]
  switch (target.shape) {
    case "circle":
      return shapeFns.intersectsCircle(entity, target)
    case "line":
      return shapeFns.intersectsLine(entity, target)
    case "point":
      return shapeFns.intersectsPoint(entity, target)
    case "rectangle":
      return shapeFns.intersectsRectangle(entity, target)
    case "segment":
      return shapeFns.intersectsSegment(entity, target)
  }
}
/**
 * Correctly calculates the absolute position and size of an entity's
 * collision shape, including any offsets and the anchor the shape hangs from.
 *
 * The shape is reported by its centre, which is where the collision maths wants
 * it, so an anchored shape is shifted off its position by half the room it does
 * not take up on that side.
 */
function getCollisionShape(entity, collisionGroup = "hitbox") {
  const collision = entity.collisions[collisionGroup]
  if (!collision) return null
  const size = collision.size ?? entity.size
  const position = add(
    entity.position,
    anchorOffset(shapeAnchor(entity, collision), size),
    collision.offset ?? zero(),
    entity.offset ?? zero(),
  )
  return {
    ...collision,
    position,
    size,
    radius: collision.radius ?? entity.radius,
  }
}
//#endregion
//#region ../../../packages/engine/src/core/middlewares/entity-pool/entity-pool.js
var INITIAL_ID = 0
var NOT_FOUND = -1
var ITEMS_TO_REMOVE = 1
var EntityPool = class {
  _activeEntities = []
  _inactiveEntities = []
  _nextId = INITIAL_ID
  populate(factory, count) {
    for (let i = 0; i < count; i++) this._activeEntities.push(factory())
  }
  acquire(props) {
    const entity = this._inactiveEntities.pop() || {
      id: `entity-${this._nextId++}`,
    }
    Object.assign(entity, props)
    this._activeEntities.push(entity)
    return entity
  }
  recycle(entity) {
    const index = this._activeEntities.indexOf(entity)
    if (index !== NOT_FOUND) {
      const [entity] = this._activeEntities.splice(index, ITEMS_TO_REMOVE)
      this._inactiveEntities.push(entity)
    }
    return entity
  }
  getStats() {
    return {
      active: this._activeEntities.length,
      inactive: this._inactiveEntities.length,
    }
  }
}
//#endregion
//#region ../../../packages/engine/src/core/middlewares/entity-pool/entity-pools.js
var EntityPools = class {
  _pools = /* @__PURE__ */ new Map()
  _activeEntitiesById = /* @__PURE__ */ new Map()
  get activeEntitiesById() {
    return this._activeEntitiesById
  }
  getAllActiveEntitiesById() {
    return Object.fromEntries(this._activeEntitiesById)
  }
  acquire(props) {
    this.lazyInit(props)
    const entity = this._pools.get(props.type).acquire(props)
    this._activeEntitiesById.set(entity.id, entity)
    return entity
  }
  recycle(props) {
    this.lazyInit(props)
    const entity = this._pools.get(props.type).recycle(props)
    this._activeEntitiesById.delete(entity.id)
    return entity
  }
  getStats() {
    const stats = {}
    for (const [type, pool] of this._pools.entries())
      stats[type] = pool.getStats()
    return stats
  }
  lazyInit(entity) {
    if (!this._pools.get(entity.type))
      this._pools.set(entity.type, new EntityPool())
  }
  getAllActiveEntities() {
    return Array.from(this._activeEntitiesById.values())
  }
}
//#endregion
//#region ../../../packages/engine/src/core/middlewares/entity-pool/entity-pool-middleware.js
function entityPoolMiddleware() {
  return (store) => {
    const pools = new EntityPools()
    const eventMap = new EventMap()
    store.extras ??= {}
    store.extras.getAllActivePoolEntities = () => pools.getAllActiveEntities()
    store.extras.findCollision = (
      entity,
      entities = store.getState(),
      collisionGroup,
    ) =>
      findCollision(
        entity,
        {
          ...entities,
          ...pools.getAllActiveEntitiesById(),
        },
        collisionGroup,
      )
    if (store.getState().game.devMode)
      store.extras.getEntityPoolsStats = () => pools.getStats()
    const api = createApi(store)
    return (next) => (event) => {
      switch (event.type) {
        case "spawn": {
          const entity = pools.acquire(event.payload)
          const type = store.getType(entity.type)
          eventMap.addEntity(entity.id, type, entity.type)
          break
        }
        case "despawn": {
          const entity = pools.recycle(event.payload)
          const type = store.getType(entity.type)
          eventMap.removeEntity(entity.id, type, entity.type)
          break
        }
        default: {
          const entityIds = eventMap.getEntitiesForEvent(event.type)
          for (const id of entityIds) {
            const entity = pools.activeEntitiesById.get(id)
            if (!entity) continue
            const handle = store.getType(entity.type)[event.type]
            handle?.(entity, event.payload, api)
          }
        }
      }
      return next(event)
    }
  }
}
//#endregion
//#region ../../../packages/engine/src/core/engine.js
var DEFAULT_GAME_CONFIG = {
  loop: {
    type: "animationFrame",
    fps: 60,
  },
  systems: [],
  types: {
    Game: [game()],
    Audio: [audio()],
    Images: [images()],
  },
  entities: {
    game: {
      type: "Game",
      size: v(800, 600),
    },
    audio: {
      type: "Audio",
      sounds: {},
    },
    images: {
      type: "Images",
      images: {},
    },
  },
}
var ONE_SECOND$1 = 1e3
/**
 * Engine class responsible for managing the game loop, state, and rendering.
 */
var Engine = class {
  /**
   * @param {...Object} gameConfigs - Game-specific configurations.
   */
  constructor(...gameConfigs) {
    this._config = extendWith(merger, DEFAULT_GAME_CONFIG, ...gameConfigs)
    const devMode = this._config.entities.game?.devMode
    this._devMode = devMode
    const middlewares = []
    middlewares.push(entityPoolMiddleware())
    const multiplayer = this._config.entities.game?.multiplayer
    if (multiplayer)
      middlewares.push(
        multiplayerMiddleware({
          ...multiplayer,
          blacklist: coreEvents,
        }),
      )
    this._store = createStore({
      ...this._config,
      middlewares,
      updateMode: "manual",
    })
    this._loop = new Loop[this._config.loop.type]()
    this._devtools = createDevtools({
      blacklist: coreEvents,
      updateMode: "manual",
    })
    if (this._devMode) this._devtools.connect(this._store)
  }
  async init() {
    const api = createApi(this._store)
    return Promise.all(
      Object.values(this._config.entities).map((entity) => {
        const originalType = this._config.types[entity.type]
        return augmentType(originalType).init?.(entity, null, api)
      }),
    )
  }
  /**
   * Starts the game engine, initializing the loop and notifying the store.
   */
  start() {
    this._store.notify("start")
    this._loop.start(this, ONE_SECOND$1 / this._config.loop.fps)
  }
  /**
   * Stops the game engine, halting the loop and notifying the store.
   */
  stop() {
    this._store.notify("stop")
    this._store.update()
    this._loop.stop()
  }
  /**
   * Returns the current game state.
   * @returns {Entities} The entities of the current state.
   */
  getState() {
    return this._store.getState()
  }
  /**
   * Updates the game state.
   * @param {number} dt - Delta time since the last update in milliseconds.
   */
  update(dt) {
    this._store.notify("update", dt)
    const processedEvents = this._store.update()
    const entities = this._store.getState()
    const newDevMode = entities.game?.devMode
    if (newDevMode !== this._devMode) {
      if (newDevMode) this._devtools.connect(this._store)
      else this._devtools.disconnect()
      this._devMode = newDevMode
    }
    const eventsToLog = processedEvents.filter(
      ({ type }) => !coreEvents.includes(type),
    )
    if (eventsToLog.length) {
      const action = {
        type: eventsToLog.map(({ type }) => type).join("|"),
        payload: eventsToLog,
      }
      this._devtools.send(action, entities)
    }
  }
}
function merger(targetValue, sourceValue) {
  if (isArray(targetValue) && !isVector(targetValue) && isBehavior(sourceValue))
    return [...targetValue, ...ensureArray(sourceValue)]
}
function isBehavior(value) {
  if (isArray(value)) return !isVector(value)
  return isObject(value) || isFunction(value)
}
//#endregion
//#region ../../../packages/engine/src/animation/ticker.js
var DEFAULT_STATE$1 = "default"
var DEFAULT_VALUE$1 = 0
var COUNTER_RESET = 0
var Ticker = {
  /**
   * Ticks a counter and calls a function when a target interval is reached.
   *
   * @param {object} options The options for the tick.
   * @param {object} options.target An object to hold the ticker's internal state.
   * @param {number} options.target.speed The interval in milliseconds for the ticker to "tick".
   * @param {number} options.dt The time elapsed since the last tick.
   * @param {function} options.onTick The function to call when the ticker "ticks".
   * @param {string} [options.state="default"] An optional state to track changes and reset the ticker.
   * @param {number} [options.defaultValue=0] The default value for the target's counter.
   */
  tick({ target, state = DEFAULT_STATE$1, dt, onTick, ...options }) {
    const missing = [target == null && "'target'", dt == null && "'dt'"]
      .filter(Boolean)
      .join(", ")
    if (missing.length)
      throw new Error(`Ticker.tick is missing mandatory parameters: ${missing}`)
    const { speed, defaultValue = DEFAULT_VALUE$1 } = target
    if (state !== target.animation) {
      target.animation = state
      target.counter = COUNTER_RESET
      target.value = defaultValue
    }
    target.state = state
    target.counter ??= COUNTER_RESET
    target.value ??= defaultValue
    target.counter += dt
    if (target.counter >= speed) {
      target.counter = COUNTER_RESET
      onTick?.(target, dt, options)
    }
  },
}
//#endregion
//#region ../../../packages/engine/src/behaviors/fps.js
var DEFAULT_PARAMS = {
  accuracy: 1,
  size: 16,
  speed: 1,
  defaultValue: 0.016666666666666666,
}
function fps(params) {
  params = extend(DEFAULT_PARAMS, params)
  return {
    create(entity) {
      entity.dt ??= { ...params }
    },
    update(entity, dt) {
      Ticker.tick({
        target: entity.dt,
        dt,
        onTick: (target, dt) => {
          target.value = dt
        },
      })
    },
  }
}
//#endregion
//#region ../../../packages/engine/src/behaviors/input/gamepad.js
function gamepadsPoller(targetIds = []) {
  return {
    create(entity) {
      entity.gamepadStateCache ??= {}
    },
    update(entity, dt, api) {
      navigator.getGamepads().forEach((pad) => {
        if (pad == null) return
        const cache = (entity.gamepadStateCache[pad.index] ??= {
          axes: [],
          buttons: [],
        })
        pad.axes.forEach((axis, index) => {
          if (axis === cache.axes[index]) return
          api.notify("gamepadAxis", {
            targetId: targetIds[pad.index],
            axis: `Axis${index}`,
            value: axis,
          })
          cache.axes[index] = axis
        })
        pad.buttons.forEach((button, index) => {
          const wasPressed = cache.buttons[index]
          const isPressed = button.pressed
          if (isPressed && !wasPressed)
            api.notify("gamepadPress", {
              targetId: targetIds[pad.index],
              button: `Btn${index}`,
            })
          else if (!isPressed && wasPressed)
            api.notify("gamepadRelease", {
              targetId: targetIds[pad.index],
              button: `Btn${index}`,
            })
          cache.buttons[index] = isPressed
        })
      })
    },
  }
}
function gamepad() {
  return {
    gamepadAxis(entity, { targetId, axis, value }, api) {
      if (targetId !== entity.targetId) return
      const action = entity.mapping[axis]
      if (!action) return
      entity[action] = value
      api.notify("inputAxis", {
        targetId,
        action,
        value,
      })
    },
    gamepadPress(entity, { targetId, button }, api) {
      if (targetId !== entity.targetId) return
      const action = entity.mapping[button]
      if (!action) return
      if (!entity[action]) {
        entity[action] = true
        api.notify("inputPress", {
          targetId,
          action,
        })
      }
    },
    gamepadRelease(entity, { targetId, button }, api) {
      if (targetId !== entity.targetId) return
      const action = entity.mapping[button]
      if (!action) return
      if (entity[action]) {
        entity[action] = false
        api.notify("inputRelease", {
          targetId,
          action,
        })
      }
    },
  }
}
function createGamepadEntity(targetId, mapping = {}) {
  return {
    type: "Gamepad",
    targetId,
    mapping,
  }
}
//#endregion
//#region ../../../packages/engine/src/behaviors/input/input.js
function input() {
  return {
    inputAxis(entity, { targetId, action, value }, api) {
      if (targetId !== entity.targetId) return
      entity[action] = value
      api.notify(action, {
        entityId: entity.targetId,
        value,
      })
    },
    inputPress(entity, { targetId, action }, api) {
      if (targetId !== entity.targetId) return
      entity[action] = true
      api.notify(action, entity.targetId)
    },
    inputRelease(entity, { targetId, action }, api) {
      if (targetId !== entity.targetId) return
      entity[action] = false
      api.notify(`${action}End`, entity.targetId)
    },
  }
}
function createInputEntity(targetId, mapping = {}) {
  return {
    type: "Input",
    targetId,
    mapping,
  }
}
//#endregion
//#region ../../../packages/engine/src/behaviors/input/keyboard.js
/**
 * Reports keys by their physical code, and the characters they produce.
 *
 * Actions are mapped by `code`, which is the physical key: that keeps WASD on the
 * same fingers whatever layout is installed. Typing needs `key` instead, which is
 * the character the press produced and so differs per layout and per Shift. Both
 * are notified, so `keyboardKeyDown` stays layout-independent while
 * `keyboardChar` carries something you can put in a field.
 *
 * @example
 * ```js
 * // Acting on a key, by position.
 * const actions = { KeyW: "moveUp", Space: "press" }
 *
 * // Typing, by character.
 * keyboardChar(entity, { targetId, character }) {
 *   if (targetId !== entity.targetId) return
 *   entity.name += character
 * }
 * ```
 */
function keyboard() {
  let handleKeyDown, handleKeyUp
  let currentDocument = null
  return {
    create(entity, payload, api) {
      currentDocument = document.body.ownerDocument || document
      handleKeyDown = createKeyDownHandler(entity.targetId, api)
      handleKeyUp = createKeyUpHandler(api)
      currentDocument.addEventListener("keydown", handleKeyDown)
      currentDocument.addEventListener("keyup", handleKeyUp)
    },
    stop() {
      currentDocument.removeEventListener("keydown", handleKeyDown)
      currentDocument.removeEventListener("keyup", handleKeyUp)
    },
    keyboardKeyDown(entity, keyCode, api) {
      const action = entity.mapping[keyCode]
      if (!action) return
      if (!entity[action]) {
        entity[action] = true
        api.notify("inputPress", {
          targetId: entity.targetId,
          action,
        })
      }
    },
    keyboardKeyUp(entity, keyCode, api) {
      const action = entity.mapping[keyCode]
      if (!action) return
      if (entity[action]) {
        entity[action] = false
        api.notify("inputRelease", {
          targetId: entity.targetId,
          action,
        })
      }
    },
  }
}
function createKeyboardEntity(targetId, mapping = {}) {
  return {
    type: "Keyboard",
    targetId,
    mapping,
  }
}
function createKeyDownHandler(targetId, api) {
  return (event) => {
    event.stopPropagation()
    api.notify("keyboardKeyDown", event.code)
    if (isCharacter(event.key))
      api.notify("keyboardChar", {
        targetId,
        character: event.key,
      })
  }
}
function createKeyUpHandler(api) {
  return (event) => {
    event.stopPropagation()
    api.notify("keyboardKeyUp", event.code)
  }
}
function isCharacter(key) {
  return typeof key === "string" && key.length === 1
}
//#endregion
//#region ../../../packages/engine/src/behaviors/input/pointer.js
var DEFAULT_ACTIONS = []
/**
 * Turns pointer gestures into input actions, the same way the keyboard and the
 * gamepad behaviors do. A click is a complete press, while a touch reports its
 * press on `touchStart` and its release on `touchEnd`.
 */
function pointer() {
  return {
    mouseClick(entity, position, api) {
      press$1(entity, api)
      release(entity, api)
    },
    touchStart(entity, position, api) {
      press$1(entity, api)
    },
    touchEnd(entity, position, api) {
      release(entity, api)
    },
  }
}
function createPointerEntity(targetId, actions = DEFAULT_ACTIONS) {
  return {
    type: "Pointer",
    targetId,
    actions,
  }
}
function press$1(entity, api) {
  entity.actions.forEach((action) => {
    api.notify("inputPress", {
      targetId: entity.targetId,
      action,
    })
  })
}
function release(entity, api) {
  entity.actions.forEach((action) => {
    api.notify("inputRelease", {
      targetId: entity.targetId,
      action,
    })
  })
}
//#endregion
//#region ../../../packages/engine/src/behaviors/input/controls.js
/**
 * The types every control needs, composed once and listed under `types`.
 *
 * Each one is a bare behavior rather than a list of them, because nothing else
 * defines these types for it to compose onto: the engine only appends to a type
 * that is already a list, which is how a game keeps the built-in ones. To add to
 * a control type, list the behaviors instead, as in `Keyboard: [keyboard(), …]`.
 *
 * @example
 * ```js
 * types: { ...controlTypes("game"), Game, Bird }
 * ```
 */
function controlTypes(...targetIds) {
  return {
    Keyboard: keyboard(),
    Pointer: pointer(),
    GamepadsPoller: gamepadsPoller(targetIds),
    Gamepad: gamepad(),
    Input: input(),
  }
}
/**
 * The entities that listen for input on behalf of `targetId`, spread under
 * `entities`. The mapping turns a key or button into an action the rest of the
 * game listens for by name.
 *
 * @example
 * ```js
 * entities: {
 *   ...createControlEntities("game", { Space: "press" }, ["press"]),
 *   game: { type: "Game" },
 * }
 * ```
 */
function createControlEntities(targetId, mapping = {}, pointerActions = []) {
  return {
    gamepads: { type: "GamepadsPoller" },
    [`keyboard_${targetId}`]: createKeyboardEntity(targetId, mapping),
    [`gamepad_${targetId}`]: createGamepadEntity(targetId, mapping),
    [`input_${targetId}`]: createInputEntity(targetId, mapping),
    [`pointer_${targetId}`]: createPointerEntity(targetId, pointerActions),
  }
}
//#endregion
//#region ../../../packages/renderer-2d/src/text.js
var DEFAULT_SIZE = 16
var DEFAULT_COLOR = "black"
var DEFAULT_FONT = "sans-serif"
var DEFAULT_TEXT_ALIGN = "left"
var DEFAULT_VALUE = ""
var TOP_BASELINE = "top"
var DEFAULT_POSITION$1 = 0
function renderText(entity, ctx) {
  const {
    size = DEFAULT_SIZE,
    lineHeight = size,
    color = DEFAULT_COLOR,
    font = DEFAULT_FONT,
    textAlign = DEFAULT_TEXT_ALIGN,
    value = DEFAULT_VALUE,
  } = entity
  ctx.save()
  ctx.font = `${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = textAlign
  ctx.textBaseline = TOP_BASELINE
  value.split("\n").forEach((token, index) => {
    ctx.fillText(token, DEFAULT_POSITION$1, lineHeight * index)
  })
  ctx.restore()
}
//#endregion
//#region ../../../packages/renderer-2d/src/fps.js
var ONE_SECOND = 1
function renderFps(entity, ctx) {
  const { value, accuracy } = entity.dt
  renderText(
    {
      ...entity,
      value: `FPS: ${(ONE_SECOND / value).toFixed(accuracy)}`,
    },
    ctx,
  )
}
//#endregion
//#region ../../../packages/renderer-2d/src/image/image.js
var DEFAULT_POSITION = 0
var WHOLE = 1
var OPAQUE = 1
var NATIVE_SCALE = 1
var NO_FLIP = 1
var FLIP = -1
function renderImage(entity, ctx, api) {
  const {
    image,
    sx = DEFAULT_POSITION,
    sy = DEFAULT_POSITION,
    flipX = false,
    flipY = false,
    opacity = OPAQUE,
  } = entity
  const {
    id,
    src,
    imageSize,
    tileSize = imageSize,
    scale = NATIVE_SCALE,
  } = image
  const [tileWidth, tileHeight] = tileSize
  const [frameWidth = tileWidth, frameHeight = tileHeight] =
    image.frameSize ?? []
  const [drawWidth, drawHeight] = image.frameSize ?? tileSize
  const [anchorX, anchorY] = entityAnchor(entity)
  const dx = flipX ? -drawWidth : DEFAULT_POSITION
  const dy = flipY ? -drawHeight : DEFAULT_POSITION
  const imgParams = [
    sx * tileWidth,
    sy * tileHeight,
    frameWidth,
    frameHeight,
    dx,
    dy,
    drawWidth,
    drawHeight,
  ]
  ctx.save()
  ctx.globalAlpha = opacity
  const [scaleX, scaleY] = Array.isArray(scale) ? scale : [scale, scale]
  if (scaleX !== NATIVE_SCALE || scaleY !== NATIVE_SCALE)
    ctx.scale(scaleX, scaleY)
  ctx.translate(-drawWidth * anchorX, -drawHeight * (WHOLE - anchorY))
  if (flipX) ctx.scale(FLIP, NO_FLIP)
  if (flipY) ctx.scale(NO_FLIP, FLIP)
  const images = api.getType("Images")
  const img = images.get(id) || document.getElementById(id)
  if (img) ctx.drawImage(img, ...imgParams)
  else if (src) images.load(id, src)
  else
    console.warn(`Image '${id}' not found and no src provided for lazy loading`)
  ctx.restore()
}
//#endregion
//#region src/constants.js
var GAME_STATE = {
  start: "start",
  play: "play",
  paused: "paused",
}
var MENU_ITEMS = ["start", "high-scores"]
var MENU_START = MENU_ITEMS[0]
var MENU_HIGH_SCORES = MENU_ITEMS[1]
var PRESS = "press"
var PRESS_MENU_UP = "pressMenuUp"
var PRESS_MENU_DOWN = "pressMenuDown"
var TOGGLE_PAUSE = "togglePause"
var SOUND_PADDLE_HIT = "paddleHit"
var SOUND_CONFIRM = "confirm"
var SOUND_PAUSE = "pause"
var FONT_FAMILY = "'Breakout'"
var COLOR_TEXT = "white"
var COLOR_HIGHLIGHT = "rgb(103, 255, 255)"
//#endregion
//#region ../../../packages/engine/src/behaviors/fsm.js
var DEFAULT_STATE = "default"
var STATE_CHANGE = "stateChange"
function fsm(states) {
  const uniqueEventNames = [
    ...new Set(Object.values(states).flatMap(Object.keys)),
  ]
  return (type) => {
    return {
      create(entity, payload, api) {
        type.create?.(entity, payload, api)
        entity.state ??= DEFAULT_STATE
      },
      ...uniqueEventNames.reduce(
        (acc, eventName) => ({
          ...acc,
          [eventName](entity, event, api) {
            const from = entity.state
            type[eventName]?.(entity, event, api)
            states[entity.state]?.[eventName]?.(entity, event, api)
            announce(entity, from, api)
          },
        }),
        {},
      ),
    }
  }
}
/**
 * A machine announces where it has landed, but only when it has actually moved: a
 * handler that reads the state without changing it should not wake anything up.
 *
 * The announcement is broadcast and carries the id, rather than being addressed to
 * this entity, because what wants to hear it is usually something else.
 */
function announce(entity, from, api) {
  const to = entity.state
  if (to === from) return
  api.notify(STATE_CHANGE, {
    entityId: entity.id,
    from,
    to,
  })
}
//#endregion
//#region src/types/text.ijs
function __vectorSubtract$2(a, b) {
  if (isVector(a) && isVector(b)) return subtract(a, b)
  if (!isVector(a) && !isVector(b)) return a - b
  throw new Error("Cannot subtract a vector and a non-vector.")
}
function __vectorDivide$2(a, b) {
  if (isVector(a) && isVector(b)) return divide(a, b)
  if (isVector(a) && !isVector(b)) return divide(a, b)
  if (!isVector(a) && isVector(b)) return divideBy(a, b)
  if (!isVector(a) && isVector(b))
    throw new Error("Cannot divide a non-vector by a vector.")
  return a / b
}
function __vectorSum$1(a, b) {
  if (isVector(a) && isVector(b)) return sum(a, b)
  if (!isVector(a) && !isVector(b)) return a + b
  throw new Error("Cannot add a vector and a non-vector.")
}
/**
 * The altitudes are the original's y-down positions turned the right way up, because
 * this world counts from the bottom of the screen. Taking them as they are written in
 * `StartState.lua` would stack the menu upside down.
 *
 * The original centres each line with `printf`, which centres a block vertically.
 * Text here hangs off its top edge, so each one drops by half a font to land where
 * the original's does.
 */
var top = (y) => __vectorSubtract$2(243, y)
var centred = (y, size) => __vectorSubtract$2(top(y), size / 2)
var TITLE_ALTITUDE = top(__vectorDivide$2(243, 3))
var START_ALTITUDE = top(__vectorSum$1(__vectorDivide$2(243, 2), 70))
var HIGH_SCORES_ALTITUDE = top(__vectorSum$1(__vectorDivide$2(243, 2), 90))
var PAUSED_ALTITUDE = centred(
  __vectorSubtract$2(__vectorDivide$2(243, 2), 16),
  32,
)
/** The parts of a line that do not change from one frame to the next. */
function say(entity, text, size) {
  entity.value = text
  entity.size = size
  entity.font = FONT_FAMILY
  entity.textAlign = "center"
}
/**
 * A line of text that reads the game entity each frame, so the menu can change what it
 * says and which item is picked out without anything reaching into the entity.
 *
 * Nothing here checks whether the game is on the start screen: the lines are added and
 * removed with the state that says them, so an existing line is always one that has
 * something to say.
 */
function line(text, altitude, size = 32, selected) {
  return {
    render: renderText,
    update(entity, dt, api) {
      const game = api.getEntity("game")
      say(entity, text, size)
      entity.color =
        selected !== void 0 && game.menuItem === selected
          ? COLOR_HIGHLIGHT
          : COLOR_TEXT
    },
  }
}
var Title = line("BREAKOUT", TITLE_ALTITUDE)
var Start = line("START", START_ALTITUDE, 16, MENU_START)
var HighScores = line("HIGH SCORES", HIGH_SCORES_ALTITUDE, 16, MENU_HIGH_SCORES)
/**
 * "PAUSED" belongs to the play scene, but pausing is a flag rather than a state, so
 * unlike the menu lines this one does have to say for itself.
 *
 * The entity carrying this type is the one that sets `updatesWhilePaused`, which is
 * what lets it keep updating while the world is halted. Without it this would freeze
 * on whatever it last said and the pause screen would never appear.
 */
var Paused = {
  render: renderText,
  update(entity, dt, api) {
    say(entity, api.getEntity("game").paused ? "PAUSED" : "", 32)
  },
}
/** Where a line of text sits: centred on the screen at the given altitude. */
function positionFor(altitude) {
  return v(__vectorDivide$2(432, 2), altitude, 0)
}
//#endregion
//#region src/types/game.ijs
function __vectorSubtract$1(a, b) {
  if (isVector(a) && isVector(b)) return subtract(a, b)
  if (!isVector(a) && !isVector(b)) return a - b
  throw new Error("Cannot subtract a vector and a non-vector.")
}
function __vectorDivide$1(a, b) {
  if (isVector(a) && isVector(b)) return divide(a, b)
  if (isVector(a) && !isVector(b)) return divide(a, b)
  if (!isVector(a) && isVector(b)) return divideBy(a, b)
  if (!isVector(a) && isVector(b))
    throw new Error("Cannot divide a non-vector by a vector.")
  return a / b
}
function __vectorMod(a, b) {
  if (isVector(a) && isVector(b)) return mod(a, b)
  if (isVector(a) && !isVector(b)) return mod(a, b)
  if (!isVector(a) && isVector(b)) return modOf(a, b)
  if (!isVector(a) && isVector(b))
    throw new Error("Cannot compute the modulus of a non-vector by a vector.")
  return a % b
}
function __vectorSum(a, b) {
  if (isVector(a) && isVector(b)) return sum(a, b)
  if (!isVector(a) && !isVector(b)) return a + b
  throw new Error("Cannot add a vector and a non-vector.")
}
var TITLE_ID = "title"
var START_ID = "start"
var HIGH_SCORES_ID = "highScores"
var PAUSED_ID = "paused"
var PADDLE_ID = "paddle"
/**
 * What exists in each state.
 *
 * In the original every one of these is drawn by the state it belongs to, so moving
 * between states takes them away by itself. Pausing is not a state, so `PAUSED` lives
 * in the play scene and decides for itself whether it has anything to say. Here the game announces its transitions
 * and this decides what should be there, which keeps the entities honest: a line of
 * text that is not being said is not in the store at all, rather than sitting in it
 * with nothing to say.
 */
var SCENES = {
  [GAME_STATE.start]: [TITLE_ID, START_ID, HIGH_SCORES_ID],
  [GAME_STATE.play]: [PADDLE_ID, PAUSED_ID],
}
var BUILDERS = {
  [TITLE_ID]: () => text(TITLE_ID, "Title", TITLE_ALTITUDE),
  [START_ID]: () => text(START_ID, "Start", START_ALTITUDE),
  [HIGH_SCORES_ID]: () =>
    text(HIGH_SCORES_ID, "HighScores", HIGH_SCORES_ALTITUDE),
  [PAUSED_ID]: () => ({
    ...text(PAUSED_ID, "Paused", PAUSED_ALTITUDE),
    updatesWhilePaused: true,
  }),
  [PADDLE_ID]: paddleEntity,
}
/**
 * Two states: the start screen, and playing. Pausing is a flag on the second rather
 * than a state of its own, which is what the original does.
 */
var Game = [
  {
    create(entity, payload, api) {
      entity.scene = entity.state
      SCENES[entity.scene].forEach((id) => api.notify("add", BUILDERS[id]()))
    },
    stateChange(entity, { entityId, to }, api) {
      if (entityId !== entity.id) return
      const leaving = SCENES[entity.scene] ?? []
      const arriving = SCENES[to] ?? []
      leaving
        .filter((id) => !arriving.includes(id))
        .forEach((id) => api.notify("remove", id))
      arriving
        .filter((id) => !leaving.includes(id))
        .forEach((id) => api.notify("add", BUILDERS[id]()))
      entity.scene = to
    },
  },
  fsm({
    start: {
      pressMenuUp(entity, _, api) {
        chooseMenu(entity, -1)
        api.notify("soundPlay", SOUND_PADDLE_HIT)
      },
      pressMenuDown(entity, _, api) {
        chooseMenu(entity, 1)
        api.notify("soundPlay", SOUND_PADDLE_HIT)
      },
      press(entity, _, api) {
        api.notify("soundPlay", SOUND_CONFIRM)
        entity.state = GAME_STATE.play
      },
    },
    play: {
      togglePause(entity, _, api) {
        api.notify("soundPlay", SOUND_PAUSE)
        api.notify(entity.paused ? "resume" : "pause")
      },
    },
  }),
]
/** A line of the interface, placed the way the original centres its own text. */
function text(id, type, altitude) {
  return {
    id,
    type,
    layer: 2,
    position: positionFor(altitude),
  }
}
/**
 * The paddle floats a paddle's own height above the floor, anchored by its
 * bottom-left corner so that corner is what the bounds keep on screen.
 *
 * `movement` is declared up front rather than in the type's `create`, because a
 * movement event can be handled before the entity has been created.
 */
function paddleEntity() {
  return {
    id: PADDLE_ID,
    type: "Paddle",
    layer: 1,
    position: v(__vectorSubtract$1(__vectorDivide$1(432, 2), 32), 32, 0),
    anchor: [0, 0],
    size: v(64, 16, 0),
    movement: {},
  }
}
/** The menu wraps, so pressing up from the first item lands on the last. */
function chooseMenu(entity, step) {
  entity.menuItem =
    MENU_ITEMS[
      __vectorMod(
        __vectorSum(
          __vectorSum(MENU_ITEMS.indexOf(entity.menuItem), step),
          MENU_ITEMS.length,
        ),
        MENU_ITEMS.length,
      )
    ]
  return entity.menuItem
}
//#endregion
//#region ../../../packages/engine/src/behaviors/controls/event-handlers.js
function createMovementEventHandlers(events) {
  return events.reduce((acc, eventName) => {
    acc[eventName] = (entity, event) => {
      let entityId, value
      if (typeof event === "string") entityId = event
      else {
        entityId = event.entityId
        value = event.value
      }
      if (entityId === entity.id) entity.movement[eventName] = value ?? true
    }
    acc[`${eventName}End`] = (entity, entityId) => {
      if (entityId === entity.id) entity.movement[eventName] = false
    }
    return acc
  }, {})
}
//#endregion
//#region src/atlas.js
/**
 * `breakout.png` is one atlas that every sprite in the game is cropped from.
 *
 * The paddle bands are two rows deep, four colours down the sheet: blue on row 4,
 * green on 6, red on 8 and purple on 10. Within a band the four widths sit flush
 * against each other, so the 64 wide paddle starts one whole 32 wide paddle in, at
 * pixel (32, 64).
 *
 * `renderImage` reads `sx`/`sy` as tile indices on `tileSize`, so they are given in
 * pixels here and scaled down to the sheet's 32x16 grid. The 64 wide paddle is wider
 * than one cell, so it also covers the cell after it, which is what `frameSize` is
 * for: without it the renderer only ever reads one whole tile.
 */
function paddleFrame() {
  return {
    sx: 1,
    sy: 4,
    tileSize: [32, 16],
    frameSize: [64, 16],
    imageSize: [64, 16],
  }
}
/**
 * The paddle slides along the floor while it is being played, and stops dead while
 * the game is paused.
 *
 * Its movement is written out here rather than borrowed, for two reasons: the
 * bounds are the paddle's own (it must stay wholly on screen, not merely its
 * position), and a paused game has to be able to stop it, which a behaviour that
 * moves the entity after you cannot do.
 */
var Paddle = [
  {
    render: renderImage,
    create(entity) {
      entity.velocity = v(0, 0, 0)
      const frame = paddleFrame()
      entity.image = {
        id: "breakout",
        imageSize: frame.imageSize,
        tileSize: frame.tileSize,
        frameSize: frame.frameSize,
      }
      entity.sx = frame.sx
      entity.sy = frame.sy
    },
    update(entity, dt) {
      const { movement = {} } = entity
      entity.velocity = [
        (movement.moveRight ? 200 : 0) - (movement.moveLeft ? 200 : 0),
        0,
        0,
      ]
      ;((entity.position[0] = clamp$1(
        entity.position[0] + entity.velocity[0] * dt,
        0,
        368,
      )),
        (entity.position = ensureV(entity.position)))
    },
  },
  createMovementEventHandlers(["moveLeft", "moveRight"]),
]
//#endregion
//#region src/game.ijs
function __vectorDivide(a, b) {
  if (isVector(a) && isVector(b)) return divide(a, b)
  if (isVector(a) && !isVector(b)) return divide(a, b)
  if (!isVector(a) && isVector(b)) return divideBy(a, b)
  if (!isVector(a) && isVector(b))
    throw new Error("Cannot divide a non-vector by a vector.")
  return a / b
}
function __vectorSubtract(a, b) {
  if (isVector(a) && isVector(b)) return subtract(a, b)
  if (!isVector(a) && !isVector(b)) return a - b
  throw new Error("Cannot subtract a vector and a non-vector.")
}
var FPS_COLOR = "rgb(0, 255, 0)"
var game_default = {
  types: {
    ...controlTypes("game"),
    Game,
    Paddle,
    Title,
    Start,
    HighScores,
    Paused,
    /** The backdrop is drawn once, stretched to fill the screen. */
    Background: [
      {
        render: renderImage,
        create(entity) {
          entity.image = {
            id: "background",
            imageSize: [302, 129],
            scale: [__vectorDivide(432, 301), __vectorDivide(243, 128)],
          }
        },
      },
    ],
    Fps: [{ render: renderFps }, fps({ accuracy: 0 })],
  },
  entities: {
    ...createControlEntities(
      "game",
      {
        Enter: PRESS,
        Space: TOGGLE_PAUSE,
        ArrowUp: PRESS_MENU_UP,
        ArrowDown: PRESS_MENU_DOWN,
      },
      [],
    ),
    ...createControlEntities(
      "paddle",
      {
        ArrowLeft: "moveLeft",
        ArrowRight: "moveRight",
      },
      [],
    ),
    game: {
      type: "Game",
      devMode: true,
      pixelated: true,
      size: [432, 243],
      state: GAME_STATE.start,
      menuItem: MENU_START,
    },
    images: {
      type: "Images",
      images: {
        background: { url: "/images/background.png" },
        breakout: { url: "/images/breakout.png" },
      },
    },
    audio: {
      type: "Audio",
      sounds: {
        paddleHit: { url: "/sounds/paddle_hit.wav" },
        confirm: { url: "/sounds/confirm.wav" },
        pause: { url: "/sounds/pause.wav" },
      },
    },
    background: {
      type: "Background",
      layer: -1,
      position: v(0, 0, 0),
      anchor: [0, 0],
    },
    fps: {
      type: "Fps",
      updatesWhilePaused: true,
      layer: 3,
      position: v(__vectorSubtract(432, 10), __vectorSubtract(243, 10), 0),
      size: 8,
      color: FPS_COLOR,
      textAlign: "right",
    },
  },
}
//#endregion
//#region smoke.js
game_default.entities.game.devMode = false
var engine = new Engine(game_default)
var state = () => engine.getState()
var step = (n = 1) => {
  for (let i = 0; i < n; i++) engine.update(1 / 60)
}
var played = []
var audioType = engine._store.getType("Audio")
var playSound = audioType.soundPlay
audioType.soundPlay = function sound(entity, name) {
  played.push(name)
  return playSound.call(this, entity, name)
}
var press = (code) => {
  engine._store.notify("keyboardKeyDown", code)
  engine._store.notify("keyboardKeyUp", code)
  step(2)
}
var failures = 0
var check = (ok, l) => {
  if (!ok) failures++
  console.log(`${ok ? "PASS" : "FAIL"} ${l}`)
}
step(4)
check(state().game.menuItem === "start", "the menu starts on START")
check(state().title.value === "BREAKOUT", "the title reads BREAKOUT")
check(state().title.size === 32, "the title is the large font")
check(state().start.value === "START", "the first item reads START")
check(state().start.size === 16, "menu items use the medium font")
check(
  state().start.color === "rgb(103, 255, 255)",
  "START is picked out to begin with",
)
check(state().highScores.color === "white", "HIGH SCORES is not")
press("ArrowDown")
step(4)
check(state().game.menuItem === "high-scores", "down moves to HIGH SCORES")
check(state().highScores.color === "rgb(103, 255, 255)", "the pick-out follows")
check(state().start.color === "white", "and leaves the other one")
check(state().paddle === void 0, "the title screen has no paddle yet")
press("ArrowUp")
check(state().game.menuItem === "start", "up moves back to START")
press("ArrowUp")
check(state().game.menuItem === "high-scores", "the menu wraps upwards")
press("ArrowDown")
check(state().game.menuItem === "start", "and downwards")
check(
  state().background.image.imageSize.join() === "302,129",
  "the backdrop is drawn at its native size",
)
check(state().background.anchor.join() === "0,0", "anchored at the bottom left")
var scale = state().background.image.scale
check(scale[0] > 1 && scale[1] > 1, "the backdrop is stretched to fill")
check(
  scale[0] === 432 / 301 && scale[1] === 243 / 128,
  "and is scaled by the original's one-pixel-short factor",
)
check(
  state().title.position[1] > state().start.position[1],
  "the title sits above the menu",
)
check(
  state().start.position[1] > state().highScores.position[1],
  "START sits above HIGH SCORES",
)
check(state().title.textAlign === "center", "text is centred horizontally")
check(state().title.font === "'Breakout'", "text uses the loaded font")
check(state().title.position[0] === 216, "text is centred on the screen")
console.log(
  `\n${failures === 0 ? "all checks passed" : `${failures} check(s) failed`}`,
)
if (failures) process.exitCode = 1
press("Enter")
check(state().game.state === "play", "Enter leaves the start screen")
check(played.at(-1) === "confirm", "Enter sounds the confirm")
check(state().paddle !== void 0, "and the paddle arrives with it")
check(state().paddle.position[0] === 184, "the paddle starts centred")
check(state().paddle.position[1] === 32, "and floats a paddle's height clear")
check(state().title === void 0, "the title leaves with the menu")
check(state().start === void 0, "and so does START")
check(state().highScores === void 0, "and HIGH SCORES")
var hold = (code, frames = 30) => {
  engine._store.notify("keyboardKeyDown", code)
  step(frames)
  engine._store.notify("keyboardKeyUp", code)
  step(2)
}
var before = state().paddle.position[0]
hold("ArrowRight")
var movedRight = state().paddle.position[0]
check(
  movedRight > before,
  `the right arrow moves the paddle (${before} to ${movedRight})`,
)
hold("ArrowLeft", 60)
var movedLeft = state().paddle.position[0]
check(
  movedLeft < movedRight,
  `the left arrow moves it back (${movedRight} to ${movedLeft})`,
)
engine._store.notify("keyboardKeyDown", "ArrowRight")
var held = state().paddle.position[0]
step(30)
check(
  state().paddle.position[0] > held,
  "it keeps moving while the key is held",
)
engine._store.notify("keyboardKeyUp", "ArrowRight")
engine._store.notify("keyboardKeyDown", "ArrowRight")
step(400)
engine._store.notify("keyboardKeyUp", "ArrowRight")
step(2)
check(state().paddle.position[0] === 368, "the paddle stops at the right edge")
engine._store.notify("keyboardKeyDown", "ArrowLeft")
step(400)
engine._store.notify("keyboardKeyUp", "ArrowLeft")
step(2)
check(state().paddle.position[0] === 0, "and at the left edge")
engine._store.notify("keyboardKeyDown", "ArrowRight")
step(10)
press("Space")
engine._store.notify("keyboardKeyUp", "ArrowRight")
var pausedAt = state().paddle.position[0]
step(30)
check(state().game.paused === true, "space pauses")
check(state().paddle.position[0] === pausedAt, "a paused paddle does not move")
check(state().paused.value === "PAUSED", "PAUSED is shown while paused")
press("Space")
check(state().game.state === "play", "space resumes")
check(state().paused.value === "", "and PAUSED goes away")
check(played.at(-1) === "pause", "resuming sounds the pause again")
console.log(
  `\n${failures === 0 ? "all checks passed" : `${failures} check(s) failed`}`,
)
if (failures) process.exitCode = 1
//#endregion
export {}
