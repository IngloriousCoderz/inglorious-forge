import { ONE, ZERO } from "./constants.js"

export function getAnimationTimeoutMs(options, fallbackBufferMs) {
  const duration = Number(options?.duration ?? ZERO)
  const delay = Number(options?.delay ?? ZERO)
  return Math.max(ZERO, duration + delay + fallbackBufferMs)
}

export function commitFinalFrame(element, definition) {
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

export function sanitizeClassPart(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "-")
}

export function isReducedMotion() {
  return Boolean(
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
}
