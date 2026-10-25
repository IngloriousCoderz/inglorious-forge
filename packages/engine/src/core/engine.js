import { createApi } from "@inglorious/store/api.js"
import { createDevtools } from "@inglorious/store/client/devtools.js"
import { multiplayerMiddleware } from "@inglorious/store/client/multiplayer-middleware.js"
import { createStore } from "@inglorious/store/store.js"
import { augmentType } from "@inglorious/store/types.js"
import {
  ensureArray,
  isArray,
} from "@inglorious/utils/data-structures/array.js"
import { isFunction } from "@inglorious/utils/functions"
import { extendWith, isObject } from "@inglorious/utils/object.js"
import { v } from "@inglorious/utils/v.js"
import { isVector } from "@inglorious/utils/vector.js"

import { audio } from "../behaviors/audio.js"
import { game } from "../behaviors/game.js"
import { images } from "../behaviors/images.js"
import { coreEvents } from "./core-events.js"
import { Loop } from "./loops/index.js"
import { entityPoolMiddleware } from "./middlewares/entity-pool/entity-pool-middleware.js"
import { assertTypesAreDeclared } from "./types.js"

// Default game configuration
/**
 * @type {{loop: {type: LoopType, fps: number}, systems: Array, types: Object, entities: Object}}
 *   `loop.type` is a {@link LoopType} and defaults to "animationFrame"; `loop.fps` is
 *   what the loops that have a rate measure themselves against, and is ignored by the
 *   ones that do not.
 */
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

    // Said before anything is made, because a type that was never declared is not an error
    // anywhere after this point -- it augments into an empty type, and everything sent to
    // the entity quietly goes nowhere.
    assertTypesAreDeclared(this._config)

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
   *
   * A game does this by notifying `quit`, which the `game` behaviour turns into a flag
   * the engine reads after the frame.
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
   *
   * @param {number} dt - Delta time since the last update in milliseconds.
   */
  update(dt) {
    // A game that has asked to quit is not updated again, and the loop that would have
    // asked is cancelled on the way past. Checking before the world moves is what makes
    // quitting mean the game is finished, rather than leaving the engine running a frame
    // behind a loop that has stopped asking.
    //
    // Before the notify rather than after it, because `stop` drains the queue on its way
    // out: an `update` queued and then abandoned would be picked up by that drain and
    // handed to the world as a last tick from a game that is already over.
    if (this._store.getState().game?.quit) {
      this.stop()
      return
    }

    this._store.notify("update", dt)
    const processedEvents = this._store.update()
    const entities = this._store.getState()

    // And a quit answered during that update -- which is how a key press reaches one --
    // ends the loop on the spot rather than a frame later. The frame that answered it
    // still ran to its end: a quit is given between frames, not in the middle of one.
    if (entities.game?.quit) {
      this.stop()
      return
    }

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
  // The default types and systems are lists of behaviors. A game that declares one
  // of them as a plain object is deep-merged anyway, but a decorator is a function
  // and would replace the list outright, so this is what keeps the built-in
  // behaviors underneath it.
  if (
    isArray(targetValue) &&
    !isVector(targetValue) &&
    isBehavior(sourceValue)
  ) {
    return [...targetValue, ...ensureArray(sourceValue)]
  }
}

function isBehavior(value) {
  if (isArray(value)) return !isVector(value)

  return isObject(value) || isFunction(value)
}

/**
 * @typedef {Object.<string, Object>} Entity - An object representing an entity.
 * @typedef {Object.<string, Entity>} Entities - A collection of entities indexed by id.
 * @typedef {import("./loops/index.js").LoopType} LoopType - Which loop drives the game.
 */
