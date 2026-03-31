import type { TemplateResult } from "@inglorious/web"

export interface IconProps {
  id?: string
  children?: TemplateResult | string | number
  size?: "sm" | "md" | "lg"
  color?: string
  onClick?: () => void
  [key: string]: unknown
}

export interface IconType {
  render(props: IconProps): TemplateResult
}

export declare const Icon: IconType
