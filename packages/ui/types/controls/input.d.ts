import type { TemplateResult, Api } from "@inglorious/web"

export interface InputEntity {
  id?: string
  name?: string
  type?: "text" | "password" | "email" | "number" | "tel" | "url" | "search"
  value?: string
  placeholder?: string
  label?: string
  hint?: string
  error?: string
  size?: "sm" | "md" | "lg"
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  fullWidth?: boolean
  icon?: string
  iconAfter?: string
  [key: string]: unknown
}

export interface InputType {
  render(entity: InputEntity, api: Api): TemplateResult
  change(entity: InputEntity, payload: string, api: Api): void
  blur(entity: InputEntity, payload: unknown, api: Api): void
  focus(entity: InputEntity, payload: unknown, api: Api): void
}

export declare const input: InputType
