import type { TemplateResult } from "@inglorious/web"

import type { Renderable } from "../shared/renderable"

export interface BackdropProps {
  id?: string
  type?: string
  isOpen?: boolean
  className?: string
  children?: Renderable
  onClick?: (event: MouseEvent) => void
  [key: string]: unknown
}

export type BackdropType = {
  render(props: BackdropProps): TemplateResult | null
}

export declare const Backdrop: BackdropType
