import type { TemplateResult } from "@inglorious/web"

export interface TabItem {
  id?: string | number
  value?: string | number
  label: TemplateResult | string | number
  icon?: TemplateResult | string | number
  panel?: TemplateResult | string | number
  disabled?: boolean
  onClick?: (value: string | number) => void
  [key: string]: unknown
}

export interface TabsProps {
  id?: string
  type?: string
  items?: TabItem[]
  value?: string | number
  centered?: boolean
  fullWidth?: boolean
  onChange?: (value: string | number) => void
  [key: string]: unknown
}

export interface TabsType {
  render(props: TabsProps): TemplateResult
  renderTab(item: TabItem, index: number, props: TabsProps): TemplateResult
  renderPanel(item: TabItem | null, props: TabsProps): TemplateResult | null
}

export declare const tabs: TabsType
