import type { TemplateResult } from "@inglorious/web"

export interface AvatarProps {
  id?: string
  src?: string
  alt?: string
  initials?: string
  size?: "sm" | "md" | "lg"
  shape?: "circle" | "square"
  children?: TemplateResult | string | number
  onClick?: () => void
  [key: string]: unknown
}

export interface AvatarType {
  render(props: AvatarProps): TemplateResult
}

export declare const avatar: AvatarType
