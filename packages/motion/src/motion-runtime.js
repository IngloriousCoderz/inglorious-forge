import { PHASES } from "./constants.js"
import {
  commitFinalFrame,
  getAnimationTimeoutMs,
  isReducedMotion,
  sanitizeClassPart,
} from "./utils.js"

const SHARED_SNAPSHOT_TTL_MS = 1200
const DEFAULT_LAYOUT_DURATION_MS = 260
const DEFAULT_LAYOUT_EASING = "cubic-bezier(0.22, 1, 0.36, 1)"
const LAYOUT_MIN_POSITION_DELTA = 0.5
const LAYOUT_MIN_SCALE_DELTA = 0.01
const UNIT_SCALE = 1
const sharedLayoutSnapshots = new Map()
const presenceGroups = new Map()

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
            storeSharedSnapshot(controller)
            controller.pendingLayoutRect = null
          }

          controller.element = element ?? null
          if (element) {
            if (!controller.layoutRect) {
              controller.layoutRect = element.getBoundingClientRect()
            }

            if (controller.layoutFrameId !== null) {
              cancelAnimationFrame(controller.layoutFrameId)
            }

            controller.layoutFrameId = requestAnimationFrame(() => {
              controller.layoutFrameId = null
              maybeStartLayoutMotion(controller)
            })
          } else if (controller.layoutFrameId !== null) {
            cancelAnimationFrame(controller.layoutFrameId)
            controller.layoutFrameId = null
          }

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
    controller.layoutAnimation?.cancel()
    if (controller.layoutFrameId !== null) {
      cancelAnimationFrame(controller.layoutFrameId)
    }
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

  function ensureControllerMeta(controller, entity) {
    controller.layoutId = getLayoutId(entity, layoutIdKey)
    controller.presenceGroup = getPresenceGroup(
      entity,
      presenceOptions.groupKey,
    )
  }

  function captureLayoutBeforeRender(controller) {
    if (!layoutOptions || !controller.element) {
      return
    }

    controller.pendingLayoutRect = controller.element.getBoundingClientRect()
  }

  async function completeRemoveWithMotion(controller, runRemove) {
    if (presenceOptions.mode !== "wait" || !controller.presenceGroup) {
      await runRemove()
      return
    }

    const state = ensurePresenceGroup(controller.presenceGroup)
    await acquirePresenceSlot(state)

    try {
      await runRemove()
    } finally {
      releasePresenceSlot(state)
    }
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

  function maybeStartLayoutMotion(controller) {
    if (!layoutOptions || !controller.element) {
      return
    }

    const toRect = controller.element.getBoundingClientRect()
    const sharedRect = getSharedSnapshotRect(controller)
    const fromRect = sharedRect || controller.pendingLayoutRect
    controller.pendingLayoutRect = null
    controller.layoutRect = toRect

    if (!fromRect || isReducedMotion()) {
      return
    }

    const deltaX = fromRect.left - toRect.left
    const deltaY = fromRect.top - toRect.top
    const scaleX = toRect.width ? fromRect.width / toRect.width : UNIT_SCALE
    const scaleY = toRect.height ? fromRect.height / toRect.height : UNIT_SCALE
    const hasMovement =
      Math.abs(deltaX) > LAYOUT_MIN_POSITION_DELTA ||
      Math.abs(deltaY) > LAYOUT_MIN_POSITION_DELTA ||
      Math.abs(scaleX - UNIT_SCALE) > LAYOUT_MIN_SCALE_DELTA ||
      Math.abs(scaleY - UNIT_SCALE) > LAYOUT_MIN_SCALE_DELTA

    if (!hasMovement) {
      return
    }

    controller.layoutAnimation?.cancel()
    controller.layoutAnimation = controller.element.animate(
      [
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
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

  function getSharedSnapshotRect(controller) {
    if (!controller.layoutId) {
      return null
    }

    const snapshot = sharedLayoutSnapshots.get(controller.layoutId)
    if (!snapshot) {
      return null
    }

    if (Date.now() - snapshot.at > SHARED_SNAPSHOT_TTL_MS) {
      sharedLayoutSnapshots.delete(controller.layoutId)
      return null
    }

    if (snapshot.entityId === controller.id) {
      return null
    }

    sharedLayoutSnapshots.delete(controller.layoutId)
    return snapshot.rect
  }

  function storeSharedSnapshot(controller) {
    if (!layoutOptions || !controller.layoutId) {
      return
    }

    const snapshotRect =
      controller.element?.getBoundingClientRect() || controller.layoutRect
    if (!snapshotRect) {
      return
    }

    sharedLayoutSnapshots.set(controller.layoutId, {
      at: Date.now(),
      entityId: controller.id,
      rect: snapshotRect,
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

  function ensurePresenceGroup(groupId) {
    if (!presenceGroups.has(groupId)) {
      presenceGroups.set(groupId, {
        active: false,
        queue: [],
      })
    }

    return presenceGroups.get(groupId)
  }

  function acquirePresenceSlot(state) {
    if (!state.active) {
      state.active = true
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      state.queue.push(resolve)
    })
  }

  function releasePresenceSlot(state) {
    const next = state.queue.shift()
    if (next) {
      next()
      return
    }

    state.active = false
  }
}

function resolveLayoutOptions(layout) {
  if (!layout) {
    return null
  }

  if (layout === true) {
    return {
      duration: DEFAULT_LAYOUT_DURATION_MS,
      easing: DEFAULT_LAYOUT_EASING,
    }
  }

  return {
    duration: layout.duration ?? DEFAULT_LAYOUT_DURATION_MS,
    easing: layout.easing ?? DEFAULT_LAYOUT_EASING,
  }
}

function resolvePresenceOptions(presence) {
  if (!presence) {
    return {
      groupKey: "motionPresenceGroup",
      mode: "sync",
    }
  }

  return {
    groupKey: presence.groupKey ?? "motionPresenceGroup",
    mode: presence.mode ?? "sync",
  }
}

function getLayoutId(entity, layoutIdKey) {
  if (!layoutIdKey) {
    return null
  }

  return entity[layoutIdKey] ?? null
}

function getPresenceGroup(entity, groupKey) {
  if (!groupKey) {
    return null
  }

  return entity[groupKey] ?? null
}
