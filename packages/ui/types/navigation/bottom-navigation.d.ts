import type { TemplateResult } from "@inglorious/web"

export interface BottomNavigationAction {
  id?: string | number
  value?: string | number
  label: TemplateResult | string | number
  icon?: TemplateResult | string | number
  isDisabled?: boolean
  onClick?: (value: string | number) => void
  [key: string]: unknown
}

export interface BottomNavigationProps {
  id?: string
  type?: string
  actions?: BottomNavigationAction[]
  value?: string | number
  hasLabels?: boolean
  className?: string
  onChange?: (value: string | number) => void
  [key: string]: unknown
}

export interface BottomNavigationType {
  render(props: BottomNavigationProps): TemplateResult
  renderBottomNavigation(props: BottomNavigationProps): TemplateResult
  renderAction(
    action: BottomNavigationAction,
    index: number,
    props: BottomNavigationProps,
  ): TemplateResult
}

export declare const BottomNavigation: BottomNavigationType
