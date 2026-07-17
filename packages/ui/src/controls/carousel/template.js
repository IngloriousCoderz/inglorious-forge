/**
 * @typedef {import('../../../types/controls/carousel.js').CarouselProps} CarouselProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { repeat } from "@inglorious/web/directives/repeat"
import { when } from "@inglorious/web/directives/when"

import {
  clampPage,
  DEFAULT_ALIGN,
  DEFAULT_AXIS,
  DEFAULT_GAP,
  FIRST_PAGE,
  getLastPage,
  VERTICAL_AXIS,
} from "./helpers.js"

const PREVIOUS = "previous"
const NEXT = "next"
const ONE_PAGE = 1
const HUMAN_OFFSET = 1
const SCROLL_EPSILON = 1

export const Carousel = {
  /**
   * Main entrypoint for the carousel template. It delegates to the base renderer so overrides can still reuse it.
   * Carousels lay items out in a scroll-snapping viewport and page through them.
   * @param {CarouselProps} props The carousel props.
   * @returns {TemplateResult} The rendered carousel.
   */
  render(props) {
    return this.renderCarousel(props)
  },

  /**
   * Renders the container and wires the viewport, arrows, and indicators.
   * This is the canonical renderer that custom `render()` overrides should call.
   * @param {CarouselProps} props The carousel props.
   * @returns {TemplateResult} The rendered carousel.
   */
  renderCarousel(props) {
    const {
      axis = DEFAULT_AXIS,
      gap = DEFAULT_GAP,
      align = DEFAULT_ALIGN,
      hasArrows = true,
      hasIndicators = true,
      isFullWidth = false,
    } = props

    const classes = {
      "iw-carousel": true,
      "iw-carousel-vertical": axis === VERTICAL_AXIS,
      [`iw-carousel-gap-${gap}`]: gap !== DEFAULT_GAP,
      [`iw-carousel-align-${align}`]: align !== DEFAULT_ALIGN,
      "iw-carousel-full-width": isFullWidth,
    }

    return html`<div class=${classMap(classes)}>
      ${this.renderViewport?.(props)}
      ${when(hasArrows, () => this.renderArrows?.(props))}
      ${when(hasIndicators, () => this.renderIndicators?.(props))}
    </div>`
  },

  /**
   * Renders the scrolling viewport that holds the items.
   * Snapping, swiping and momentum are left to the browser; this only tracks the page.
   * @param {CarouselProps} props The carousel props.
   * @returns {TemplateResult} The rendered viewport.
   */
  renderViewport(props) {
    const { items = [], label } = props

    return html`<div
      class="iw-carousel-viewport"
      role="group"
      aria-roledescription="carousel"
      aria-label=${label || "Carousel"}
      tabindex="0"
      @scroll=${handleScroll(props)}
      @keydown=${handleKeyDown(props)}
      ${ref(settleOnInitialPage(props))}
    >
      ${repeat(
        items,
        (item, index) => index,
        (item, index) => this.renderItem?.(props, item, index),
      )}
    </div>`
  },

  /**
   * Renders a single slide. Override this to wrap items in your own markup.
   * @param {CarouselProps} props The carousel props.
   * @param {unknown} item The item to render.
   * @param {number} index The item index.
   * @returns {TemplateResult} The rendered item.
   */
  renderItem(props, item, index) {
    const { items = [] } = props

    return html`<div
      class="iw-carousel-item"
      role="group"
      aria-roledescription="slide"
      aria-label=${`${index + HUMAN_OFFSET} of ${items.length}`}
    >
      ${item}
    </div>`
  },

  /**
   * Renders the previous and next arrows.
   * Override this to reposition them, or drop them entirely.
   * @param {CarouselProps} props The carousel props.
   * @returns {TemplateResult} The rendered arrows.
   */
  renderArrows(props) {
    return html`${this.renderArrow?.(props, PREVIOUS)}
    ${this.renderArrow?.(props, NEXT)}`
  },

  /**
   * Renders a single arrow, disabled once there is nothing left that way.
   * Override this to supply custom arrows.
   * @param {CarouselProps} props The carousel props.
   * @param {"previous"|"next"} direction Which way the arrow pages.
   * @returns {TemplateResult} The rendered arrow.
   */
  renderArrow(props, direction) {
    const { page = FIRST_PAGE, items = [] } = props
    const isPrevious = direction === PREVIOUS
    const isDisabled = isPrevious
      ? page <= FIRST_PAGE
      : page >= getLastPage(items)

    return html`<button
      class=${classMap({
        "iw-carousel-arrow": true,
        [`iw-carousel-arrow-${direction}`]: true,
      })}
      type="button"
      aria-label=${isPrevious ? "Previous slide" : "Next slide"}
      ?disabled=${isDisabled}
      @click=${handleArrowClick(props, direction)}
    ></button>`
  },

  /**
   * Renders the row of pagination dots.
   * Override this to build custom pagination.
   * @param {CarouselProps} props The carousel props.
   * @returns {TemplateResult} The rendered indicators.
   */
  renderIndicators(props) {
    const { items = [] } = props

    return html`<div class="iw-carousel-indicators">
      ${repeat(
        items,
        (item, index) => index,
        (item, index) => this.renderIndicator?.(props, index),
      )}
    </div>`
  },

  /**
   * Renders a single pagination dot.
   * @param {CarouselProps} props The carousel props.
   * @param {number} index The page the dot jumps to.
   * @returns {TemplateResult} The rendered indicator.
   */
  renderIndicator(props, index) {
    const { page = FIRST_PAGE } = props
    const isCurrent = index === page

    return html`<button
      class=${classMap({
        "iw-carousel-indicator": true,
        "iw-carousel-indicator-current": isCurrent,
      })}
      type="button"
      aria-label=${`Go to slide ${index + HUMAN_OFFSET}`}
      aria-current=${isCurrent ? "page" : "false"}
      @click=${handleIndicatorClick(props, index)}
    ></button>`
  },
}

/**
 * Report the page the viewport has settled on. Native scrolling owns the
 * position, so this listener is the only thing that writes the page back.
 * @param {CarouselProps} props
 * @returns {(event: Event) => void}
 */
function handleScroll(props) {
  return (event) => {
    const page = pageFromScroll(event.currentTarget, props.axis)
    if (page !== props.page) props.onPageChange?.(page)
  }
}

/**
 * Page with the arrow keys, or jump to either end.
 * @param {CarouselProps} props
 * @returns {(event: KeyboardEvent) => void}
 */
function handleKeyDown(props) {
  return (event) => {
    const isVertical = (props.axis ?? DEFAULT_AXIS) === VERTICAL_AXIS
    const page = props.page ?? FIRST_PAGE

    let next
    switch (event.key) {
      case "ArrowLeft":
        if (isVertical) return
        next = page - ONE_PAGE
        break
      case "ArrowUp":
        if (!isVertical) return
        next = page - ONE_PAGE
        break
      case "ArrowRight":
        if (isVertical) return
        next = page + ONE_PAGE
        break
      case "ArrowDown":
        if (!isVertical) return
        next = page + ONE_PAGE
        break
      case "Home":
        next = FIRST_PAGE
        break
      case "End":
        next = getLastPage(props.items)
        break
      default:
        return
    }

    event.preventDefault()
    goToPage(event.currentTarget, next, props)
  }
}

/**
 * Page one step in the arrow's direction.
 * @param {CarouselProps} props
 * @param {"previous"|"next"} direction
 * @returns {(event: PointerEvent) => void}
 */
function handleArrowClick(props, direction) {
  return (event) => {
    const step = direction === PREVIOUS ? -ONE_PAGE : ONE_PAGE
    const page = (props.page ?? FIRST_PAGE) + step

    goToPage(viewportFrom(event.currentTarget), page, props)
  }
}

/**
 * Jump straight to the dot's page.
 * @param {CarouselProps} props
 * @param {number} index
 * @returns {(event: PointerEvent) => void}
 */
function handleIndicatorClick(props, index) {
  return (event) => {
    goToPage(viewportFrom(event.currentTarget), index, props)
  }
}

/**
 * Position the viewport on a page. Scrolling triggers the scroll listener,
 * which is what updates the state, so the two never fight each other.
 * @param {HTMLElement | null | undefined} viewport
 * @param {number} page
 * @param {CarouselProps} props
 * @param {ScrollBehavior} [behavior] Defaults to the CSS scroll-behavior.
 */
function goToPage(viewport, page, props, behavior = "auto") {
  if (!viewport) return

  const item = viewport.children[clampPage(page, props.items)]
  if (!item) return

  // Guarded like setPointerCapture: real browsers always have scrollTo, but
  // non-layout environments such as jsdom do not.
  viewport.scrollTo?.(
    (props.axis ?? DEFAULT_AXIS) === VERTICAL_AXIS
      ? { top: item.offsetTop, behavior }
      : { left: item.offsetLeft, behavior },
  )
}

/**
 * Place the viewport on its starting page, once, without fighting later scrolls.
 * Item offsets are all zero until the carousel has been laid out, so this waits
 * for the next frame, and jumps rather than animating on arrival.
 * @param {CarouselProps} props
 * @returns {(viewport: HTMLElement | undefined) => void}
 */
function settleOnInitialPage(props) {
  return (viewport) => {
    if (!viewport || viewport.dataset.iwCarouselReady) return

    viewport.dataset.iwCarouselReady = "true"
    requestAnimationFrame(() =>
      goToPage(viewport, props.page ?? FIRST_PAGE, props, "instant"),
    )
  }
}

/**
 * Find the viewport from any control living in the same carousel.
 * @param {HTMLElement} element
 * @returns {HTMLElement | null | undefined}
 */
function viewportFrom(element) {
  return element.closest(".iw-carousel")?.querySelector(".iw-carousel-viewport")
}

/**
 * Get the page whose item sits closest to the current scroll offset.
 * @param {HTMLElement} viewport
 * @param {"x"|"y"} [axis]
 * @returns {number}
 */
function pageFromScroll(viewport, axis = DEFAULT_AXIS) {
  const isVertical = axis === VERTICAL_AXIS
  const scroll = isVertical ? viewport.scrollTop : viewport.scrollLeft
  const items = [...viewport.children]

  // Items past the last full viewport can never reach the start, so once we
  // run out of scroll the last one is as far as we got.
  if (scroll >= maxScroll(viewport, isVertical) - SCROLL_EPSILON) {
    return getLastPage(items)
  }

  let page = FIRST_PAGE
  let closest = Infinity

  for (const [index, item] of items.entries()) {
    const offset = isVertical ? item.offsetTop : item.offsetLeft
    const distance = Math.abs(offset - scroll)

    if (distance < closest) {
      closest = distance
      page = index
    }
  }

  return page
}

/**
 * How far the viewport can scroll before it runs out of content.
 * @param {HTMLElement} viewport
 * @param {boolean} isVertical
 * @returns {number}
 */
function maxScroll(viewport, isVertical) {
  return isVertical
    ? viewport.scrollHeight - viewport.clientHeight
    : viewport.scrollWidth - viewport.clientWidth
}
