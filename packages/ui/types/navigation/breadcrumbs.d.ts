import type { TemplateResult } from "@inglorious/web"

export interface BreadcrumbItem {
  id?: string | number
  label: TemplateResult | string | number
  href?: string
  onClick?: () => void
  [key: string]: unknown
}

export interface BreadcrumbsProps {
  id?: string
  type?: string
  items: BreadcrumbItem[]
  separator?: TemplateResult | string | number
  className?: string
  [key: string]: unknown
}

export interface BreadcrumbsType {
  render(props: BreadcrumbsProps): TemplateResult
  renderItem(
    item: BreadcrumbItem,
    index: number,
    props: BreadcrumbsProps,
  ): TemplateResult
}

export declare const breadcrumbs: BreadcrumbsType
