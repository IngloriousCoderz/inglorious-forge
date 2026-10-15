import type { TemplateResult } from "@inglorious/web"

export interface MaterialIconProps {
  id?: string
  name?: string
  size?: "sm" | "md" | "lg"
  isFilled?: boolean
  onClick?: () => void
  [key: string]: unknown
}

export interface MaterialIconType {
  render(props: MaterialIconProps): TemplateResult
}

export declare const MaterialIcon: MaterialIconType
