import type { TemplateResult } from "@inglorious/web"

export interface CardProps {
  id?: string
  type?: string
  title?: TemplateResult | string | number
  subtitle?: TemplateResult | string | number
  header?: TemplateResult | string | number
  body?: TemplateResult | string | number
  children?: TemplateResult | string | number
  footer?: TemplateResult | string | number
  hoverable?: boolean
  clickable?: boolean
  fullWidth?: boolean
  className?: string
  onClick?: () => void
  [key: string]: unknown
}

export interface CardType {
  render(props: CardProps): TemplateResult
  renderHeader(props: CardProps): TemplateResult | null
  renderBody(props: CardProps): TemplateResult | null
  renderFooter(props: CardProps): TemplateResult | null
}

export declare const card: CardType
