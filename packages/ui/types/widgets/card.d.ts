import type { TemplateResult, Api } from "@inglorious/web"

export interface CardProps {
  id?: string
  type?: string
  title?: string
  subtitle?: string
  hoverable?: boolean
  clickable?: boolean
  fullWidth?: boolean
  onClick?: () => void
}

export interface CardType {
  render(entity: CardProps, api: Api): TemplateResult
  renderHeader(entity: CardProps, api: Api): TemplateResult | null
  renderBody(entity: CardProps, api: Api): TemplateResult
  renderFooter(entity: CardProps, api: Api): TemplateResult | null
}

export declare const card: CardType
