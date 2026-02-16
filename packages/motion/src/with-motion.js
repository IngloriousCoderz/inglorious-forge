import { html, ref } from "@inglorious/web"

import { DEFAULT_BUFFER_MS } from "./constants.js"
import { createMotionRuntime } from "./motion-runtime.js"

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
  const runtime = createMotionRuntime({
    animateOnMount,
    classPrefix,
    fallbackBufferMs,
    variants,
  })

  return function withMotionBehavior(type) {
    return {
      motionVariantChange(entity, variant) {
        entity.motionVariant = variant
      },

      async requestRemove(entity, payload = {}, api) {
        const entityId = entity.id
        const targetExitVariant = payload.exitVariant || exitVariant
        const controller = runtime.ensureController(entityId)

        if (!variants[targetExitVariant]) {
          runtime.cleanupController(entityId)
          if (api.getEntity(entityId)) {
            api.notify("remove", entityId)
          }
          return
        }

        entity.motionVariant = targetExitVariant
        controller.nextVariant = targetExitVariant
        controller.targetVariant = targetExitVariant

        await runtime.runMotion(controller, targetExitVariant).finally(() => {
          if (controller.targetVariant === targetExitVariant) {
            controller.targetVariant = null
          }
        })

        if (api.getEntity(entityId)) {
          api.notify("remove", entityId)
        }
        runtime.cleanupController(entityId)
      },

      render(entity, api) {
        const controller = runtime.ensureController(entity.id)
        const variant = entity.motionVariant || initial
        const content = type.render?.(entity, api) ?? ""
        controller.nextVariant = variant
        runtime.maybeStartMotion(controller)

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
  }
}
