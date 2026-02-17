import { PHASES, ZERO } from "./constants.js"
import {
  computeLayoutDelta,
  hasLayoutMovement,
  UNIT_SCALE,
} from "./layout-math.js"
import {
  getLayoutId,
  getPresenceGroup,
  resolveLayoutOptions,
  resolvePresenceOptions,
} from "./motion-options.js"
import { createPresenceGroupRegistry } from "./registries/presence-groups.js"
import { createSharedLayoutRegistry } from "./registries/shared-layout.js"
import {
  commitFinalFrame,
  getAnimationTimeoutMs,
  isReducedMotion,
  sanitizeClassPart,
} from "./utils.js"
import { warnOnce } from "./warnings.js"

const sharedLayoutRegistry = createSharedLayoutRegistry()
const presenceRegistry = createPresenceGroupRegistry()

/**
 * @typedef {Object} MotionController
 * @property {Animation | null} animation
 * @property {HTMLElement | null} element
 * @property {string} id
 * @property {string} phase
 * @property {number | null} layoutFrameId
 * @property {Animation | null} layoutAnimation
 * @property {DOMRect | null} layoutRect
 * @property {DOMRect | null} pendingLayoutRect
 * @property {string | null} layoutId
 * @property {string | null} nextVariant
 * @property {string | null} presenceGroup
 * @property {string | null} targetVariant
 * @property {ReturnType<typeof setTimeout> | null} timeoutId
 * @property {string | undefined} variant
 * @property {string} variantClass
 * @property {(element: HTMLElement | null) => void} handleRef
 */

/**
 * Creates runtime helpers used by `withMotion`.
 *
 * @param {Object} config
 * @param {boolean} config.animateOnMount
 * @param {string} config.classPrefix
 * @param {number} config.fallbackBufferMs
 * @param {boolean | { duration?: number, easing?: string }} config.layout
 * @param {string} config.layoutIdKey
 * @param {{ mode?: "sync" | "wait", groupKey?: string } | undefined} config.presence
 * @param {Record<string, {frames?: Keyframe[] | PropertyIndexedKeyframes, keyframes?: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions}>} config.variants
 */
export function createMotionRuntime({
  animateOnMount,
  classPrefix,
  fallbackBufferMs,
  layout,
  layoutIdKey,
  presence,
  variants,
}) {
  const controllers = new Map()
  const layoutOptions = resolveLayoutOptions(layout)
  const presenceOptions = resolvePresenceOptions(presence)

  return {
    captureLayoutBeforeRender,
    completeRemoveWithMotion,
    ensureControllerMeta,
    ensureController,
    cleanupController,
    maybeStartMotion,
    runMotion,
  }

  /**
   * @param {string} entityId
   * @returns {MotionController}
   */
  function ensureController(entityId) {
    if (!controllers.has(entityId)) {
      const controller = {
        animation: null,
        element: null,
        id: entityId,
        phase: PHASES.IDLE,
        layoutFrameId: null,
        layoutAnimation: null,
        layoutRect: null,
        pendingLayoutRect: null,
        layoutId: null,
        nextVariant: null,
        presenceGroup: null,
        targetVariant: null,
        timeoutId: null,
        variant: undefined,
        variantClass: "",
        handleRef(element) {
          if (controller.element && !element) {
            sharedLayoutRegistry.storeSnapshot(controller)
            controller.pendingLayoutRect = null
          }

          controller.element = element ?? null
          if (element) {
            if (!controller.layoutRect) {
              controller.layoutRect = element.getBoundingClientRect()
            }

            cancelScheduledFrame(controller)
            controller.layoutFrameId = scheduleFrame(() => {
              controller.layoutFrameId = null
              maybeStartLayoutMotion(controller)
            })
          } else {
            cancelScheduledFrame(controller)
          }

          maybeStartMotion(controller)
        },
      }

      controllers.set(entityId, controller)
    }

    return controllers.get(entityId)
  }

  /**
   * @param {string} entityId
   */
  function cleanupController(entityId) {
    const controller = controllers.get(entityId)
    if (!controller) {
      return
    }

    controller.animation?.cancel()
    controller.layoutAnimation?.cancel()
    cancelScheduledFrame(controller)
    if (controller.timeoutId !== null) {
      clearTimeout(controller.timeoutId)
    }

    controllers.delete(entityId)
  }

  /**
   * @param {MotionController} controller
   */
  function maybeStartMotion(controller) {
    const variant = controller.nextVariant

    if (!controller.element || variant == null) {
      return
    }

    if (controller.targetVariant === variant) {
      return
    }

    if (controller.variant === undefined && !animateOnMount) {
      controller.variant = variant
      return
    }

    if (controller.variant === variant && !controller.animation) {
      return
    }

    controller.targetVariant = variant
    runMotion(controller, variant).finally(() => {
      if (controller.targetVariant === variant) {
        controller.targetVariant = null
      }
    })
  }

  /**
   * @param {MotionController} controller
   * @param {object} entity
   */
  function ensureControllerMeta(controller, entity) {
    controller.layoutId = getLayoutId(entity, layoutIdKey)
    controller.presenceGroup = getPresenceGroup(
      entity,
      presenceOptions.groupKey,
    )

    if (controller.layoutId && !layoutOptions) {
      warnOnce(
        `layout-id-without-layout:${controller.layoutId}`,
        `Entity '${controller.id}' provides '${layoutIdKey}', but layout is disabled. Enable 'layout: true' to animate shared/layout transitions.`,
      )
    }

    if (presenceOptions.mode === "wait" && !controller.presenceGroup) {
      warnOnce(
        `wait-without-group:${controller.id}`,
        `Entity '${controller.id}' uses presence mode 'wait' without a '${presenceOptions.groupKey}' value. Falling back to sync behavior for this entity.`,
      )
    }
  }

  /**
   * Captures pre-render rect used for FLIP animations.
   *
   * @param {MotionController} controller
   */
  function captureLayoutBeforeRender(controller) {
    if (!layoutOptions || !controller.element) {
      return
    }

    controller.pendingLayoutRect = controller.element.getBoundingClientRect()
  }

  /**
   * Serializes remove operations for wait-mode presence groups.
   *
   * @param {MotionController} controller
   * @param {() => Promise<void>} runRemove
   */
  async function completeRemoveWithMotion(controller, runRemove) {
    if (presenceOptions.mode !== "wait" || !controller.presenceGroup) {
      await runRemove()
      return
    }

    await presenceRegistry.acquire(controller.presenceGroup)

    try {
      await runRemove()
    } finally {
      presenceRegistry.release(controller.presenceGroup)
    }
  }

  /**
   * Runs a variant animation on the controller element.
   *
   * @param {MotionController} controller
   * @param {string} variant
   */
  async function runMotion(controller, variant) {
    const definition = variants[variant]
    const element = controller.element

    if (!element || !definition) {
      controller.variant = variant
      return
    }

    controller.animation?.cancel()
    if (controller.timeoutId !== null) {
      clearTimeout(controller.timeoutId)
    }

    setVariantClass(controller, variant)
    setPhase(controller, PHASES.START)

    if (isReducedMotion()) {
      commitFinalFrame(element, definition)
      setPhase(controller, PHASES.END)
      controller.variant = variant
      return
    }

    const keyframes = definition.frames || definition.keyframes || []
    const options = {
      fill: "forwards",
      ...definition.options,
    }

    if (typeof element.animate !== "function") {
      setPhase(controller, PHASES.ACTIVE)
      commitFinalFrame(element, definition)
      setPhase(controller, PHASES.END)
      controller.variant = variant
      return
    }

    await new Promise((resolve) => {
      scheduleFrame(() => {
        if (controller.element !== element) {
          resolve()
          return
        }

        setPhase(controller, PHASES.ACTIVE)

        const animation = element.animate(keyframes, options)
        controller.animation = animation

        let settled = false
        const onDone = () => {
          if (settled) {
            return
          }
          settled = true

          if (controller.animation === animation) {
            commitFinalFrame(element, definition)
            setPhase(controller, PHASES.END)
            controller.variant = variant
            controller.animation = null
          }

          if (controller.timeoutId !== null) {
            clearTimeout(controller.timeoutId)
            controller.timeoutId = null
          }

          resolve()
        }

        animation.addEventListener("finish", onDone, { once: true })
        animation.addEventListener("cancel", onDone, { once: true })

        const timeoutMs = getAnimationTimeoutMs(options, fallbackBufferMs)
        controller.timeoutId = setTimeout(onDone, timeoutMs)
      })
    })
  }

  /**
   * @param {MotionController} controller
   */
  function maybeStartLayoutMotion(controller) {
    if (!layoutOptions || !controller.element) {
      return
    }

    const toRect = controller.element.getBoundingClientRect()
    const fromRect =
      sharedLayoutRegistry.getSnapshotRect(controller) ||
      controller.pendingLayoutRect
    controller.pendingLayoutRect = null
    controller.layoutRect = toRect

    if (!fromRect || isReducedMotion()) {
      return
    }

    const delta = computeLayoutDelta(fromRect, toRect)
    if (!hasLayoutMovement(delta)) {
      return
    }

    controller.layoutAnimation?.cancel()
    controller.layoutAnimation = controller.element.animate(
      [
        {
          transform: `translate(${delta.deltaX}px, ${delta.deltaY}px) scale(${delta.scaleX}, ${delta.scaleY})`,
          transformOrigin: "top left",
        },
        {
          transform: `translate(0px, 0px) scale(${UNIT_SCALE}, ${UNIT_SCALE})`,
          transformOrigin: "top left",
        },
      ],
      {
        duration: layoutOptions.duration,
        easing: layoutOptions.easing,
      },
    )
  }

  /**
   * @param {MotionController} controller
   * @param {string} variant
   */
  function setVariantClass(controller, variant) {
    if (!controller.element) {
      return
    }

    if (controller.variantClass) {
      controller.element.classList.remove(controller.variantClass)
    }

    const nextVariantClass = `${classPrefix}--variant-${sanitizeClassPart(variant)}`
    controller.element.classList.add(nextVariantClass)
    controller.variantClass = nextVariantClass
  }

  /**
   * @param {MotionController} controller
   * @param {string} phase
   */
  function setPhase(controller, phase) {
    controller.phase = phase

    const element = controller.element
    if (!element) {
      return
    }

    element.classList.remove(
      `${classPrefix}--${PHASES.START}`,
      `${classPrefix}--${PHASES.ACTIVE}`,
      `${classPrefix}--${PHASES.END}`,
    )

    if (phase !== PHASES.IDLE) {
      element.classList.add(`${classPrefix}--${phase}`)
    }
  }
}

/**
 * @param {MotionController} controller
 */
function cancelScheduledFrame(controller) {
  if (controller.layoutFrameId !== null) {
    cancelFrame(controller.layoutFrameId)
    controller.layoutFrameId = null
  }
}

/**
 * @param {() => void} callback
 * @returns {number}
 */
function scheduleFrame(callback) {
  if (typeof requestAnimationFrame === "function") {
    return requestAnimationFrame(callback)
  }

  return setTimeout(callback, ZERO)
}

/**
 * @param {number} frameId
 */
function cancelFrame(frameId) {
  if (typeof cancelAnimationFrame === "function") {
    cancelAnimationFrame(frameId)
    return
  }

  clearTimeout(frameId)
}
