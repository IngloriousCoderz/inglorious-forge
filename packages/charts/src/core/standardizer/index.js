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

/**
 * Builds a render frame for config-mode store entities (`api.render("entityId")`).
 *
 * Config-mode does not require explicit `children`; it may fall back to
 * `DEFAULT_COMPONENTS` based on the resolved chart type.
 *
 * @param {any} entity - Chart entity-like payload (must include `type`, `data`, etc.).
 * @param {any} api - Web API instance.
 * @returns {{api:any, entity:any, interactionEntity:any, components:any[], scales:any, dimensions:any}}
 */
export function createFrameFromEntity(entity, api = null) {
  return createFrame(entity, {}, api)
}

/**
 * Builds a render frame for composition-mode `chart.render(...)`.
 *
 * Composition expects `children` to be provided explicitly (axes/tooltip/series),
 * so the caller doesn't fall back to implicit `DEFAULT_COMPONENTS`.
 *
 * @param {any} source - Chart source/entity-like object (must include `type`, `data`, etc.).
 * @param {any} config - Composition parameters (must include `children` in composition mode).
 * @param {any} api - Web API instance (used by engine/renderers for interactions).
 * @returns {{api:any, entity:any, interactionEntity:any, components:any[], scales:any, dimensions:any}}
 */
export function createFrameFromRender(source, config = {}, api = null) {
  const sourceObject = isObject(source) ? source : {}
  const configObject = isObject(config) ? config : {}
  const configHasChildren = Object.hasOwn(configObject, "children")
  const sourceHasChildren = Object.hasOwn(sourceObject, "children")

  const rawChildren = configHasChildren
    ? configObject.children
    : sourceObject.children

  const explicitComponents = getComponents(rawChildren)

  // Composition: children are required and must not be empty.
  if (!configHasChildren && !sourceHasChildren) {
    throw new Error(
      "[charts] chart.render (composition) requires `children`. " +
        "Provide components like chart.Line/Area/Bar/Pie plus axes/tooltip as needed.",
    )
  }

  if (explicitComponents.length === 0) {
    throw new Error(
      "[charts] chart.render (composition) received `children` but it is empty. " +
        "Provide at least one chart component.",
    )
  }

  return createFrame(source, config, api)
}

/**
 * Internal standardization pipeline used by both config-mode and composition-mode.
 * It resolves:
 * - chart type + chart entity normalization
 * - explicit vs default components fallback
 * - brush window + tooltip availability
 * - dimensions and scales for the engine
 *
 * @param {any} source - Entity/source payload
 * @param {any} config - Config payload
 * @param {any} api - Web API instance
 * @returns {{api:any, entity:any, interactionEntity:any, components:any[], scales:any, dimensions:any}}
 */
function createFrame(source, config, api) {
  const sourceObject = isObject(source) ? source : {}
  const configObject = isObject(config) ? config : {}
  const configHasChildren = Object.hasOwn(configObject, "children")
  const sourceHasChildren = Object.hasOwn(sourceObject, "children")

  const rawChildren = configHasChildren
    ? configObject.children
    : sourceObject.children

  const explicitComponents = getComponents(rawChildren)

  // If the caller explicitly provided `children` (even if it ends up empty),
  // we must not fall back to DEFAULT_COMPONENTS.
  const shouldFallbackToDefaults =
    explicitComponents.length === 0 && !configHasChildren && !sourceHasChildren
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
  const components = shouldFallbackToDefaults
    ? DEFAULT_COMPONENTS[chartType]?.(chartEntity) || []
    : explicitComponents
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
