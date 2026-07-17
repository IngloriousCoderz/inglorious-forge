/**
 * @typedef {import('../../../types/data-display/carousel.js').CarouselProps} CarouselProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { ref } from "@inglorious/web/directives/ref"
import { repeat } from "@inglorious/web/directives/repeat"
import { when } from "@inglorious/web/directives/when"

import { Button } from "../../controls/button/index.js"
import {
  carouselHome,
  clampPage,
  DEFAULT_ALIGN,
  DEFAULT_ARROW_PLACEMENT,
  DEFAULT_ARROW_VARIANT,
  DEFAULT_AXIS,
  DEFAULT_GAP,
  FIRST_PAGE,
  getLastPage,
  normalizeRotation,
  rotateItems,
  VERTICAL_AXIS,
} from "./helpers.js"

const PREVIOUS = "previous"
const NEXT = "next"
const ONE_PAGE = 1
const HUMAN_OFFSET = 1
const SCROLL_EPSILON = 1

/** Transient drag bookkeeping, kept off the entity so it stays serializable. */
const drags = new WeakMap()

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
   * Renders the container, the stage that holds the viewport and its arrows, and the indicators.
   * This is the canonical renderer that custom `render()` overrides should call.
   * @param {CarouselProps} props The carousel props.
   * @returns {TemplateResult} The rendered carousel.
   */
  renderCarousel(props) {
    const {
      axis = DEFAULT_AXIS,
      gap = DEFAULT_GAP,
      align = DEFAULT_ALIGN,
      arrowPlacement = DEFAULT_ARROW_PLACEMENT,
      hasArrows = true,
      hasIndicators = true,
      isFullWidth = false,
    } = props

    const classes = {
      "iw-carousel": true,
      "iw-carousel-vertical": axis === VERTICAL_AXIS,
      [`iw-carousel-gap-${gap}`]: gap !== DEFAULT_GAP,
      [`iw-carousel-align-${align}`]: align !== DEFAULT_ALIGN,
      [`iw-carousel-arrows-${arrowPlacement}`]: true,
      "iw-carousel-full-width": isFullWidth,
    }

    // The arrows live in the stage, next to the viewport, so that centring them
    // ignores the indicators underneath.
    return html`<div class=${classMap(classes)}>
      <div class="iw-carousel-stage">
        ${when(hasArrows, () => this.renderArrow?.(props, PREVIOUS))}
        ${this.renderViewport?.(props)}
        ${when(hasArrows, () => this.renderArrow?.(props, NEXT))}
      </div>
      ${when(hasIndicators, () => this.renderIndicators?.(props))}
    </div>`
  },

  /**
   * Renders the scrolling viewport that holds the items.
   * Snapping, momentum and touch swiping are left to the browser; this adds mouse dragging and paging.
   * @param {CarouselProps} props The carousel props.
   * @returns {TemplateResult} The rendered viewport.
   */
  renderViewport(props) {
    const { label } = props
    const items = displayedItems(props)

    return html`<div
      class="iw-carousel-viewport"
      role="group"
      aria-roledescription="carousel"
      aria-label=${label || "Carousel"}
      tabindex="0"
      @scroll=${handleScroll(props)}
      @scrollend=${handleScrollEnd(props)}
      @keydown=${handleKeyDown(props)}
      @pointerdown=${handlePointerDown(props)}
      @pointermove=${handlePointerMove}
      @pointerup=${handlePointerUp(props)}
      @pointercancel=${handlePointerUp(props)}
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
    const total = props.items?.length ?? 0

    return html`<div
      class="iw-carousel-item"
      role="group"
      aria-roledescription="slide"
      aria-label=${`${index + HUMAN_OFFSET} of ${total}`}
    >
      ${item}
    </div>`
  },

  /**
   * Renders one arrow, reusing the Button component so it themes like the rest of the system.
   * Override this to supply custom arrows.
   * @param {CarouselProps} props The carousel props.
   * @param {"previous"|"next"} direction Which way the arrow pages.
   * @returns {TemplateResult} The rendered arrow.
   */
  renderArrow(props, direction) {
    const {
      page = FIRST_PAGE,
      items = [],
      isInfinite = false,
      arrowVariant = DEFAULT_ARROW_VARIANT,
      arrowColor,
    } = props
    const isPrevious = direction === PREVIOUS

    // Infinite carousels wrap, so their arrows never run out.
    const isDisabled =
      !isInfinite &&
      (isPrevious ? page <= FIRST_PAGE : page >= getLastPage(items))

    // The click is caught on the wrapper: Button's onClick carries no event, and
    // a disabled button emits no click at all, so nothing can leak through.
    return html`<span
      class=${classMap({
        "iw-carousel-arrow": true,
        [`iw-carousel-arrow-${direction}`]: true,
      })}
      @click=${(event) =>
        pageBy(props, isPrevious ? -ONE_PAGE : ONE_PAGE, event.currentTarget)}
    >
      ${Button.render({
        variant: arrowVariant,
        color: arrowColor,
        shape: "round",
        isDisabled,
        children: html`<span class="iw-carousel-chevron"></span>`,
        "aria-label": isPrevious ? "Previous slide" : "Next slide",
      })}
    </span>`
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
   * Where an indicator sends the viewport. Infinite carousels rotate the
   * clicked item to the front; finite ones just page to it.
   * @param {CarouselProps} props The carousel props.
   * @param {number} index The logical item the dot represents.
   * @param {HTMLElement} viewport The viewport to move.
   */
  indicatorSelect(props, index, viewport) {
    goToLogical(props, viewport, index)
  },

  /**
   * Renders a single pagination dot.
   * @param {CarouselProps} props The carousel props.
   * @param {number} index The page the dot jumps to.
   * @returns {TemplateResult} The rendered indicator.
   */
  renderIndicator(props, index) {
    const isCurrent = index === currentLogical(props)

    return html`<button
      class=${classMap({
        "iw-carousel-indicator": true,
        "iw-carousel-indicator-current": isCurrent,
      })}
      type="button"
      aria-label=${`Go to slide ${index + HUMAN_OFFSET}`}
      aria-current=${isCurrent ? "page" : "false"}
      @click=${(event) =>
        this.indicatorSelect?.(props, index, viewportFrom(event.currentTarget))}
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
    // Infinite carousels re-centre on settle instead of tracking every scroll.
    if (props.isInfinite) return

    const page = pageFromScroll(event.currentTarget, props.axis)
    if (page !== props.page) props.onPageChange?.(page)
  }
}

/**
 * Runs the treadmill: once the scroll settles, rotate the strip so the slide in
 * view moves to the home slot, then snap the scroll back to home. Both happen
 * before the next paint, so the slide never appears to jump, which is what lets
 * an infinite carousel wrap by dragging, not just with the arrows. Also restores
 * snapping after a mouse drag.
 * @param {CarouselProps} props
 * @returns {(event: Event) => void}
 */
function handleScrollEnd(props) {
  return (event) => {
    const viewport = event.currentTarget

    // Mid-drag pauses fire scrollend too; leave the drag alone until it ends.
    if (drags.has(viewport)) return

    viewport.classList.remove("iw-carousel-viewport-dragging")

    if (!props.isInfinite) return

    const isVertical = (props.axis ?? DEFAULT_AXIS) === VERTICAL_AXIS
    const home = carouselHome(props.items?.length ?? 0)
    const delta = pageFromScroll(viewport, props.axis) - home
    if (!delta) return

    props.onRotate?.(delta)
    setScroll(viewport, offsetOf(viewport, home, isVertical), isVertical)
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

    switch (event.key) {
      case "ArrowLeft":
        if (isVertical) return
        pageBy(props, -ONE_PAGE)
        break
      case "ArrowUp":
        if (!isVertical) return
        pageBy(props, -ONE_PAGE, event.currentTarget)
        break
      case "ArrowRight":
        if (isVertical) return
        pageBy(props, ONE_PAGE, event.currentTarget)
        break
      case "ArrowDown":
        if (!isVertical) return
        pageBy(props, ONE_PAGE, event.currentTarget)
        break
      case "Home":
        goToLogical(props, event.currentTarget, FIRST_PAGE)
        break
      case "End":
        goToLogical(props, event.currentTarget, getLastPage(props.items))
        break
      default:
        return
    }

    event.preventDefault()
  }
}

/**
 * Start a mouse drag. Touch already pans the viewport natively, so only the
 * mouse needs help here.
 * @param {CarouselProps} props
 * @returns {(event: PointerEvent) => void}
 */
function handlePointerDown(props) {
  return (event) => {
    if (event.pointerType !== "mouse") return

    const viewport = event.currentTarget
    const isVertical = (props.axis ?? DEFAULT_AXIS) === VERTICAL_AXIS

    drags.set(viewport, {
      from: isVertical ? event.clientY : event.clientX,
      scroll: isVertical ? viewport.scrollTop : viewport.scrollLeft,
      isVertical,
    })
    // Snapping would fight every move; it is restored on pointerup.
    viewport.classList.add("iw-carousel-viewport-dragging")
    viewport.setPointerCapture?.(event.pointerId)
  }
}

/**
 * Pan the viewport with the mouse while the button is held down.
 * The drag record already knows the axis, so no props are needed.
 * @param {PointerEvent} event
 */
function handlePointerMove(event) {
  const drag = drags.get(event.currentTarget)
  if (!drag) return

  const to = drag.isVertical ? event.clientY : event.clientX
  const scroll = drag.scroll - (to - drag.from)

  if (drag.isVertical) event.currentTarget.scrollTop = scroll
  else event.currentTarget.scrollLeft = scroll
}

/**
 * End a mouse drag by landing on the nearest slide.
 * Snapping stays suspended until the landing has settled: switching it back on
 * first makes the browser jump to whichever item it had snapped to before the
 * drag, undoing the whole gesture.
 * @param {CarouselProps} props
 * @returns {(event: PointerEvent) => void}
 */
function handlePointerUp(props) {
  return (event) => {
    const viewport = event.currentTarget
    if (!drags.has(viewport)) return

    drags.delete(viewport)
    viewport.releasePointerCapture?.(event.pointerId)

    // Land on the nearest slide; handleScrollEnd restores snapping and, when
    // infinite, re-centres from there.
    goToPage(viewport, pageFromScroll(viewport, props.axis), props, "smooth")
  }
}

/**
 * Page relative to where the viewport actually sits, rather than to the
 * reported page: trailing items can be past the end of the scroll range, so
 * page arithmetic alone would get stuck there.
 * @param {CarouselProps} props
 * @param {number} step
 * @param {HTMLElement} from The control the paging was triggered from.
 */
function pageBy(props, step, from) {
  const viewport = viewportFrom(from)
  if (!viewport) return

  const isVertical = (props.axis ?? DEFAULT_AXIS) === VERTICAL_AXIS
  const scroll = isVertical ? viewport.scrollTop : viewport.scrollLeft
  const offsets = itemOffsets(viewport, isVertical)
  const here = pageFromScroll(viewport, props.axis)

  // Infinite: there is always a slide to move into, and the treadmill
  // re-centres afterwards, so simply page one step from where it sits.
  if (props.isInfinite) {
    goToPage(
      viewport,
      here + (step < 0 ? -ONE_PAGE : ONE_PAGE),
      props,
      "smooth",
    )
    return
  }

  const page =
    step < 0
      ? offsets.findLastIndex((offset) => offset < scroll - SCROLL_EPSILON)
      : offsets.findIndex((offset) => offset > scroll + SCROLL_EPSILON)

  if (page >= FIRST_PAGE) goToPage(viewport, page, props)
}

/**
 * Move to a logical item, whichever rotation it currently sits at. Infinite
 * carousels rotate it into the home slot; finite ones page straight to it.
 * @param {CarouselProps} props
 * @param {HTMLElement | null | undefined} viewport
 * @param {number} logical
 */
function goToLogical(props, viewport, logical) {
  if (!viewport) return

  if (props.isInfinite) {
    const isVertical = (props.axis ?? DEFAULT_AXIS) === VERTICAL_AXIS
    const home = carouselHome(props.items?.length ?? 0)
    props.onRotate?.(logical - home - (props.rotation ?? 0))
    setScroll(viewport, offsetOf(viewport, home, isVertical), isVertical)
    return
  }

  goToPage(viewport, logical, props)
}

/**
 * Jump the scroll offset instantly. `scrollLeft = x` would animate here because
 * the viewport has `scroll-behavior: smooth`, which is exactly what must not
 * happen when re-anchoring the treadmill — the jump has to be a single frame.
 * @param {HTMLElement} viewport
 * @param {number} offset
 * @param {boolean} isVertical
 */
function setScroll(viewport, offset, isVertical) {
  viewport.scrollTo?.(
    isVertical
      ? { top: offset, behavior: "instant" }
      : { left: offset, behavior: "instant" },
  )
}

/**
 * The start offset of one item along the active axis.
 * @param {HTMLElement} viewport
 * @param {number} index
 * @param {boolean} isVertical
 * @returns {number}
 */
function offsetOf(viewport, index, isVertical) {
  const item = viewport.children[index]
  if (!item) return 0
  return isVertical ? item.offsetTop : item.offsetLeft
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
 * Get the page whose item sits closest to the current scroll offset.
 * @param {HTMLElement} viewport
 * @param {"x"|"y"} [axis]
 * @returns {number}
 */
function pageFromScroll(viewport, axis = DEFAULT_AXIS) {
  const isVertical = axis === VERTICAL_AXIS
  const scroll = isVertical ? viewport.scrollTop : viewport.scrollLeft
  const offsets = itemOffsets(viewport, isVertical)

  // Items past the last full viewport can never reach the start, so once we
  // run out of scroll the last one is as far as we got.
  if (scroll >= maxScroll(viewport, isVertical) - SCROLL_EPSILON) {
    return getLastPage(offsets)
  }

  let page = FIRST_PAGE
  let closest = Infinity

  for (const [index, offset] of offsets.entries()) {
    const distance = Math.abs(offset - scroll)

    if (distance < closest) {
      closest = distance
      page = index
    }
  }

  return page
}

/**
 * The start offset of every item along the scrolling axis.
 * @param {HTMLElement} viewport
 * @param {boolean} isVertical
 * @returns {number[]}
 */
function itemOffsets(viewport, isVertical) {
  return [...viewport.children].map((item) =>
    isVertical ? item.offsetTop : item.offsetLeft,
  )
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

/**
 * The items in the order they are shown: rotated when infinite, as-is otherwise.
 * @param {CarouselProps} props
 * @returns {unknown[]}
 */
function displayedItems(props) {
  const items = props.items ?? []
  return props.isInfinite ? rotateItems(items, props.rotation) : items
}

/**
 * The logical index of the slide currently in view, i.e. which of the original
 * items it is once the rotation is accounted for.
 * @param {CarouselProps} props
 * @returns {number}
 */
function currentLogical(props) {
  const page = props.page ?? FIRST_PAGE
  if (!props.isInfinite) return page
  return normalizeRotation(
    page + (props.rotation ?? 0),
    props.items?.length ?? 0,
  )
}

/**
 * Find the viewport from any control inside the same carousel, or from the
 * viewport itself. Works on detached DOM, unlike an id lookup.
 * @param {HTMLElement} element
 * @returns {HTMLElement | null | undefined}
 */
function viewportFrom(element) {
  return (
    element.closest(".iw-carousel-viewport") ??
    element.closest(".iw-carousel")?.querySelector(".iw-carousel-viewport")
  )
}
