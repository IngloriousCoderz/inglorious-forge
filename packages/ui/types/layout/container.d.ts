import type { TemplateResult } from "@inglorious/web"

export interface ContainerProps {
  id?: string
  type?: string
  children?: TemplateResult | string | number
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | "none" | false | number | string
  isFixed?: boolean
  isGutterless?: boolean
  isCentered?: boolean
  className?: string
  [key: string]: unknown
}

export interface ContainerType {
  render(props: ContainerProps): TemplateResult
}

export declare const container: ContainerType
