import type { TemplateResult, Api } from "@inglorious/web"

export interface AvatarEntity {
  id?: string
  src?: string
  alt?: string
  initials?: string
  size?: "sm" | "md" | "lg"
  shape?: "circle" | "square"
  children?: TemplateResult | string | number
  [key: string]: unknown
}

export interface AvatarType {
  render(entity: AvatarEntity, api: Api): TemplateResult
}

export declare const avatar: AvatarType
