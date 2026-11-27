import type { Entity } from "@inglorious/engine"

export interface CircleEntity extends Entity {
  /** Defaults to 24. */
  radius?: number
  /** The outline's colour. Defaults to `"black"`. */
  color?: string
  /** Defaults to `"transparent"`. */
  backgroundColor?: string
  /** The outline's width. Defaults to 1. */
  thickness?: number
}

export function renderCircle(
  entity: CircleEntity,
  ctx: CanvasRenderingContext2D,
): void
