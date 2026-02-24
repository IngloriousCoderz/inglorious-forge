import type { TemplateResult, Api } from "@inglorious/web"

export interface CardEntity {
  id?: string
  type?: string
  title?: string
  subtitle?: string
  hoverable?: boolean
  clickable?: boolean
  fullWidth?: boolean
}

export interface CardType {
  render(entity: CardEntity, api: Api): TemplateResult
  renderHeader(entity: CardEntity, api: Api): TemplateResult | null
  renderBody(entity: CardEntity, api: Api): TemplateResult
  renderFooter(entity: CardEntity, api: Api): TemplateResult | null
  click(entity: CardEntity, payload: unknown, api: Api): void
}

export declare const card: CardType
