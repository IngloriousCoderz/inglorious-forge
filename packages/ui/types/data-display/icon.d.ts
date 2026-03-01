import type { TemplateResult, Api } from "@inglorious/web"

export interface IconProps {
  id?: string
  children?: TemplateResult | string | number
  size?: "sm" | "md" | "lg"
  color?: string
  onClick?: () => void
  [key: string]: unknown
}

export interface IconType {
  render(entity: IconProps, api: Api): TemplateResult
}

export declare const icon: IconType
