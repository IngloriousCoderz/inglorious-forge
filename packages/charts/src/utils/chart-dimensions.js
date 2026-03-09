import { parseDimension } from "./data-utils.js"
import { resolvePadding } from "./padding.js"

const DEFAULT_WIDTH = 800
const DEFAULT_HEIGHT = 400

/**
 * Resolve effective chart dimensions and padding.
 * @param {Object} options
 * @param {number|string} [options.configWidth]
 * @param {number|string} [options.configHeight]
 * @param {number|Object} [options.configPadding]
 * @param {number|string} [options.entityWidth]
 * @param {number|string} [options.entityHeight]
 * @param {number|Object} [options.entityPadding]
 * @returns {{width:number,height:number,padding:{top:number,right:number,bottom:number,left:number}}}
 */
export function resolveChartDimensions(options = {}) {
  const {
    configWidth,
    configHeight,
    configPadding,
    entityWidth,
    entityHeight,
    entityPadding,
  } = options

  const width = parseDimension(configWidth ?? entityWidth) || DEFAULT_WIDTH
  const height = parseDimension(configHeight ?? entityHeight) || DEFAULT_HEIGHT
  const padding = resolvePadding(configPadding ?? entityPadding, width, height)

  return { width, height, padding }
}
