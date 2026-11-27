import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Decorator, Handler } from "../../index"
import type { MouseEntity } from "./mouse"

/** Turns the mouse into a hand over anything with a hitbox. */
export function hover(cursors?: {
  /** The cursor away from anything pressable. Defaults to `"arrow"`. */
  off?: string
}): Decorator<{
  create: Handler<MouseEntity, unknown>
  mouseMove: Handler<MouseEntity, Vector3>
  mouseDown: Handler<MouseEntity, Vector3>
  mouseUp: Handler<MouseEntity, Vector3>
}>
