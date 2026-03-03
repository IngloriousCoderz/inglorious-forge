import type { TemplateResult } from "@inglorious/web"

export interface MaterialIconProps {
  id?: string
  name?: string
  size?: "sm" | "md" | "lg"
  filled?: boolean
  [key: string]: unknown
}

export interface MaterialIconType {
  render(props: MaterialIconProps): TemplateResult
}

export declare const materialIcon: MaterialIconType
