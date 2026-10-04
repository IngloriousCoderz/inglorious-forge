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
 * @example
 * ```js
 * types: { ...controlTypes("game"), Game, Bird }
 * ```
 */
export function controlTypes(...targetIds) {
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
export function createControlEntities(
  targetId,
  mapping = {},
  pointerActions = [],
) {
  return {
    gamepads: { type: "GamepadsPoller" },
    [`keyboard_${targetId}`]: createKeyboardEntity(targetId, mapping),
    [`gamepad_${targetId}`]: createGamepadEntity(targetId, mapping),
    [`input_${targetId}`]: createInputEntity(targetId, mapping),
    [`pointer_${targetId}`]: createPointerEntity(targetId, pointerActions),
  }
}
