/**
 * @typedef {import("../types/index.d.ts").LogoEntity} LogoEntity
 * @typedef {import("@inglorious/web").Api} Api
 */
import { saturate } from "./utils.js"

const MAX_HEAD_TILT_X = 400
const MAX_HEAD_TILT_Y = 400
const HALF = 0.5
const FIRST_TOUCH = 0

// Both, not one picked by sniffing the device: laptops with a touch screen
// have a mouse too.
const MOVE_EVENTS = ["mousemove", "touchmove"]
const listeners = new Map()

export const handlers = {
  /**
   * Starts following the pointer when the entity is interactive.
   * @param {LogoEntity} entity
   * @param {unknown} payload
   * @param {Api} api
   */
  create(entity, payload, api) {
    if (!entity.isInteractive) return

    startInteraction(entity, api)
  },

  /**
   * Tilts the head towards the pointer.
   * @param {LogoEntity} entity
   * @param {{ x: number, y: number }} payload - Pointer offset from the logo's center, in pixels.
   */
  coordsChange(entity, { x, y }) {
    entity.position = [x, y]
  },

  /**
   * @param {LogoEntity} entity
   */
  destroy(entity) {
    stopInteraction(entity)
  },
}

/**
 * Makes the entity's logo follow the pointer. Each logo has its own listener,
 * so several can follow it at once.
 *
 * @param {LogoEntity} entity
 * @param {Api} api
 */
export function startInteraction(entity, api) {
  if (typeof document === "undefined") return

  stopInteraction(entity)
  const listener = createMoveListener(entity.id, api)
  listeners.set(entity.id, listener)
  for (const eventType of MOVE_EVENTS) {
    document.addEventListener(eventType, listener, {
      passive: !entity.isScrollPrevented,
    })
  }
}

/**
 * Stops the entity's logo from following the pointer, or every logo when
 * called without one.
 *
 * @param {LogoEntity} [entity]
 */
export function stopInteraction(entity) {
  if (typeof document === "undefined") return

  const ids = entity ? [entity.id] : [...listeners.keys()]
  for (const id of ids) {
    for (const eventType of MOVE_EVENTS) {
      document.removeEventListener(eventType, listeners.get(id))
    }
    listeners.delete(id)
  }
}

function createMoveListener(entityId, api) {
  return (event) => {
    const logo = findLogo(entityId)
    if (!logo) return

    const { left, top, width, height } = logo.getBoundingClientRect()
    const center = {
      x: window.scrollX + left + width * HALF,
      y: window.scrollY + top + height * HALF,
    }

    const { pageX, pageY } = event.touches?.[FIRST_TOUCH] ?? event

    const entity = api.getEntity(entityId)
    if (entity.isScrollPrevented && logo.contains(event.target)) {
      event.preventDefault()
    }

    api.notify(`#${entityId}:coordsChange`, {
      x: saturate(pageX - center.x, MAX_HEAD_TILT_X),
      y: saturate(pageY - center.y, MAX_HEAD_TILT_Y),
    })
  }
}

function findLogo(entityId) {
  return [...document.querySelectorAll(".iw-logo")].find(
    (element) => element.dataset.entityId === entityId,
  )
}
