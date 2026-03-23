/* eslint-disable no-magic-numbers */
import { DEFAULT_COMPONENTS } from "../default-components.js"
import { createChartEntity, getDataKeys } from "./normalize-data.js"
import { createDimensions } from "./resolve-dimensions.js"
import {
  applyBrushWindow,
  createStableId,
  getChartType,
  getComponents,
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

  const explicitComponents = getComponents(source.children)
  if (!Object.hasOwn(source, "children") || explicitComponents.length === 0) {
    throw new Error(
      "[charts] chart.render (composition) requires 'children' with components.",
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
  const explicitComponents = getComponents(input.children)

  const isComposition = Object.hasOwn(input, "children")
  const shouldFallback = !isComposition || explicitComponents.length === 0

  const chartType = getChartType(input, explicitComponents)
  const chartEntity = createChartEntity(
    {
      ...input,
      id: input.id || createStableId(input, chartType),
      type: chartType,
    },
    getDataKeys(explicitComponents, input.dataKeys),
  )

  const components = shouldFallback
    ? DEFAULT_COMPONENTS[chartType]?.(chartEntity) || []
    : explicitComponents
  const tooltipEnabled = getTooltipState(chartEntity, components)
  const filteredEntity = applyBrushWindow(
    chartEntity,
    components,
    tooltipEnabled,
  )
  const dimensions = createDimensions(filteredEntity, components)

  syncInteractionEntity(input, filteredEntity)

  return {
    api,
    entity: filteredEntity,
    interactionEntity: input,
    components,
    dimensions,
    scales: createScales(filteredEntity, components, dimensions),
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
