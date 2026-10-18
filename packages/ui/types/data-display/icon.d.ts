import type { TemplateResult } from "@inglorious/web"

/**
 * An icon in the Iconify format, as every set on `@iconify-icons/*` exports
 * it: `import arrowBack from "@iconify-icons/material-symbols/arrow-back"`.
 */
export interface IconData {
  /** The SVG content, without the `<svg>` element. */
  body: string
  /** The viewBox. Defaults to 16 by 16 at the origin. */
  width?: number
  height?: number
  left?: number
  top?: number
}

export interface IconProps {
  id?: string
  /** The icon to draw, as inline SVG at the size's font size. */
  icon?: IconData
  /** Shown when there is no `icon`: an emoji, a glyph, any markup. */
  children?: TemplateResult | string | number
  size?: "sm" | "md" | "lg"
  color?: string
  /**
   * The direction of the text the icon sits in. An icon that points along the
   * line (a back arrow, a chevron) is mirrored with `"rtl"`. Defaults to `"ltr"`.
   */
  direction?: "ltr" | "rtl"
  /** Names an icon that means something on its own. Without it the icon is decorative. */
  label?: string
  className?: string
  onClick?: () => void
  [key: string]: unknown
}

export interface IconType {
  render(props: IconProps): TemplateResult
}

export declare const Icon: IconType
