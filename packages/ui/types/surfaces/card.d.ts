import type { TemplateResult } from "@inglorious/web"

export interface CardProps {
  id?: string
  type?: string
  element?:
    | "article"
    | "section"
    | "div"
    | "main"
    | "header"
    | "footer"
    | "nav"
    | "aside"
  title?: TemplateResult | string | number
  subtitle?: TemplateResult | string | number
  header?: TemplateResult | string | number
  body?: TemplateResult | string | number
  children?: TemplateResult | string | number
  footer?: TemplateResult | string | number
  headerPadding?: "none" | "sm" | "md" | "lg" | "xl"
  bodyPadding?: "none" | "sm" | "md" | "lg" | "xl"
  footerPadding?: "none" | "sm" | "md" | "lg" | "xl"
  isHoverable?: boolean
  isClickable?: boolean
  isFullWidth?: boolean
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
