import { html, ref } from "@inglorious/web"

import { DEFAULT_BUFFER_MS } from "./constants.js"
import { createMotionRuntime } from "./motion-runtime.js"
import { warnOnce } from "./warnings.js"

const DEFAULT_LAYOUT_ID_KEY = "motionLayoutId"

/**
 * Composes a type with a minimal motion lifecycle powered by WAAPI.
 *
 * - Tracks lifecycle classes on the host element: start, active, end.
 * - Animates on variant change.
 * - Provides `motionVariantChange` and `removeWithMotion` event handlers.
 *
 * @param {Object} config
 * @param {Object.<string, {frames?: Keyframe[] | PropertyIndexedKeyframes, keyframes?: Keyframe[] | PropertyIndexedKeyframes, options?: KeyframeAnimationOptions}>} config.variants
 * @param {string} [config.initial="visible"]
 * @param {string} [config.exitVariant="exit"]
 * @param {string} [config.classPrefix="iw-motion"]
 * @param {number} [config.fallbackBufferMs=50]
 * @param {boolean} [config.animateOnMount=true]
 * @param {boolean | { duration?: number, easing?: string }} [config.layout=false]
 * @param {string} [config.layoutIdKey="motionLayoutId"]
 * @param {{ mode?: "sync" | "wait", groupKey?: string }} [config.presence]
 * @returns {(type: object) => object}
 */
export function withMotion({
  variants = {},
  initial = "visible",
  exitVariant = "exit",
  classPrefix = "iw-motion",
  fallbackBufferMs = DEFAULT_BUFFER_MS,
  animateOnMount = true,
  layout = false,
  layoutIdKey = DEFAULT_LAYOUT_ID_KEY,
  presence = undefined,
} = {}) {
  if (!Object.keys(variants).length) {
    warnOnce(
      `empty-variants:${classPrefix}`,
      `withMotion('${classPrefix}') has no variants. Motion handlers will be no-ops.`,
    )
  }

  const runtime = createMotionRuntime({
    animateOnMount,
    classPrefix,
    fallbackBufferMs,
    layout,
    layoutIdKey,
    presence,
    variants,
  })

  return function withMotionBehavior(type) {
    async function runRemoveWithMotion(entity, payload = {}, api) {
      const entityId = entity.id
      const targetExitVariant =
        typeof payload === "string"
          ? payload
          : payload.exitVariant || exitVariant
      const controller = runtime.ensureController(entityId)
      runtime.ensureControllerMeta(controller, entity)
      if (
        controller.targetVariant === targetExitVariant ||
        controller.variant === targetExitVariant
      ) {
        return
      }

      controller.targetVariant = targetExitVariant

      await runtime
        .completeRemoveWithMotion(controller, async () => {
          if (!variants[targetExitVariant]) {
            warnOnce(
              `missing-exit-variant:${classPrefix}:${targetExitVariant}`,
              `removeWithMotion requested variant '${targetExitVariant}' but it is not defined. Falling back to immediate remove.`,
            )
            runtime.cleanupController(entityId)
            if (api.getEntity(entityId)) {
              api.notify("remove", entityId)
            }
            return
          }

          api.notify(`#${entityId}:motionVariantChange`, targetExitVariant)
          controller.nextVariant = targetExitVariant
          await runtime.runMotion(controller, targetExitVariant)

          if (api.getEntity(entityId)) {
            api.notify("remove", entityId)
          }
          runtime.cleanupController(entityId)
        })
        .finally(() => {
          if (controller.targetVariant === targetExitVariant) {
            controller.targetVariant = null
          }
        })
    }

    return {
      motionVariantChange(entity, variant) {
        entity.motionVariant = variant
      },

      removeWithMotion: runRemoveWithMotion,

      // Backward compatibility with earlier draft API.
      requestRemove: runRemoveWithMotion,

      render(entity, api) {
        const controller = runtime.ensureController(entity.id)
        const variant = entity.motionVariant || initial
        const content = type.render?.(entity, api) ?? ""
        runtime.captureLayoutBeforeRender(controller)
        runtime.ensureControllerMeta(controller, entity)
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
