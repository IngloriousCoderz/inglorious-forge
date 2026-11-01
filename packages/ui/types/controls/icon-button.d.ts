import type { TemplateResult } from "@inglorious/web"

import type { ButtonProps } from "./button"

/** A Button, with its content given as icons and a label. */
export interface IconButtonProps extends ButtonProps {
  icon?: TemplateResult | string
  label?: TemplateResult | string | number
  iconAfter?: TemplateResult | string
  direction?: "row" | "column"
}

export type IconButtonType = {
  render(props: IconButtonProps): TemplateResult
}

export declare const IconButton: IconButtonType
