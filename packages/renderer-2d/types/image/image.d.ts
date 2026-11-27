import type { Anchor, Entity, GameApi } from "@inglorious/engine"

/** Which image to draw, by its id among the `Images`, and which part of it. */
export interface ImageParams {
  id: string
  /** Loaded on first use when the image is not among the `Images`. */
  src?: string
  /** Where the frame starts on the sheet, in pixels. */
  x?: number
  y?: number
  imageSize: readonly [width: number, height: number]
  /** Defaults to the image's size. */
  tileSize?: readonly [width: number, height: number]
  frameSize?: readonly [width: number, height: number]
  scale?: number | readonly [x: number, y: number]
  anchor?: Anchor
  /** Where the image repeats, for `infiniteScroll`. */
  loop?: readonly number[]
}

export interface ImageEntity extends Entity {
  image: ImageParams
  flipX?: boolean
  flipY?: boolean
  opacity?: number
  /** A colour multiplied over the image. */
  tint?: string
}

export function renderImage(
  entity: ImageEntity,
  ctx: CanvasRenderingContext2D,
  api: GameApi,
): void
