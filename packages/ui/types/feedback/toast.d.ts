import type { IconData } from "../data-display/icon"
import type { TemplateResult } from "@inglorious/web"

export interface ToastItem {
  /** Identifies the toast for `onClose` and `onClick`, and keeps its animation across renders. */
  id: string | number
  title?: TemplateResult | string
  message: TemplateResult | string | number
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
  icon?: IconData
  /** Milliseconds before it closes itself; `null` keeps it until closed. Defaults to the stack's `duration`. */
  duration?: number | null
}

export interface ToastProps {
  id?: string
  type?: string
  /** The toasts to show, newest first: the first is the closest to the edge. */
  toasts?: ToastItem[]
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"
  /** Milliseconds before a toast closes itself. Defaults to 5000. */
  duration?: number | null
  className?: string
  /** Called when a toast is dismissed or its time runs out. */
  onClose?: (id: ToastItem["id"]) => void
  /** Makes each toast a button. */
  onClick?: (id: ToastItem["id"]) => void
  /** The close button's accessible name. Defaults to "Dismiss". */
  dismissLabel?: string
  [key: string]: unknown
}

export type ToastType = {
  render(props: ToastProps): TemplateResult | null
  renderToast(toast: ToastItem, props: ToastProps): TemplateResult
}

export declare const Toast: ToastType
