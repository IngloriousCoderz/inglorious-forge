import type { TemplateResult } from "@inglorious/web"

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
  render(props: CardProps): TemplateResult
  renderHeader(props: CardProps): TemplateResult | null
  renderBody(props: CardProps): TemplateResult
  renderFooter(props: CardProps): TemplateResult | null
}

export declare const card: CardType
