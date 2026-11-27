import type { gamepad, GamepadEntity, gamepadsPoller } from "./gamepad"
import type { input, InputEntity } from "./input"
import type { InputMapping, keyboard, KeyboardEntity } from "./keyboard"
import type { pointer, PointerEntity } from "./pointer"

/** The types every control needs, spread under `types`. */
export function controlTypes(): {
  Keyboard: ReturnType<typeof keyboard>
  Pointer: ReturnType<typeof pointer>
  GamepadsPoller: ReturnType<typeof gamepadsPoller>
  Gamepad: ReturnType<typeof gamepad>
  Input: ReturnType<typeof input>
}

/**
 * The entities that listen for input, spread under `entities`. `mapping`
 * turns keys, axes and buttons into actions; a click or a touch presses
 * `pointerActions`.
 */
export function createControlEntities(
  mapping?: InputMapping,
  pointerActions?: string[],
): {
  gamepads: { type: "GamepadsPoller" }
  keyboard: KeyboardEntity
  gamepad: GamepadEntity
  input: InputEntity
  pointer: PointerEntity
}
