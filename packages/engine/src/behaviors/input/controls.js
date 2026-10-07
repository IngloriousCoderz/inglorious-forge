import { createGamepadEntity, gamepad, gamepadsPoller } from "./gamepad.js"
import { createInputEntity, input } from "./input.js"
import { createKeyboardEntity, keyboard } from "./keyboard.js"
import { createPointerEntity, pointer } from "./pointer.js"

/**
 * The types every control needs, composed once and listed under `types`.
 *
 * Each one is a bare behavior rather than a list of them, because nothing else
 * defines these types for it to compose onto: the engine only appends to a type
 * that is already a list, which is how a game keeps the built-in ones. To add to
 * a control type, list the behaviors instead, as in `Keyboard: [keyboard(), …]`.
 *
 * There is one of each per game. A game has one keyboard, one pointer and one
 * gamepad mapping, and an action's name is what addresses it: a type that handles
 * `moveLeft` is the type that answers to it.
 *
 * @example
 * ```js
 * types: { ...controlTypes(), Game, Bird }
 * ```
 */
export function controlTypes() {
  return {
    Keyboard: keyboard(),
    Pointer: pointer(),
    GamepadsPoller: gamepadsPoller(),
    Gamepad: gamepad(),
    Input: input(),
  }
}

/**
 * The entities that listen for input on the game's behalf, spread under `entities`.
 * The mapping turns a key, axis or button into an action the rest of the game
 * listens for by name.
 *
 * @example
 * ```js
 * entities: {
 *   ...createControlEntities({ Space: "press" }, ["sceneClick"]),
 *   game: { type: "Game" },
 * }
 * ```
 */
export function createControlEntities(mapping = {}, pointerActions = []) {
  return {
    gamepads: { type: "GamepadsPoller" },
    keyboard: createKeyboardEntity(mapping),
    gamepad: createGamepadEntity(mapping),
    input: createInputEntity(),
    pointer: createPointerEntity(pointerActions),
  }
}
