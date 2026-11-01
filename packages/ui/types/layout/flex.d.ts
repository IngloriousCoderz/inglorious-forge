import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

export interface FlexProps {
  id?: string
  type?: string
  /** The tag to render. Defaults to `"div"`. */
  element?: keyof HTMLElementTagNameMap
  className?: string
  direction?: "row" | "column" | "row-reverse" | "column-reverse"
  wrap?: "nowrap" | "wrap" | "wrap-reverse"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  align?: "stretch" | "start" | "center" | "end" | "baseline"
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  overflow?: "visible" | "hidden" | "clip" | "scroll" | "auto"
  isInline?: boolean
  isFullWidth?: boolean
  children?: Renderable
  onClick?: (event: MouseEvent) => void
  /** Any other property is set on the element, such as `style` or `data-*`. */
  [key: string]: unknown
}

export type FlexType = {
  render(props: FlexProps): TemplateResult
}

export declare const Flex: FlexType
