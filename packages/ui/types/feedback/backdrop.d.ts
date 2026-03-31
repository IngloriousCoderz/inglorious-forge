import type { TemplateResult } from "@inglorious/web"

export interface BackdropProps {
  id?: string
  type?: string
  isOpen?: boolean
  className?: string
  children?: TemplateResult | string | number
  onClick?: () => void
  [key: string]: unknown
}

export interface BackdropType {
  render(props: BackdropProps): TemplateResult | null
}

export declare const Backdrop: BackdropType
