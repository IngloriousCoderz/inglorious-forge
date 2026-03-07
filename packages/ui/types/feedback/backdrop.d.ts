import type { TemplateResult } from "@inglorious/web"

export interface BackdropProps {
  id?: string
  type?: string
  open?: boolean
  className?: string
  onClick?: () => void
  children?: TemplateResult | string | number
  [key: string]: unknown
}

export interface BackdropType {
  render(props: BackdropProps): TemplateResult | null
}

export declare const backdrop: BackdropType
