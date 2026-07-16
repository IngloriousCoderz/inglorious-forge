import type { TemplateResult, Api } from "@inglorious/web"

export interface BeforeAfterImage {
  src: string
  alt?: string
}

export interface BeforeAfterProps {
  id?: string
  type?: string
  label?: string

  before?: BeforeAfterImage | null
  after?: BeforeAfterImage | null

  /** Divider location as a percentage (0-100). The only persistent state. */
  position?: number
  /** Keyboard increment, in percent, for arrow keys. */
  step?: number

  isDisabled?: boolean
  isFullWidth?: boolean

  onPositionChange?: (position: number) => void
  [key: string]: unknown
}

export interface BeforeAfterType {
  create(entity: BeforeAfterProps): void
  positionChange(entity: BeforeAfterProps, position: number): void
  render(entity: BeforeAfterProps, api: Api): TemplateResult
  renderBeforeAfter(props: BeforeAfterProps): TemplateResult
  renderBefore(props: BeforeAfterProps): TemplateResult
  renderAfter(props: BeforeAfterProps): TemplateResult
  renderDivider(props: BeforeAfterProps): TemplateResult
  renderHandle(props: BeforeAfterProps): TemplateResult
}

export declare const BeforeAfter: BeforeAfterType
