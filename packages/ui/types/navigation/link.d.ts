import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

export interface LinkProps {
  id?: string
  type?: string
  href?: string
  label?: TemplateResult | string | number
  children?: Renderable
  underline?: "always" | "hover" | "none"
  color?: "primary" | "secondary" | "inherit"
  isMuted?: boolean
  isExternal?: boolean
  className?: string
  onClick?: (event: MouseEvent) => void
  [key: string]: unknown
}

export type LinkType = {
  render(props: LinkProps): TemplateResult
}

export declare const Link: LinkType
