import { PHASES } from "./constants.js"
import {
  commitFinalFrame,
  getAnimationTimeoutMs,
  isReducedMotion,
  sanitizeClassPart,
} from "./utils.js"

export function createMotionRuntime({
  animateOnMount,
  classPrefix,
  fallbackBufferMs,
  variants,
}) {
  const controllers = new Map()

  return {
    ensureController,
    cleanupController,
    maybeStartMotion,
    runMotion,
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
