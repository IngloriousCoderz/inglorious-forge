import type { TemplateResult } from "@inglorious/web"

export interface DrawerProps {
  id?: string
  type?: string
  isOpen?: boolean
  anchor?: "left" | "right" | "top" | "bottom"
  variant?: "temporary" | "persistent" | "permanent" | "responsive"
  breakpoint?: "sm" | "md" | "lg" | "xl"
  isCollapsed?: boolean
  title?: TemplateResult | string | number
  children?: TemplateResult | string | number
  backdrop?: boolean
  className?: string
  onClose?: () => void
  [key: string]: unknown
}

export interface DrawerType {
  render(props: DrawerProps): TemplateResult | null
}

export declare const drawer: DrawerType
