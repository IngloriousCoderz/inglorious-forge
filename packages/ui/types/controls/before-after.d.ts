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

  onSlide?: (position: number) => void
  onChange?: (position: number) => void
  [key: string]: unknown
}

export interface BeforeAfterType {
  create(entity: BeforeAfterProps): void
  setPosition(entity: BeforeAfterProps, position: number): void
  render(entity: BeforeAfterProps, api: Api): TemplateResult
}

export declare const BeforeAfter: BeforeAfterType
