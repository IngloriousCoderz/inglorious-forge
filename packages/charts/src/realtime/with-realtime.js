/* eslint-disable no-magic-numbers */
import { streamSlide } from "../utils/stream-slide.js"
import { STREAM_DEFAULTS } from "./defaults.js"

const INTERNAL_PULSE_MS = 100
const runtimeTargetTypes = new Set()
const runtimeEntityTypes = new Map()
let runtimeApi = null
let runtimePulseId = null

export function streamModeChange(entity, payload) {
  entity.brush ??= { enabled: true, height: 30 }
  entity.brush.enabled = true

  const mode = payload?.mode === "paused" ? "paused" : "live"
  if (mode === "paused") {
    entity.brush.visible = true
    return
  }

  entity.brush.visible = false
  if (!Array.isArray(entity.data) || entity.data.length === 0) return

  const visibleWindow = Number.isFinite(payload?.visibleWindow)
    ? payload.visibleWindow
    : STREAM_DEFAULTS.visibleWindow
  const endIndex = Math.max(0, entity.data.length - 1)
  const startIndex = Math.max(0, endIndex - (Math.max(1, visibleWindow) - 1))

  entity.brush.startIndex = startIndex
  entity.brush.endIndex = endIndex
}

export function withRealtime(chartType) {
  return {
    ...chartType,
    create(entity, payload, api) {
      chartType.create?.(entity, payload, api)

      if (!entity?.realtime?.enabled) return
      runtimeRegister(entity, api)
      realtimeEnsureInitialized(entity)
    },

    destroy(entity, payload, api) {
      chartType.destroy?.(entity, payload, api)
      runtimeUnregister(entity)
    },

    streamSlide,
    streamModeChange,

    streamTick(entity) {
      const realtimeState = entity?.realtime
      const realtime = realtimeEnsureInitialized(entity)
      if (!realtime || !realtimeState) return

      const now = Date.now()
      if (
        Number.isFinite(realtimeState.lastTickAt) &&
        now - realtimeState.lastTickAt < realtime.intervalMs
      ) {
        return
      }
      realtimeState.lastTickAt = now

      if (realtimeState.paused) {
        streamModeChange(entity, { mode: "paused" })
        return
      }

      const nextValue = streamValueNext(realtime)
      realtimeState.currentValue = nextValue

      streamSlide(entity, {
        value: nextValue,
        maxHistory: realtime.maxHistory,
      })
      streamModeChange(entity, {
        mode: "live",
        visibleWindow: realtime.visibleWindow,
      })
    },

    streamPause(entity) {
      const realtime = entity?.realtime
      if (!realtime?.enabled) return
      realtime.paused = true
      streamModeChange(entity, { mode: "paused" })
    },

    streamPlay(entity) {
      const realtime = realtimeConfigGet(entity)
      if (!realtime || !entity?.realtime) return
      entity.realtime.paused = false
      streamModeChange(entity, {
        mode: "live",
        visibleWindow: realtime.visibleWindow,
      })
    },
  }
}

function streamValueNext(realtime) {
  const min = realtime.min
  const max = realtime.max
  const variation = realtime.variation
  const currentValue = realtime.currentValue

  const delta = Math.round((Math.random() - 0.5) * variation * 2)
  return Math.max(min, Math.min(max, currentValue + delta))
}

function realtimeConfigGet(entity) {
  if (!entity?.realtime?.enabled) return null
  return {
    ...STREAM_DEFAULTS,
    ...entity.realtime,
  }
}

function streamSeedBuild(entity, realtime) {
  const windowSize = Number.isFinite(realtime.visibleWindow)
    ? Math.max(1, realtime.visibleWindow)
    : STREAM_DEFAULTS.visibleWindow
  const xKey = entity.streamXKey ?? "name"
  const yKey = entity.streamYKey ?? "value"
  const baseValue =
    realtime.currentValue ??
    entity.realtime?.currentValue ??
    STREAM_DEFAULTS.currentValue

  entity.data = Array.from({ length: windowSize }, (_, i) => ({
    [xKey]: `${i}`,
    [yKey]: baseValue,
  }))
  entity.streamIndex = windowSize - 1
}

function realtimeEnsureInitialized(entity) {
  const realtime = realtimeConfigGet(entity)
  if (!realtime) return null

  if (!Array.isArray(entity.data) || entity.data.length === 0) {
    streamSeedBuild(entity, realtime)
  } else if (!Number.isFinite(entity.streamIndex)) {
    entity.streamIndex = entity.data.length - 1
  }

  return realtime
}

function runtimeRegister(entity, api) {
  const entityId = entity?.id
  const entityType = entity?.type
  if (!entityId || !entityType) return

  if (runtimeEntityTypes.get(entityId) === entityType) return

  runtimeEntityTypes.set(entityId, entityType)
  runtimeTargetTypes.add(entityType)
  runtimeStart(api)
}

function runtimeStart(api) {
  if (!api) return
  runtimeApi = api
  if (runtimePulseId) return

  runtimePulseId = setInterval(() => {
    runtimeTick()
  }, INTERNAL_PULSE_MS)
}

function runtimeUnregister(entity) {
  const entityId = entity?.id
  if (!entityId) return

  const entityType = runtimeEntityTypes.get(entityId)
  if (!entityType) return

  runtimeEntityTypes.delete(entityId)
  const hasType = Array.from(runtimeEntityTypes.values()).includes(entityType)
  if (!hasType) runtimeTargetTypes.delete(entityType)

  if (runtimeTargetTypes.size > 0) return
  clearInterval(runtimePulseId)
  runtimePulseId = null
}

function runtimeTick() {
  if (!runtimeApi || runtimeTargetTypes.size === 0) return
  runtimeTargetTypes.forEach((type) => {
    runtimeApi.notify(`${type}:streamTick`)
  })
}
