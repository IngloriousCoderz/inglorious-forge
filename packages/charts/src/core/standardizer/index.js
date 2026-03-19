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
  mergeEntityInput,
} from "./resolve-input.js"
import { createScales } from "./resolve-scales.js"

export function createFrameFromEntity(entity, api = null) {
  return createFrame(entity, {}, api)
}

export function createFrameFromRender(source, config = {}, api = null) {
  return createFrame(source, config, api)
}

function createFrame(source, config, api) {
  const sourceObject = isObject(source) ? source : {}
  const configObject = isObject(config) ? config : {}
  const explicitComponents = getComponents(
    configObject.children ?? sourceObject.children,
  )
  const requestedKeys = getDataKeys(
    explicitComponents,
    configObject.dataKeys ?? sourceObject.dataKeys,
  )
  const entityInput = mergeEntityInput(sourceObject, configObject)
  const chartType = getChartType(entityInput, explicitComponents)
  const chartEntity = createChartEntity(
    {
      ...entityInput,
      id: entityInput.id || createStableId(entityInput, chartType),
      type: chartType,
    },
    requestedKeys,
  )
  const components =
    explicitComponents.length > 0
      ? explicitComponents
      : DEFAULT_COMPONENTS[chartType]?.(chartEntity) || []
  const tooltipEnabled = getTooltipState(chartEntity, components)
  const filteredEntity = applyBrushWindow(
    chartEntity,
    components,
    tooltipEnabled,
  )
  syncInteractionEntity(sourceObject, filteredEntity)
  const dimensions = createDimensions(filteredEntity, components)
  const scales = createScales(filteredEntity, components, dimensions)

  return {
    api,
    entity: filteredEntity,
    interactionEntity: sourceObject,
    components,
    scales,
    dimensions,
  }
}

function syncInteractionEntity(sourceObject, filteredEntity) {
  if (!isObject(sourceObject)) return

  if (filteredEntity.brush) {
    sourceObject.brush = {
      ...filteredEntity.brush,
      ...sourceObject.brush,
    }
  }
}
