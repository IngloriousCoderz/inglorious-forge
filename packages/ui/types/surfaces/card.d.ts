import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

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
  /**
   * The surface: raised (`"default"`), `"sunk"` into the page for content
   * inside another surface, or `"clear"` with none.
   */
  variant?: "default" | "sunk" | "clear"
  title?: TemplateResult | string | number
  subtitle?: TemplateResult | string | number
  header?: TemplateResult | string | number
  body?: TemplateResult | string | number
  children?: Renderable
  footer?: TemplateResult | string | number
  headerPadding?: "none" | "sm" | "md" | "lg" | "xl"
  bodyPadding?: "none" | "sm" | "md" | "lg" | "xl"
  footerPadding?: "none" | "sm" | "md" | "lg" | "xl"
  isHoverable?: boolean
  isClickable?: boolean
  isFullWidth?: boolean
  className?: string
  onClick?: (event: MouseEvent) => void
  [key: string]: unknown
}

export type CardType = {
  render(props: CardProps): TemplateResult
  renderCard(props: CardProps): TemplateResult
  renderHeader(props: CardProps): TemplateResult | null
  renderBody(props: CardProps): TemplateResult | null
  renderFooter(props: CardProps): TemplateResult | null
}

export declare const Card: CardType
