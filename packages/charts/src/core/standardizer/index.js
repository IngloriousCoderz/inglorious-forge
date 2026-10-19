/* eslint-disable no-magic-numbers */
import { DEFAULT_PRIMITIVES } from "../default-primitives.js"
import { createChartEntity, getDataKeys } from "./normalize-data.js"
import { createDimensions } from "./resolve-dimensions.js"
import {
  applyBrushWindow,
  getChartType,
  getPrimitives,
  getTooltipState,
  isObject,
} from "./resolve-input.js"
import { createScales } from "./resolve-scales.js"

// Rendering only reads: the source, and the store entity behind it, are never
// written to. What the user does on a chart (dragging its brush, hovering it)
// reaches its entity as events, so a chart that keeps such state needs one.

export function createFrameFromEntity(entity, api = null) {
  return createFrame(entity, entity?.id ?? null, api)
}

export function createFrameFromRender(props, api = null) {
  const source = isObject(props) ? props : {}
  const entityId = typeof source.entity === "string" ? source.entity : null
  const resolved = entityId ? api?.getEntity?.(entityId) : null

  const explicitPrimitives = getPrimitives(source.children)
  if (!Object.hasOwn(source, "children") || explicitPrimitives.length === 0) {
    throw new Error(
      "[charts] Chart.render (composition) requires 'children' with primitives.",
    )
  }

  return createFrame(
    resolved ? { ...resolved, ...source } : source,
    resolved ? entityId : null,
    api,
  )
}

function createFrame(source, entityId, api) {
  const input = isObject(source) ? source : {}
  const explicitPrimitives = getPrimitives(input.children)

  const isComposition = Object.hasOwn(input, "children")
  const shouldFallback = !isComposition || explicitPrimitives.length === 0

  const chartType = getChartType(input, explicitPrimitives)
  const chartEntity = createChartEntity(
    { ...input, type: chartType },
    getDataKeys(explicitPrimitives, input.dataKeys),
  )

  const primitives = shouldFallback
    ? DEFAULT_PRIMITIVES[chartType]?.(chartEntity) || []
    : explicitPrimitives
  const isTooltipEnabled = getTooltipState(chartEntity, primitives)
  const filteredEntity = applyBrushWindow(
    chartEntity,
    primitives,
    isTooltipEnabled,
  )

  // Events need an entity to reach, and an api to send them with.
  const isInteractive = Boolean(entityId && api?.notify)
  if (filteredEntity.brush?.enabled && !isInteractive) {
    throw new Error(
      '[charts] A chart with a brush needs an entity to keep the brush\'s state: pass `entity: "<id>"` and `api` to Chart.render, or render it with api.render(id).',
    )
  }

  const dimensions = createDimensions(filteredEntity, primitives)

  return {
    api,
    entity: filteredEntity,
    entityId: isInteractive ? entityId : null,
    primitives,
    dimensions,
    scales: createScales(filteredEntity, primitives, dimensions),
  }
}
