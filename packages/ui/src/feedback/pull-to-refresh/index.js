/**
 * @typedef {import('../../../types/feedback/pull-to-refresh').PullToRefreshProps} PullToRefreshProps
 * @typedef {import('@inglorious/web').TemplateResult} TemplateResult
 */

import { html, nothing } from "@inglorious/web"
import { classMap } from "@inglorious/web/directives/class-map"
import { haptics } from "@inglorious/web/haptics"

import { Progress } from "../progress/index.js"

const THRESHOLD_PX = 64
const MAX_PULL_PX = 112
const RESISTANCE = 0.5
const INDICATOR_SIZE = 28
const INDICATOR_THICKNESS = 3
const COMPLETE = 1
const SINGLE_TOUCH = 1
const TOP = 0
const DISTANCE = "--iw-pull-distance"
const PROGRESS = "--iw-pull-progress"
const PULLING = "iw-pull-to-refresh-pulling"
const ARMED = "iw-pull-to-refresh-armed"

/**
 * The pull in progress on each element: where the finger started and how far
 * the content has moved.
 * @type {WeakMap<HTMLElement, { startY: number, distance: number, isArmed: boolean }>}
 */
const pulls = new WeakMap()

export const PullToRefresh = {
  /**
   * Wraps scrolling content that refreshes when pulled down from the top, as
   * in mobile apps. Past the threshold, it ticks (see `haptics` in
   * `@inglorious/web/haptics`) and letting go calls `onRefresh`; the
   * spinner stays while `isRefreshing`. Touch only: offer another way to
   * refresh on desktop, such as a button.
   * @param {PullToRefreshProps} props
   * @returns {TemplateResult}
   */
  render(props) {
    const {
      id,
      isRefreshing = false,
      isDisabled = false,
      refreshingLabel = "Refreshing",
      children,
      className = "",
      onRefresh,
    } = props

    const extraClasses = Object.fromEntries(
      className
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => [name, true]),
    )
    const canPull = !isDisabled && !isRefreshing && Boolean(onRefresh)

    return html`<div
      id=${id || nothing}
      class=${classMap({
        "iw-pull-to-refresh": true,
        "iw-pull-to-refresh-refreshing": isRefreshing,
        ...extraClasses,
      })}
      aria-busy=${isRefreshing ? "true" : "false"}
      @touchstart=${(event) => canPull && start(event)}
      @touchmove=${{
        handleEvent: (event) => move(event),
        passive: false,
      }}
      @touchend=${(event) => end(event, onRefresh)}
      @touchcancel=${(event) => end(event)}
    >
      <div class="iw-pull-to-refresh-indicator">
        ${Progress.render({
          variant: "circular",
          size: INDICATOR_SIZE,
          thickness: INDICATOR_THICKNESS,
          color: "primary",
          ariaLabel: isRefreshing ? refreshingLabel : undefined,
        })}
      </div>
      <div class="iw-pull-to-refresh-content">${children}</div>
    </div>`
  },
}

function start(event) {
  if (event.touches.length !== SINGLE_TOUCH) return
  const element = event.currentTarget
  if (scrollParent(element).scrollTop > TOP) return

  pulls.set(element, {
    startY: event.touches[0].clientY,
    distance: 0,
    isArmed: false,
  })
}

function move(event) {
  const element = event.currentTarget
  const pull = pulls.get(element)
  if (!pull) return

  const delta = event.touches[0].clientY - pull.startY
  if (delta <= TOP && !pull.distance) {
    pulls.delete(element)
    return
  }

  if (event.cancelable) event.preventDefault()
  pull.distance = Math.min(Math.max(delta, TOP) * RESISTANCE, MAX_PULL_PX)
  const isArmed = pull.distance >= THRESHOLD_PX
  if (isArmed && !pull.isArmed) haptics.selection()
  pull.isArmed = isArmed
  element.classList.add(PULLING)
  element.classList.toggle(ARMED, isArmed)
  element.style.setProperty(DISTANCE, `${pull.distance}px`)
  element.style.setProperty(
    PROGRESS,
    String(Math.min(pull.distance / THRESHOLD_PX, COMPLETE)),
  )
}

function end(event, onRefresh) {
  const element = event.currentTarget
  const pull = pulls.get(element)
  pulls.delete(element)

  element.classList.remove(PULLING, ARMED)
  element.style.removeProperty(DISTANCE)
  element.style.removeProperty(PROGRESS)

  if (pull && onRefresh && pull.distance >= THRESHOLD_PX) onRefresh()
}

function scrollParent(element) {
  for (let node = element; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node)
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight
    ) {
      return node
    }
  }
  return document.scrollingElement ?? document.documentElement
}
