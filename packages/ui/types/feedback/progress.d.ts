import type { TemplateResult } from "@inglorious/web"

export interface ProgressProps {
  id?: string
  type?: string
  variant?: "linear" | "circular"
  value?: number
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
  size?: number
  thickness?: number
  /** Names the indicator for assistive tech, e.g. "Uploading photo". */
  ariaLabel?: string
  className?: string
  [key: string]: unknown
}

export type ProgressType = {
  render(props: ProgressProps): TemplateResult
}

export declare const Progress: ProgressType
