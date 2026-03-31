import type { TemplateResult } from "@inglorious/web"

export interface ContainerProps {
  id?: string
  type?: string
  element?:
    | "div"
    | "section"
    | "main"
    | "header"
    | "footer"
    | "nav"
    | "aside"
    | "article"
  children?: TemplateResult | string | number
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "none" | false | number | string
  isFixed?: boolean
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  isCentered?: boolean
  className?: string
  [key: string]: unknown
}

export interface ContainerType {
  render(props: ContainerProps): TemplateResult
}

export declare const Container: ContainerType
