import { createGamepad, gamepadListener, gamepadsPoller } from "./gamepad.js"
import { createInput, input } from "./input.js"
import { createKeyboard, keyboard } from "./keyboard.js"
import { createPointer, pointer } from "./pointer.js"

export function controls(...targetIds) {
  return {
    Keyboard: [keyboard()],
    Pointer: [pointer()],
    GamepadsPoller: [gamepadsPoller(targetIds)],
    GamepadListener: [gamepadListener()],
    Input: [input()],
  }
}

export function createControls(targetId, mapping = {}, pointerActions = []) {
  return {
    gamepads: { type: "GamepadsPoller" },
    [`keyboard_${targetId}`]: createKeyboard(targetId, mapping),
    [`gamepad_${targetId}`]: createGamepad(targetId, mapping),
    [`input_${targetId}`]: createInput(targetId, mapping),
    [`pointer_${targetId}`]: createPointer(targetId, pointerActions),
  }
}
