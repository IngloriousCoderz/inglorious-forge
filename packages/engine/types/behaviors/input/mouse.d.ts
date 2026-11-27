import type { Vector3 } from "@inglorious/utils/vector.js"

import type { Entity, GameApi, Handler } from "../../index"

export interface MouseEntity extends Entity {
  position: Vector3
  /** The id of the entity pressed, until it is released. */
  pressedId?: string
  /** What `renderMouse` draws: `"crosshair"`, `"arrow"` or `"hand"`. */
  cursor?: string
}

/**
 * Follows the pointer, and notifies `entityPress`, `entityRelease` and
 * `entityClick` with the id of the entity under it, or `scenePress`,
 * `sceneRelease` and `sceneClick` with the position.
 */
export function mouse(): {
  create: Handler<MouseEntity>
  mouseMove: Handler<MouseEntity, Vector3>
  mouseDown: Handler<MouseEntity, Vector3>
  mouseUp: Handler<MouseEntity, Vector3>
  mouseClick: Handler<MouseEntity, Vector3>
}

/** Turns a point on the page into a position in the game. */
export type ToGamePosition = (clientX: number, clientY: number) => Vector3

/** DOM listeners that notify the mouse's events, in game positions. */
export function trackMouse(
  parent: HTMLElement | null,
  api: GameApi,
  toGamePosition: ToGamePosition,
): {
  onMouseMove: (event: MouseEvent) => void
  onClick: (event: MouseEvent) => void
  onMouseDown: (event: MouseEvent) => void
  onMouseUp: (event: MouseEvent) => void
  onMouseWheel: (event: WheelEvent) => void
}

export function createMouseEntity<TOverrides extends Partial<MouseEntity>>(
  overrides?: TOverrides,
): MouseEntity & { type: "Mouse"; layer: number } & TOverrides
