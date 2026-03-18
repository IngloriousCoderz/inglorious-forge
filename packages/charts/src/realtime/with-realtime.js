/* eslint-disable no-magic-numbers */

import { brushChange } from "../handlers/chart-handlers.js"
import { STREAM_DEFAULTS } from "./defaults.js"
import { streamSlide } from "./stream-slide.js"

const INTERNAL_PULSE_MS = 100
const runtimeTypeTargets = new Set()
const runtimeEntityTypes = new Map()
let runtimeApi = null
let runtimePulseId = null

export function withRealtime(chartType) {
  return {
    ...chartType,

    create(entity, payload, api) {
      chartType.create?.(entity, payload, api)

      if (!entity?.realtime?.enabled) return

      ensureRealtimeSeed(entity)
      registerRuntime(entity, api)
      syncRealtimeWindow(entity, entity.realtime?.paused ? "paused" : "live")
    },

    destroy(entity, payload, api) {
      chartType.destroy?.(entity, payload, api)
      unregisterRuntime(entity)
    },

    streamTick(entity) {
      if (!entity?.realtime?.enabled) return

      ensureRealtimeSeed(entity)
      const realtime = getRealtimeConfig(entity)
      const now = Date.now()
      const lastTickAt = entity.realtime.lastTickAt

      if (
        Number.isFinite(lastTickAt) &&
        now - lastTickAt < realtime.intervalMs
      ) {
        return
      }

      entity.realtime.lastTickAt = now

      if (entity.realtime.paused) {
        syncRealtimeWindow(entity, "paused")
        return
      }

      const delta = Math.round((Math.random() - 0.5) * realtime.variation * 2)
      const currentValue = Number.isFinite(entity.realtime.currentValue)
        ? entity.realtime.currentValue
        : realtime.currentValue
      const nextValue = Math.max(
        realtime.min,
        Math.min(realtime.max, currentValue + delta),
      )

      entity.realtime.currentValue = nextValue
      streamSlide(entity, { value: nextValue, maxHistory: realtime.maxHistory })
      syncRealtimeWindow(entity, "live")
    },

    streamPause(entity) {
      if (!entity?.realtime?.enabled) return
      entity.realtime.paused = true
      syncRealtimeWindow(entity, "paused")
    },

    streamPlay(entity) {
      if (!entity?.realtime?.enabled) return
      entity.realtime.paused = false
      syncRealtimeWindow(entity, "live")
    },
  }
}

function getRealtimeConfig(entity) {
  return {
    ...STREAM_DEFAULTS,
    ...(entity.realtime || {}),
  }
}

function ensureRealtimeSeed(entity) {
  const realtime = getRealtimeConfig(entity)

  entity.streamXKey ??= "name"
  entity.streamYKey ??= "value"
  entity.maxHistory ??= realtime.maxHistory

  if (Array.isArray(entity.data) && entity.data.length > 0) {
    entity.streamIndex ??= entity.data.length - 1
    entity.realtime.currentValue ??= realtime.currentValue
    return
  }

  const visibleWindow = Math.max(1, realtime.visibleWindow)
  entity.data = Array.from({ length: visibleWindow }, (_, index) => ({
    [entity.streamXKey]: `${index}`,
    [entity.streamYKey]: realtime.currentValue,
  }))
  entity.streamIndex = visibleWindow - 1
  entity.realtime.currentValue = realtime.currentValue
}

function syncRealtimeWindow(entity, mode) {
  const realtime = getRealtimeConfig(entity)
  entity.brush ??= {
    enabled: true,
    height: 30,
  }
  entity.brush.enabled = true

  if (mode === "paused") {
    entity.brush.visible = true
    return
  }

  entity.brush.visible = false

  const endIndex = Math.max(0, entity.data.length - 1)
  const startIndex = Math.max(
    0,
    endIndex - (Math.max(1, realtime.visibleWindow) - 1),
  )

  brushChange(entity, {
    startIndex,
    endIndex,
  })
}

function registerRuntime(entity, api) {
  if (!entity?.id || !entity?.type || !api) return

  runtimeEntityTypes.set(entity.id, entity.type)
  runtimeTypeTargets.add(entity.type)
  runtimeApi = api

  if (runtimePulseId) return

  runtimePulseId = setInterval(() => {
    runtimeTypeTargets.forEach((type) => {
      runtimeApi?.notify?.(`${type}:streamTick`)
    })
  }, INTERNAL_PULSE_MS)
}

function unregisterRuntime(entity) {
  if (!entity?.id) return

  const entityType = runtimeEntityTypes.get(entity.id)
  if (!entityType) return

  runtimeEntityTypes.delete(entity.id)

  const hasRemainingType = Array.from(runtimeEntityTypes.values()).includes(
    entityType,
  )
  if (!hasRemainingType) {
    runtimeTypeTargets.delete(entityType)
  }

  if (runtimeTypeTargets.size > 0) return

  clearInterval(runtimePulseId)
  runtimePulseId = null
}
