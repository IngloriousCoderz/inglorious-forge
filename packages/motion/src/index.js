import { html, ref } from "@inglorious/web"

const PHASES = {
  IDLE: "idle",
  START: "start",
  ACTIVE: "active",
  END: "end",
}

const ZERO = 0
const ONE = 1
const DEFAULT_BUFFER_MS = 50

/**
 * Composes a type with a minimal motion lifecycle powered by WAAPI.
 *
 * - Tracks lifecycle classes on the host element: start, active, end.
 * - Animates on variant change.
 * - Provides `motionVariantChange` and `requestRemove` event handlers.
 *
 * @param {Object} config
 * @param {Object.<string, {frames?: Keyframe[] | PropertyIndexedKeyframes, keyframes?: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions}>} config.variants
 * @param {string} [config.initial="visible"]
 * @param {string} [config.exitVariant="exit"]
 * @param {string} [config.classPrefix="ig-motion"]
 * @param {number} [config.fallbackBufferMs=50]
 * @param {boolean} [config.animateOnMount=true]
 * @returns {(type: object) => object}
 */
export function withMotion({
  variants = {},
  initial = "visible",
  exitVariant = "exit",
  classPrefix = "ig-motion",
  fallbackBufferMs = DEFAULT_BUFFER_MS,
  animateOnMount = true,
} = {}) {
  const controllers = new Map()

  return function withMotionBehavior(type) {
    return {
      motionVariantChange(entity, variant) {
        entity.motionVariant = variant
      },

      async requestRemove(entity, payload = {}, api) {
        const entityId = entity.id
        const targetExitVariant = payload.exitVariant || exitVariant
        const controller = ensureController(entityId)

        if (!variants[targetExitVariant]) {
          cleanupController(entityId)
          if (api.getEntity(entityId)) {
            api.notify("remove", entityId)
          }
          return
        }

        entity.motionVariant = targetExitVariant
        controller.nextVariant = targetExitVariant
        controller.targetVariant = targetExitVariant

        await runMotion(controller, targetExitVariant).finally(() => {
          if (controller.targetVariant === targetExitVariant) {
            controller.targetVariant = null
          }
        })

        if (api.getEntity(entityId)) {
          api.notify("remove", entityId)
        }
        cleanupController(entityId)
      },

      render(entity, api) {
        const controller = ensureController(entity.id)
        const variant = entity.motionVariant || initial
        const content = type.render?.(entity, api) ?? ""
        controller.nextVariant = variant
        maybeStartMotion(controller)

        return html`
          <div
            class="${classPrefix}"
            data-motion-id="${entity.id}"
            ${ref(controller.handleRef)}
          >
            ${content}
          </div>
        `
      },
    }

    function ensureController(entityId) {
      if (!controllers.has(entityId)) {
        const controller = {
          animation: null,
          element: null,
          phase: PHASES.IDLE,
          nextVariant: null,
          targetVariant: null,
          timeoutId: null,
          variant: undefined,
          variantClass: "",
          handleRef(element) {
            controller.element = element ?? null
            maybeStartMotion(controller)
          },
        }

        controllers.set(entityId, controller)
      }

      return controllers.get(entityId)
    }

    function cleanupController(entityId) {
      const controller = controllers.get(entityId)
      if (!controller) {
        return
      }

      controller.animation?.cancel()
      if (controller.timeoutId !== null) {
        clearTimeout(controller.timeoutId)
      }

      controllers.delete(entityId)
    }

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

    async function runMotion(controller, variant) {
      const definition = variants[variant]
      const element = controller.element

      if (!element) {
        controller.variant = variant
        return
      }

      if (!definition) {
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
        requestAnimationFrame(() => {
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

            const isCurrentAnimation = controller.animation === animation
            if (isCurrentAnimation) {
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
}

/**
 * Convenience helper to run exit animation before removing an entity.
 *
 * @param {object} api
 * @param {string} entityId
 * @param {{ exitVariant?: string }} [payload]
 */
export function removeWithMotion(api, entityId, payload = {}) {
  api.notify(`#${entityId}:requestRemove`, payload)
}

function getAnimationTimeoutMs(options, fallbackBufferMs) {
  const duration = Number(options?.duration ?? ZERO)
  const delay = Number(options?.delay ?? ZERO)
  return Math.max(ZERO, duration + delay + fallbackBufferMs)
}

function commitFinalFrame(element, definition) {
  const keyframes = definition.frames || definition.keyframes

  if (!Array.isArray(keyframes) || keyframes.length === ZERO) {
    return
  }

  const finalFrame = keyframes[keyframes.length - ONE]
  if (!finalFrame || typeof finalFrame !== "object") {
    return
  }

  for (const [property, value] of Object.entries(finalFrame)) {
    if (typeof value === "string" || typeof value === "number") {
      element.style[property] = String(value)
    }
  }
}

function sanitizeClassPart(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "-")
}

function isReducedMotion() {
  return Boolean(
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
}
