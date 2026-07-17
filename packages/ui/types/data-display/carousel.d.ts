import type { TemplateResult, Api } from "@inglorious/web"

export type CarouselAxis = "x" | "y"
export type CarouselGap = "none" | "sm" | "md" | "lg" | "xl"
export type CarouselAlign = "stretch" | "start" | "center" | "end"
export type CarouselDirection = "previous" | "next"
export type CarouselArrowPlacement = "inside" | "outside"
export type CarouselArrowVariant = "default" | "outline" | "ghost"
export type CarouselArrowColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"

export interface CarouselProps {
  id?: string
  type?: string
  label?: string

  items?: unknown[]
  /** Index of the item the viewport has settled on. */
  page?: number
  /** How many items are rotated off the front (infinite carousels only). */
  rotation?: number

  /** Wrap past the ends by rotating the items instead of stopping. */
  isInfinite?: boolean

  axis?: CarouselAxis
  gap?: CarouselGap
  align?: CarouselAlign

  /** Whether the arrows float over the slides or sit beside them. */
  arrowPlacement?: CarouselArrowPlacement
  /** Button variant used for the arrows. */
  arrowVariant?: CarouselArrowVariant
  /** Button color used for the arrows. */
  arrowColor?: CarouselArrowColor

  hasArrows?: boolean
  hasIndicators?: boolean
  isFullWidth?: boolean

  onPageChange?: (page: number) => void
  [key: string]: unknown
}

export interface CarouselType {
  create(entity: CarouselProps): void
  pageChange(entity: CarouselProps, page: number): void
  rotate(entity: CarouselProps, step: number): void
  render(entity: CarouselProps, api: Api): TemplateResult
  renderCarousel(props: CarouselProps): TemplateResult
  renderViewport(props: CarouselProps): TemplateResult
  renderItem(props: CarouselProps, item: unknown, index: number): TemplateResult
  renderArrow(
    props: CarouselProps,
    direction: CarouselDirection,
  ): TemplateResult
  renderIndicators(props: CarouselProps): TemplateResult
  renderIndicator(props: CarouselProps, index: number): TemplateResult
  indicatorSelect(
    props: CarouselProps,
    index: number,
    viewport: HTMLElement | null | undefined,
  ): void
}

export declare const Carousel: CarouselType
