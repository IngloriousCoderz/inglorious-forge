import type { TemplateResult, Api } from "@inglorious/web"

export interface SliderEntity {
  id?: string
  name?: string
  label?: string
  value?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showValue?: boolean
  fullWidth?: boolean
}

export interface SliderType {
  render(entity: SliderEntity, api: Api): TemplateResult
}

export declare const slider: SliderType
