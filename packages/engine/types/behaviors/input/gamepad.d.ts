import type { BaseEntity } from "@inglorious/store"

import type { Handler, UpdateHandler } from "../../index"
import type { InputMapping } from "./keyboard"

export interface GamepadsPollerEntity extends BaseEntity {
  gamepadStateCache?: Record<number, { axes: number[]; buttons: boolean[] }>
}

export interface GamepadEntity extends BaseEntity {
  type: "Gamepad"
  mapping: InputMapping
}

/** Polls the gamepads every frame, and notifies `gamepadAxis`, `gamepadPress` and `gamepadRelease`. */
export function gamepadsPoller(): {
  create: Handler<GamepadsPollerEntity>
  update: UpdateHandler<GamepadsPollerEntity>
}

/** Turns gamepad axes and buttons into `inputAxis`, `inputPress` and `inputRelease`. */
export function gamepad(): {
  mappingChange: Handler<GamepadEntity, InputMapping>
  gamepadAxis: Handler<GamepadEntity, { axis: string; value: number }>
  gamepadPress: Handler<GamepadEntity, { button: string }>
  gamepadRelease: Handler<GamepadEntity, { button: string }>
}

export function createGamepadEntity(mapping?: InputMapping): GamepadEntity
