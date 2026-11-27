import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Collision, Entity, GameApi, Handler } from "../../index"
import type { ToGamePosition } from "./mouse"

export interface TouchEntity extends Entity {
  /** Each finger's position, by its index. */
  positions: (Vector3 | undefined)[]
  /** The entity each finger is on, by its index. */
  targetIds: (string | undefined)[]
  isSwiping?: boolean
  collisions: Record<string, Collision>
}

/** What a touch event carries: which finger, and where. */
export interface TouchPayload {
  index: number
  position: Vector3
}

/**
 * Notifies `entityTouchStart`, `entityTouchMove` and `entityTouchEnd` for the
 * entity under a finger, or `sceneTouchStart`, `sceneTouchEnd` with the position.
 */
export function touch(): {
  touchStart: Handler<TouchEntity, TouchPayload>
  touchMove: Handler<TouchEntity, TouchPayload>
  touchEnd: Handler<TouchEntity, Pick<TouchPayload, "index">>
}

/** DOM listeners that notify the touch events, in game positions. */
export function trackTouch(
  parent: HTMLElement | null,
  api: GameApi,
  toGamePosition: ToGamePosition,
): {
  onTouchStart: (event: TouchEvent) => void
  onTouchMove: (event: TouchEvent) => void
  onTouchCancel: (event: TouchEvent) => void
  onTouchEnd: (event: TouchEvent) => void
}

export function createTouchEntity(): TouchEntity & {
  type: "Touch"
  layer: number
}
