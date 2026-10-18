import type { TemplateResult } from "@inglorious/web"

export interface MaterialIconProps {
  id?: string
  name?: string
  size?: "sm" | "md" | "lg"
  isFilled?: boolean
  /**
   * The direction of the text the icon sits in. An icon that points along the
   * line (a back arrow, a chevron) is mirrored with `"rtl"`. Defaults to `"ltr"`.
   */
  direction?: "ltr" | "rtl"
  onClick?: () => void
  [key: string]: unknown
}

export interface MaterialIconType {
  render(props: MaterialIconProps): TemplateResult
}

export declare const MaterialIcon: MaterialIconType
