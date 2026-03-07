import type { TemplateResult } from "@inglorious/web"

export interface SkeletonProps {
  id?: string
  type?: string
  variant?: "text" | "rect" | "circle"
  width?: number | string
  height?: number | string
  lines?: number
  className?: string
  [key: string]: unknown
}

export interface SkeletonType {
  render(props: SkeletonProps): TemplateResult
}

export declare const skeleton: SkeletonType
