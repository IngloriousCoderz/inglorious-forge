import type { BaseEntity } from "@inglorious/store"

import type { Handler } from "../../index"

/** Maps keys (by `code`), gamepad axes (`Axis0`…) and buttons (`Btn0`…) to actions. */
export type InputMapping = Record<string, string>

export interface KeyboardEntity extends BaseEntity {
  type: "Keyboard"
  mapping: InputMapping
}

/**
 * Turns key presses into `inputPress` and `inputRelease` of their actions,
 * and notifies `keyboardKeyDown`, `keyboardKeyUp` and `keyboardChar`.
 */
export function keyboard(): {
  create: Handler<KeyboardEntity, unknown>
  mappingChange: Handler<KeyboardEntity, InputMapping>
  stop: () => void
  destroy: () => void
  keyboardKeyDown: Handler<KeyboardEntity, string>
  keyboardKeyUp: Handler<KeyboardEntity, string>
}

export function createKeyboardEntity(mapping?: InputMapping): KeyboardEntity
