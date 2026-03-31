import { createGamepad, gamepadListener, gamepadsPoller } from "./gamepad.js"
import { createInput, input } from "./input.js"
import { createKeyboard, keyboard } from "./keyboard.js"

export function controls(...targetIds) {
  return {
    Keyboard: [keyboard()],
    GamepadsPoller: [gamepadsPoller(targetIds)],
    GamepadListener: [gamepadListener()],
    Input: [input()],
  }
}

export function createControls(targetId, mapping = {}) {
  return {
    gamepads: { type: "GamepadsPoller" },
    [`keyboard_${targetId}`]: createKeyboard(targetId, mapping),
    [`gamepad_${targetId}`]: createGamepad(targetId, mapping),
    [`input_${targetId}`]: createInput(targetId, mapping),
  }
}
