import type { TemplateResult, Api } from "@inglorious/web"

export interface CardEntity {
  id?: string
  title?: string
  subtitle?: string
  hoverable?: boolean
  clickable?: boolean
  fullWidth?: boolean
  header?: TemplateResult
  footer?: TemplateResult
}

export interface CardType {
  render(entity: CardEntity, api: Api): TemplateResult
  click(entity: CardEntity, payload: unknown, api: Api): void
}

export declare const card: CardType
