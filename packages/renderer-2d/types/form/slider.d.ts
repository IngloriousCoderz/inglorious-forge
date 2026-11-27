import type { Entity } from "@inglorious/engine"

export interface SliderEntity extends Omit<Entity, "size"> {
  /** Defaults to 100 by 20. */
  size?: readonly number[]
  /** The knob's and the filled track's colour. Defaults to `"white"`. */
  color?: string
  backgroundColor?: string
  label?: string
  labelColor?: string
  labelSize?: number
  /** The track's height. Defaults to 4. */
  thickness?: number
  min?: number
  max?: number
  step?: number
  value?: number
}

export function renderSlider(
  entity: SliderEntity,
  ctx: CanvasRenderingContext2D,
): void
