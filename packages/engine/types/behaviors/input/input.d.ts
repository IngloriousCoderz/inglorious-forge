import type { BaseEntity } from "@inglorious/store"

import type { Handler } from "../../index"

export interface InputEntity extends BaseEntity {
  type: "Input"
}

/**
 * Notifies each action by name: `moveLeft` with `{ value }` for an axis, with
 * nothing for a press, and `moveLeftEnd` on release.
 */
export function input(): {
  inputAxis: Handler<InputEntity, { action: string; value: number }>
  inputPress: Handler<InputEntity, { action: string }>
  inputRelease: Handler<InputEntity, { action: string }>
}

export function createInputEntity(): InputEntity
