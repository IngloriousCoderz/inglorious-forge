/* eslint-disable no-magic-numbers */

import { DEFAULT_BRUSH_HEIGHT } from "../core/defaults.js"
import { brushChange } from "../handlers/chart-handlers.js"
import { streamSlide } from "../realtime/stream-slide.js"

const DEFAULT_VISIBLE_WINDOW = 30
const DEFAULT_MAX_HISTORY = 2000

/**
 * Makes a chart type follow a stream of data that the app pushes with
 * `streamPush`. While live, the chart shows the latest `visibleWindow` points.
 * Paused, it stays as it is and shows a brush to look back through it: points
 * pushed meanwhile wait in `realtime.pending`, and join the data on play.
 *
 * Configured by the entity's `realtime`: `visibleWindow` (default 30) and
 * `maxHistory` (default 2000), the most points kept.
 *
 * @param {object} chartType - Usually `Chart`.
 * @returns {object} The chart type with the stream events.
 */
export function withRealtime(chartType) {
  return {
    ...chartType,

    create(entity, payload, api) {
      chartType.create?.(entity, payload, api)

      entity.data ??= []
      entity.realtime ??= {}
      entity.realtime.visibleWindow ??= DEFAULT_VISIBLE_WINDOW
      entity.realtime.maxHistory ??= DEFAULT_MAX_HISTORY
      entity.realtime.isPaused ??= false
      entity.realtime.pending ??= []
      showWindow(entity)
    },

    /**
     * Adds a point: a number, put at the next index, or a whole data point.
     */
    streamPush(entity, payload) {
      const { realtime } = entity

      if (realtime.isPaused) {
        realtime.pending.push(payload)
        if (realtime.pending.length > realtime.maxHistory) {
          realtime.pending.shift()
        }
        return
      }

      addPoint(entity, payload)
      showWindow(entity)
    },

    streamPause(entity) {
      entity.realtime.isPaused = true
      showWindow(entity)
    },

    streamPlay(entity) {
      const { realtime } = entity
      realtime.isPaused = false
      realtime.pending.forEach((payload) => addPoint(entity, payload))
      realtime.pending = []
      showWindow(entity)
    },
  }
}

function addPoint(entity, payload) {
  streamSlide(entity, {
    ...(typeof payload === "number" ? { value: payload } : { point: payload }),
    maxHistory: entity.realtime.maxHistory,
  })
}

function showWindow(entity) {
  entity.brush ??= { height: DEFAULT_BRUSH_HEIGHT }
  entity.brush.enabled = true
  entity.brush.visible = entity.realtime.isPaused

  if (entity.realtime.isPaused && Number.isInteger(entity.brush.startIndex)) {
    return
  }

  const endIndex = Math.max(0, entity.data.length - 1)
  const startIndex = Math.max(
    0,
    endIndex - Math.max(1, entity.realtime.visibleWindow) + 1,
  )
  brushChange(entity, { startIndex, endIndex })
}
