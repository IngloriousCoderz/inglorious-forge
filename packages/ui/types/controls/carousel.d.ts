import type { TemplateResult, Api } from "@inglorious/web"

export type CarouselAxis = "x" | "y"
export type CarouselGap = "none" | "sm" | "md" | "lg" | "xl"
export type CarouselAlign = "stretch" | "start" | "center" | "end"
export type CarouselDirection = "previous" | "next"

export interface CarouselProps {
  id?: string
  type?: string
  label?: string

  items?: unknown[]
  /** Index of the item the viewport has settled on. The only persistent state. */
  page?: number

  axis?: CarouselAxis
  gap?: CarouselGap
  align?: CarouselAlign

  hasArrows?: boolean
  hasIndicators?: boolean
  isFullWidth?: boolean

  onPageChange?: (page: number) => void
  [key: string]: unknown
}

export interface CarouselType {
  create(entity: CarouselProps): void
  pageChange(entity: CarouselProps, page: number): void
  render(entity: CarouselProps, api: Api): TemplateResult
  renderCarousel(props: CarouselProps): TemplateResult
  renderViewport(props: CarouselProps): TemplateResult
  renderItem(props: CarouselProps, item: unknown, index: number): TemplateResult
  renderArrows(props: CarouselProps): TemplateResult
  renderArrow(
    props: CarouselProps,
    direction: CarouselDirection,
  ): TemplateResult
  renderIndicators(props: CarouselProps): TemplateResult
  renderIndicator(props: CarouselProps, index: number): TemplateResult
}

export declare const Carousel: CarouselType
