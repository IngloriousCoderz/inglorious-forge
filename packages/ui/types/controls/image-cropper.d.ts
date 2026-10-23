import type { TemplateResult, Api } from "@inglorious/web"

/** A crop frame in fractions of the image: 0-1 on both axes. */
export interface CropRect {
  x: number
  y: number
  w: number
  h: number
}

export interface ImageCropperProps {
  id?: string
  type?: string
  label?: string

  src?: string
  alt?: string

  /** The crop frame in image fractions. The persistent state. */
  rect?: CropRect
  /** Output width/height in pixels to lock the frame to; null crops freely. */
  aspectRatio?: number | null
  /** Smallest frame side, as a fraction of the image. */
  minSize?: number
  /** Keyboard increment, as a fraction of the image. */
  step?: number

  /** The image's natural size, set when it loads. 0 until then. */
  naturalWidth?: number
  naturalHeight?: number
  hasError?: boolean

  isDisabled?: boolean

  onImageError?: () => void
  onImageLoad?: (size: { width: number; height: number }) => void
  onRectChange?: (rect: CropRect) => void
  [key: string]: unknown
}

export interface CropImageOptions {
  /** Used when no rect is given: crop the largest centred frame at this ratio. */
  aspectRatio?: number | null
  maxWidth?: number
  maxHeight?: number
  /** Output MIME type. Defaults to "image/jpeg". */
  type?: string
  /** Encoder quality, 0-1. Defaults to 0.9. */
  quality?: number
  /** Fill behind transparent pixels for opaque formats. Defaults to "white". */
  background?: string | null
}

export type ImageCropperType = {
  create(entity: ImageCropperProps): void
  imageError(entity: ImageCropperProps): void
  imageLoad(
    entity: ImageCropperProps,
    size: { width: number; height: number },
  ): void
  rectChange(entity: ImageCropperProps, rect: CropRect): void
  srcChange(
    entity: ImageCropperProps,
    payload: string | { src: string; rect?: CropRect },
  ): void
  render(entity: ImageCropperProps, api: Api): TemplateResult
  renderImageCropper(props: ImageCropperProps): TemplateResult
  renderImage(props: ImageCropperProps): TemplateResult
  renderFrame(props: ImageCropperProps): TemplateResult
  renderHandle(props: ImageCropperProps, handle: string): TemplateResult
}

export declare const ImageCropper: ImageCropperType

export declare function cropImage(
  file: Blob,
  rect?: CropRect | null,
  options?: CropImageOptions,
): Promise<Blob>

export declare function decodeImage(
  file: Blob,
): Promise<ImageBitmap | HTMLImageElement>
