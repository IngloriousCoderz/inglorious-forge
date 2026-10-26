import type { TemplateResult } from "@inglorious/web"

export interface DrawerProps {
  id?: string
  type?: string
  isOpen?: boolean
  anchor?: "left" | "right" | "top" | "bottom"
  /**
   * When the drawer overlays the page as a popover: `responsive` (default)
   * below 64rem and docked above, `temporary` at every width, `permanent` never.
   */
  variant?: "responsive" | "temporary" | "permanent"
  isHidden?: boolean
  isCollapsed?: boolean
  title?: TemplateResult | string | number
  children?: TemplateResult | string | number
  hasBackdrop?: boolean
  className?: string
  onClose?: () => void
  onCollapseToggle?: () => void
  [key: string]: unknown
}

export type DrawerType = {
  render(props: DrawerProps): TemplateResult
}

export declare const Drawer: DrawerType
