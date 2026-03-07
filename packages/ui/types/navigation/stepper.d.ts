import type { TemplateResult } from "@inglorious/web"

export interface Step {
  id?: string | number
  label: TemplateResult | string | number
  optional?: TemplateResult | string | number
  completed?: boolean
  [key: string]: unknown
}

export interface StepperProps {
  id?: string
  type?: string
  steps?: Step[]
  activeStep?: number
  orientation?: "horizontal" | "vertical"
  alternativeLabel?: boolean
  [key: string]: unknown
}

export interface StepperType {
  render(props: StepperProps): TemplateResult
  renderStep(step: Step, index: number, props: StepperProps): TemplateResult
}

export declare const stepper: StepperType
