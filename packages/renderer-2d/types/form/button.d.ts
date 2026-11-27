import type { Entity } from "@inglorious/engine"

export interface ButtonEntity extends Omit<Entity, "size"> {
  /** Defaults to 100 by 50; depth counts as height. */
  size?: readonly number[]
  /** The outline's and the label's colour. Defaults to `"black"`. */
  color?: string
  thickness?: number
  label?: string
  labelColor?: string
  /** Defaults to 14. */
  labelSize?: number
  /** White while `"pressed"`. */
  state?: string
}

export function renderButton(
  entity: ButtonEntity,
  ctx: CanvasRenderingContext2D,
): void
