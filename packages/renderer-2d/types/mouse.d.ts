import type { Entity } from "@inglorious/engine"

export interface CursorEntity extends Entity {
  /** `"crosshair"`, `"arrow"` or `"hand"`. Defaults to `"crosshair"`. */
  cursor?: string
  /** Defaults to `"black"`. */
  color?: string
  /** Defaults to `"black"`. */
  outlineColor?: string
  thickness?: number
}

export function renderMouse(
  entity: CursorEntity,
  ctx: CanvasRenderingContext2D,
): void
