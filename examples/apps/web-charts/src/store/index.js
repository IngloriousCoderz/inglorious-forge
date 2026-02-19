import { createStore } from "@inglorious/web"
import {
  areaChart,
  barChart,
  chart,
  createRealtimeStreamSystem,
  donutChart,
  lineChart,
  pieChart,
  streamSlide,
} from "@inglorious/charts"
import { entities } from "./entities.js"
import { middlewares } from "./middlewares.js"

const line = {
  ...lineChart,
  seriesSlide: streamSlide,
}

function syncBrushToLiveWindow(controller, chartEntity) {
  if (!Array.isArray(chartEntity?.data)) return

  chartEntity.brush ??= { enabled: true, height: 30 }
  chartEntity.brush.enabled = true

  const lastIndex = Math.max(0, chartEntity.data.length - 1)
  const visibleCount = Math.max(
    1,
    controller.visibleWindow ?? chartEntity.streamWindow ?? 30,
  )
  const startIndex = Math.max(0, lastIndex - (visibleCount - 1))

  chartEntity.brush.startIndex = startIndex
  chartEntity.brush.endIndex = lastIndex
}

function isTargetPaused(controller, targetId) {
  return Boolean(controller.pausedTargets?.[targetId])
}

function setTargetPaused(controller, targetId, paused) {
  controller.pausedTargets ??= {}
  controller.pausedTargets[targetId] = paused
}

function toggleTargetBrush(api, targetId, visible) {
  const chartEntity = api.getEntity(targetId)
  if (!chartEntity) return

  chartEntity.brush ??= { enabled: true, height: 30 }
  chartEntity.brush.enabled = true
  chartEntity.brush.visible = visible
}

const realtimeStream = {
  streamTick(entity, _payload, api) {
    const min = Number.isFinite(entity.min) ? entity.min : 80
    const max = Number.isFinite(entity.max) ? entity.max : 420
    const variation = Number.isFinite(entity.variation) ? entity.variation : 25
    const currentValue = Number.isFinite(entity.currentValue)
      ? entity.currentValue
      : 220

    const delta = Math.round((Math.random() - 0.5) * variation * 2)
    const nextValue = Math.max(min, Math.min(max, currentValue + delta))
    entity.currentValue = nextValue

    if (!Array.isArray(entity.targets)) return

    entity.targets.forEach((targetId) => {
      if (isTargetPaused(entity, targetId)) {
        toggleTargetBrush(api, targetId, true)
        return
      }

      const payload = { value: nextValue }
      if (Number.isFinite(entity.windowSize) && entity.windowSize > 0) {
        payload.windowSize = entity.windowSize
      }
      api.notify(`#${targetId}:seriesSlide`, payload)

      const chartEntity = api.getEntity(targetId)
      if (!chartEntity) return

      chartEntity.brush ??= { enabled: true, height: 30 }
      chartEntity.brush.visible = false
      syncBrushToLiveWindow(entity, chartEntity)
    })
  },

  streamPause(entity, _payload, api) {
    const targetId = _payload?.targetId

    if (targetId) {
      setTargetPaused(entity, targetId, true)
      toggleTargetBrush(api, targetId, true)
      return
    }

    if (!Array.isArray(entity.targets)) return
    entity.targets.forEach((id) => {
      setTargetPaused(entity, id, true)
      toggleTargetBrush(api, id, true)
    })
  },

  streamPlay(entity, _payload, api) {
    const targetId = _payload?.targetId

    if (targetId) {
      setTargetPaused(entity, targetId, false)
      toggleTargetBrush(api, targetId, false)

      const chartEntity = api.getEntity(targetId)
      if (!chartEntity?.brush || !Array.isArray(chartEntity.data)) return
      syncBrushToLiveWindow(entity, chartEntity)
      return
    }

    if (!Array.isArray(entity.targets)) return
    entity.targets.forEach((id) => {
      setTargetPaused(entity, id, false)
      toggleTargetBrush(api, id, false)

      const chartEntity = api.getEntity(id)
      if (!chartEntity?.brush || !Array.isArray(chartEntity.data)) return
      syncBrushToLiveWindow(entity, chartEntity)
    })
  },
}

const realtimeStreamRuntime = createRealtimeStreamSystem({
  controllerId: "realtimeStreamController",
  tickEvent: "streamTick",
  minIntervalMs: 100,
})

export const stopRealtimeStreamSystem = realtimeStreamRuntime.stop

export const store = createStore({
  types: {
    area: areaChart,
    line,
    bar: barChart,
    pie: pieChart,
    donut: donutChart,
    realtimeStream,
    // Add chart object for composition methods
    chart: chart,
  },
  entities,
  middlewares,
  systems: [realtimeStreamRuntime.system],
})
