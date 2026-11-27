import type { BaseEntity } from "@inglorious/store"
import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Handler } from "../../index"

export interface PointerEntity extends BaseEntity {
  type: "Pointer"
  /** The actions a click or a touch presses. */
  actions: string[]
}

/** Presses the entity's actions on a click, or for as long as a touch lasts. */
export function pointer(): {
  mouseClick: Handler<PointerEntity, Vector3>
  touchStart: Handler<PointerEntity, { index: number; position: Vector3 }>
  touchEnd: Handler<PointerEntity, { index: number; position: Vector3 }>
}

export function createPointerEntity(actions?: string[]): PointerEntity
