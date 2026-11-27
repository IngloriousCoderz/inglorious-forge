import type { Entity } from "@inglorious/engine"

export interface RectangleEntity extends Entity {
  /** The outline's colour. Defaults to `"black"`. */
  color?: string
  /** Defaults to `"transparent"`. */
  backgroundColor?: string
  /** The outline's width. Defaults to 1. */
  thickness?: number
  /** From 0 to 1. Defaults to 1. */
  opacity?: number
}

/** Draws a box of the entity's size, 100 by 50 without one, from its anchor. */
export function renderRectangle(
  entity: RectangleEntity,
  ctx: CanvasRenderingContext2D,
): void
