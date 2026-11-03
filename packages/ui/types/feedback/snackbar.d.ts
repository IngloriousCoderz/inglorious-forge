import type { TemplateResult } from "@inglorious/web"

export interface SnackbarProps {
  id?: string
  type?: string
  isOpen?: boolean
  message?: TemplateResult | string | number
  action?: TemplateResult | string | number
  position?:
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
    | "top-left"
    | "top-center"
    | "top-right"
  className?: string
  onClose?: () => void
  /** The dismiss button's accessible name. Defaults to "Dismiss". */
  dismissLabel?: string
  [key: string]: unknown
}

export type SnackbarType = {
  render(props: SnackbarProps): TemplateResult | null
}

export declare const Snackbar: SnackbarType
