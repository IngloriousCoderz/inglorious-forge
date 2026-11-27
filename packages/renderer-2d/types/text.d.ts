import type { Entity, Handler } from "@inglorious/engine"

export interface TextParams {
  /** Lines are split on `\n`. */
  value?: string
  /** Pixels. Defaults to 16. */
  size?: number
  /** Defaults to `"sans-serif"`. */
  font?: string
  /** Defaults to `"black"`. */
  color?: string
  textAlign?: CanvasTextAlign
  /** Defaults to `"top"`. */
  baseline?: CanvasTextBaseline
}

export interface TextEntity
  extends Omit<Entity, "size">, Omit<TextParams, "size"> {
  size?: number
  /** Pixels between lines. Defaults to the size. */
  lineHeight?: number
}

export function renderText(
  entity: TextEntity,
  ctx: CanvasRenderingContext2D,
): void

/** A type that draws text, starting from `params`. */
export function text(params?: TextParams): {
  render: typeof renderText
  create: Handler<TextEntity>
}
