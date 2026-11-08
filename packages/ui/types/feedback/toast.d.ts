import type { IconData } from "../data-display/icon"
import type { Api, TemplateResult } from "@inglorious/web"

/** A toast as `show` takes it: without an id, one is assigned. */
export interface NewToast {
  /** Other fields stay on the toast, for the app's own handlers. */
  [key: string]: unknown
  /** Identifies the toast for `onClose` and `onClick`, and keeps its animation across renders. */
  id?: string | number
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

export interface ToastItem extends NewToast {
  id: string | number
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

export interface ToastEntity extends Omit<ToastProps, "onClose" | "onClick"> {
  id: string
  type: string
  toasts: ToastItem[]
  /** How many toasts show at once; the oldest go first. Defaults to 3. */
  max: number
  nextId: number
}

export type ToastType = {
  create(entity: ToastEntity): void
  /** Shows a toast on top, giving it an id when it has none. */
  show(entity: ToastEntity, toast: NewToast): void
  close(entity: ToastEntity, id: ToastItem["id"]): void
  clear(entity: ToastEntity): void
  /** Defined by an extending type, it makes toasts clickable. */
  open?(entity: ToastEntity, id: ToastItem["id"], api: Api): void
  render(entity: ToastEntity, api: Api): TemplateResult | null
  renderToaster(props: ToastProps): TemplateResult | null
}

export declare const Toast: ToastType
