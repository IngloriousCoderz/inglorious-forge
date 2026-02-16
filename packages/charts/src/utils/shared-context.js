/* eslint-disable no-magic-numbers */
import { parseDimension } from "./data-utils.js"
import { calculatePadding } from "./padding.js"
import { createScales } from "./scales.js"

/**
 * Creates a shared context for composition mode charts.
 * Calculates scales, dimensions, and provides a context object for child components.
 *
 * This function unifies the context creation logic for line, area, and bar charts.
 * Follows the standard signature pattern: render<Sub>(entity, props, api)
 *
 * @param {any} entity - Chart entity with data
 * @param {Object} props - Configuration options
 * @param {number|string} [props.width] - Chart width (overrides entity.width)
 * @param {number|string} [props.height] - Chart height (overrides entity.height)
 * @param {Object} [props.padding] - Chart padding (overrides calculated padding)
 * @param {string} [props.chartType="line"] - Chart type ("line", "area", "bar")
 * @param {any} api - Web API instance (not used, but follows standard signature)
 * @returns {Object} Context object with xScale, yScale, dimensions, and entity
 */
export function createSharedContext(entity, props = {}, api) {
  if (!entity || !entity.data) {
    throw new Error("Entity and entity.data are required")
  }

  const {
    width: configWidth,
    height: configHeight,
    padding: configPadding,
    chartType = "line",
    stacked = false,
    usedDataKeys = new Set(),
    filteredEntity = null,
  } = props

  const width =
    parseDimension(configWidth) || parseDimension(entity.width) || 800
  const height =
    parseDimension(configHeight) || parseDimension(entity.height) || 400
  const padding = configPadding || calculatePadding(width, height)

  const entityForX = {
    ...entity,
    width,
    height,
    padding,
    brush: { ...entity.brush, enabled: false },
  }
  const { xScale } = createScales(entityForX, chartType)

  const targetYEntity = filteredEntity || entity
  const entityForY = {
    ...targetYEntity,
    width,
    height,
    padding,
    stacked: entity.stacked || stacked,
    // Pass selected data keys so Y scale knows exactly which columns to consider for max calculation
    dataKeys: Array.from(usedDataKeys),
  }

  const { yScale } = createScales(entityForY, chartType)

  return {
    xScale,
    yScale,
    dimensions: { width, height, padding },
    entity: targetYEntity,
    fullEntity: entity,
    chartType,
    usedDataKeys,
    api,
  }
}
