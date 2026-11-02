import type { TemplateResult, nothing } from "@inglorious/web"

export interface LightboxImage {
  src: string
  /** Defaults to empty, for images the page describes already. */
  alt?: string
}

export interface LightboxProps {
  id?: string
  /** URLs, or `{ src, alt }`. Renders nothing when empty. */
  images?: (string | LightboxImage)[]
  /** The image shown. Any integer: it wraps around. */
  index?: number
  isOpen?: boolean
  /** The dialog's accessible name. Defaults to `"Photos"`. */
  label?: string
  /** Defaults to `"Close"`. */
  closeLabel?: string
  /** Defaults to `"Previous photo"`. */
  previousLabel?: string
  /** Defaults to `"Next photo"`. */
  nextLabel?: string
  className?: string
  /** `1` for the next image, `-1` for the previous. Without it there is no navigation. */
  onStep?: (step: 1 | -1) => void
  /** Called by the close button, Esc and a press outside the image. */
  onClose?: () => void
}

export type LightboxType = {
  render(props: LightboxProps): TemplateResult | typeof nothing
}

export declare const Lightbox: LightboxType
