/* eslint-disable no-magic-numbers */
import { line as lineRenderer } from "../cartesian/line.js"
import * as handlers from "../handlers.js"
import { render } from "../template.js"
import { STREAM_DEFAULTS } from "./defaults.js"
import { withRealtime } from "./with-realtime.js"

const baseLineChart = {
  ...handlers,
  render,
  ...lineRenderer,
}

export const lineChart = withRealtime(baseLineChart)

function targetsResolve(entity, payload) {
  const targetId = payload?.targetId
  if (targetId) return [targetId]
  return Array.isArray(entity.targets) ? entity.targets : []
}

function targetsNotify(entity, payload, api, eventName) {
  targetsResolve(entity, payload).forEach((id) =>
    api.notify(`#${id}:${eventName}`),
  )
}

/**
 * Legacy controller-based type. Prefer per-chart `entity.realtime`.
 */
export const realtimeStream = {
  streamTick(entity, payload, api) {
    const min = entity.min ?? STREAM_DEFAULTS.min
    const max = entity.max ?? STREAM_DEFAULTS.max
    const variation = entity.variation ?? STREAM_DEFAULTS.variation
    const currentValue = entity.currentValue ?? STREAM_DEFAULTS.currentValue
    const nextValue = Math.max(
      min,
      Math.min(
        max,
        currentValue + Math.round((Math.random() - 0.5) * variation * 2),
      ),
    )
    entity.currentValue = nextValue

    targetsResolve(entity, payload).forEach((id) => {
      const streamPayload = { value: nextValue }
      if (Number.isFinite(entity.windowSize) && entity.windowSize > 0) {
        streamPayload.windowSize = entity.windowSize
      }
      if (Number.isFinite(entity.maxHistory) && entity.maxHistory > 0) {
        streamPayload.maxHistory = entity.maxHistory
      }

      api.notify(`#${id}:streamSlide`, streamPayload)
      api.notify(`#${id}:streamModeChange`, {
        mode: "live",
        visibleWindow: entity.visibleWindow ?? STREAM_DEFAULTS.visibleWindow,
      })
    })
  },

  streamPause(entity, payload, api) {
    targetsNotify(entity, payload, api, "streamPause")
  },

  streamPlay(entity, payload, api) {
    targetsNotify(entity, payload, api, "streamPlay")
  },
}
