import { audio } from "@inglorious/engine/behaviors/audio.js"
import { game } from "@inglorious/engine/behaviors/game.js"
import { images } from "@inglorious/engine/behaviors/images.js"
import { createApi } from "@inglorious/store/api.js"
import { createDevtools } from "@inglorious/store/client/devtools.js"
import { multiplayerMiddleware } from "@inglorious/store/client/multiplayer-middleware.js"
import { createStore } from "@inglorious/store/store.js"
import { augmentType } from "@inglorious/store/types.js"
import { isArray } from "@inglorious/utils/data-structures/array.js"
import { extendWith } from "@inglorious/utils/data-structures/objects.js"
import { isVector } from "@inglorious/utils/math/vector.js"
import { v } from "@inglorious/utils/v.js"

import { coreEvents } from "./core-events.js"
import { Loop } from "./loops/index.js"
import { entityPoolMiddleware } from "./middlewares/entity-pool/entity-pool-middleware.js"

// Default game configuration
// loop.type specifies the type of loop to use (defaults to "animationFrame").
const DEFAULT_GAME_CONFIG = {
  loop: { type: "animationFrame", fps: 60 },

  systems: [],

  types: {
    Game: [game()],
    Audio: [audio()],
    Images: [images()],
  },

  entities: {
    // eslint-disable-next-line no-magic-numbers
    game: { type: "Game", size: v(800, 600) },
    audio: { type: "Audio", sounds: {} },
    images: { type: "Images", images: {} },
  },
}

const ONE_SECOND = 1000 // Number of milliseconds in one second.

/**
 * Engine class responsible for managing the game loop, state, and rendering.
 */
export class Engine {
  /**
   * @param {...Object} gameConfigs - Game-specific configurations.
   */
  constructor(...gameConfigs) {
    this._config = extendWith(merger, DEFAULT_GAME_CONFIG, ...gameConfigs)

    // Determine devMode from the entities config
    const devMode = this._config.entities.game?.devMode
    this._devMode = devMode

    const middlewares = []

    // Always add entity pool middleware
    middlewares.push(entityPoolMiddleware())

    // Add multiplayer middleware if needed
    const multiplayer = this._config.entities.game?.multiplayer
    if (multiplayer) {
      middlewares.push(
        multiplayerMiddleware({ ...multiplayer, blacklist: coreEvents }),
      )
    }

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
    if (this._devMode) {
      this._devtools.connect(this._store)
    }
  }

  async init() {
    const api = createApi(this._store)
    return Promise.all(
      Object.values(this._config.entities).map((entity) => {
        const originalType = this._config.types[entity.type]
        const type = augmentType(originalType)
        return type.init?.(entity, null, api)
      }),
    )
  }

  /**
   * Starts the game engine, initializing the loop and notifying the store.
   */
  start() {
    this._store.notify("start")
    this._loop.start(this, ONE_SECOND / this._config.loop.fps)
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
   * Updates the game state.
   * @param {number} dt - Delta time since the last update in milliseconds.
   */
  update(dt) {
    this._store.notify("update", dt)
    const processedEvents = this._store.update()
    const entities = this._store.getState()

    // Check for devMode changes and connect/disconnect dev tools accordingly.
    const newDevMode = entities.game?.devMode
    if (newDevMode !== this._devMode) {
      if (newDevMode) {
        this._devtools.connect(this._store)
      } else {
        this._devtools.disconnect()
      }
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
  if (
    isArray(targetValue) &&
    !isVector(targetValue) &&
    isArray(sourceValue) &&
    !isVector(sourceValue)
  ) {
    return [...targetValue, ...sourceValue]
  }
}
