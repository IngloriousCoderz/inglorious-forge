/**
 * @typedef {import("./template.js").LogoEntity} LogoEntity
 *
 * @typedef {Object} Api
 * @property {(id: string) => LogoEntity} getEntity
 * @property {(topic: string, payload: any) => void} notify
 */
import { closestAncestor, isTouchDevice, saturate } from "./utils.js"

const MAX_HEAD_TILT_X = 400
const MAX_HEAD_TILT_Y = 400
const HALF = 0.5
const FIRST_ITEM = 0

const eventType = isTouchDevice() ? "touchmove" : "mousemove"
let moveListener = null

export const logo = {
  /**
   * Initialize interactivity for the given entity.
   * @param {LogoEntity} entity
   * @param {string} id
   * @param {Api} api
   */
  create(entity, payload, api) {
    if (!entity.isInteractive) {
      return
    }

    startInteraction(entity, api)
  },

  /**
   * Update the entity head tilt coordinates.
   * @param {LogoEntity} entity
   * @param {{x:number,y:number}} payload
   */
  coordsChange(entity, { x, y }) {
    entity.x = x
    entity.y = y
  },

  /**
   * Cleanup listeners when the entity is destroyed.
   * @param {LogoEntity} entity
   * @param {string} id
   */
  destroy() {
    stopInteraction()
  },
}

export function startInteraction(entity, api) {
  // skip during SSX
  if (typeof document === "undefined") return

  moveListener = createMoveListener(entity.id, api)
  document.addEventListener(eventType, moveListener, {
    passive: !entity.isScrollPrevented,
  })
}

export function stopInteraction() {
  // skip during SSX
  if (typeof document === "undefined") return

  document.removeEventListener(eventType, moveListener)
}

/**
 * Create the move listener used by `create` / `fieldChange`.
 * The listener calculates the position of the pointer relative to
 * the element center and notifies the entity's `coordsChange`.
 *
 * @param {string} entityId
 * @param {Api} api
 * @returns {(event:MouseEvent|Touch) => void}
 */
function createMoveListener(entityId, api) {
  return (event) => {
    const { left, top, width, height } = event.target.getBoundingClientRect()

    const center = {
      x: window.scrollX + left + width * HALF,
      y: window.scrollY + top + height * HALF,
    }

    const { target, pageX, pageY } =
      eventType === "touchmove" ? event.touches[FIRST_ITEM] : event

    const entity = api.getEntity(entityId)
    if (entity.isScrollPrevented && closestAncestor(target, "logo")) {
      event.preventDefault()
    }

    api.notify(`#${entityId}:coordsChange`, {
      x: saturate(pageX - center.x, MAX_HEAD_TILT_X),
      y: saturate(pageY - center.y, MAX_HEAD_TILT_Y),
    })
  }
}
