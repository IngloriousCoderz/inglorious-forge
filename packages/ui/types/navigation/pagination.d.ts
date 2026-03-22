import type { TemplateResult } from "@inglorious/web"

export interface PaginationProps {
  id?: string
  type?: string
  page?: number
  count?: number
  siblingCount?: number
  isFirstButtonVisible?: boolean
  isLastButtonVisible?: boolean
  isDisabled?: boolean
  buttonVariant?: "default" | "outline" | "ghost"
  buttonColor?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
  buttonSize?: "sm" | "md" | "lg"
  itemClassName?: string
  className?: string
  onChange?: (page: number) => void
  [key: string]: unknown
}

export interface PaginationItemRenderProps {
  item: number | string
}

export interface PaginationControlRenderProps {
  label: string
  target: number
  isDisabled?: boolean
  onChange?: (page: number) => void
}

export interface PaginationType {
  render(props: PaginationProps): TemplateResult
  renderPagination(props: PaginationProps): TemplateResult
  renderItem(
    props: PaginationProps,
    payload: PaginationItemRenderProps,
  ): TemplateResult
  renderControl(
    props: PaginationProps,
    payload: PaginationControlRenderProps,
  ): TemplateResult
}

export declare const pagination: PaginationType
