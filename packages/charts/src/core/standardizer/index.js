/* eslint-disable no-magic-numbers */
import { DEFAULT_PRIMITIVES } from "../default-primitives.js"
import { createChartEntity, getDataKeys } from "./normalize-data.js"
import { createDimensions } from "./resolve-dimensions.js"
import {
  applyBrushWindow,
  createStableId,
  getChartType,
  getPrimitives,
  getTooltipState,
  isObject,
} from "./resolve-input.js"
import { createScales } from "./resolve-scales.js"

export function createFrameFromEntity(entity, api = null) {
  return createFrame(entity, api)
}

export function createFrameFromRender(props, api = null) {
  const source = isObject(props) ? { ...props } : {}
  let interactionTarget = source

  if (
    typeof source.entity === "string" &&
    typeof api?.getEntity === "function"
  ) {
    const resolved = api.getEntity(source.entity)
    if (resolved) {
      Object.assign(source, resolved, props)
      interactionTarget = resolved
    }
  }

  const explicitPrimitives = getPrimitives(source.children)
  if (!Object.hasOwn(source, "children") || explicitPrimitives.length === 0) {
    throw new Error(
      "[charts] chart.render (composition) requires 'children' with primitives.",
    )
  }

  const frame = createFrame(source, api)

  if (interactionTarget !== frame.interactionEntity) {
    frame.interactionEntity = interactionTarget
    syncInteractionEntity(frame.interactionEntity, frame.entity)
  }

  return frame
}

function createFrame(source, api) {
  const input = isObject(source) ? source : {}
  const explicitPrimitives = getPrimitives(input.children)

  const isComposition = Object.hasOwn(input, "children")
  const shouldFallback = !isComposition || explicitPrimitives.length === 0

  const chartType = getChartType(input, explicitPrimitives)
  const chartEntity = createChartEntity(
    {
      ...input,
      id: input.id || createStableId(input, chartType),
      type: chartType,
    },
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
  const dimensions = createDimensions(filteredEntity, primitives)

  syncInteractionEntity(input, filteredEntity)

  return {
    api,
    entity: filteredEntity,
    interactionEntity: input,
    primitives,
    dimensions,
    scales: createScales(filteredEntity, primitives, dimensions),
  }
}

function syncInteractionEntity(source, filteredEntity) {
  if (!isObject(source)) return

  // Brush overlay dispatches `#id:update`, so interaction state must carry
  // the resolved chart id even for inline composition sources.
  source.id ??= filteredEntity.id

  if (filteredEntity.brush) {
    source.brush = { ...filteredEntity.brush, ...source.brush }
  }
}
