import type { TemplateResult } from "@inglorious/web"

export interface ProgressProps {
  id?: string
  type?: string
  variant?: "linear" | "circular"
  value?: number
  size?: number
  thickness?: number
  className?: string
  [key: string]: unknown
}

export interface ProgressType {
  render(props: ProgressProps): TemplateResult
}

export declare const progress: ProgressType
