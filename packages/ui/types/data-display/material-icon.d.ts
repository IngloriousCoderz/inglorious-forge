import type { TemplateResult, Api } from "@inglorious/web"

export interface MaterialIconProps {
  id?: string
  name?: string
  size?: "sm" | "md" | "lg"
  filled?: boolean
  [key: string]: unknown
}

export interface MaterialIconType {
  render(entity: MaterialIconProps, api: Api): TemplateResult
}

export declare const materialIcon: MaterialIconType
