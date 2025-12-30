/**
 * Chart Context - compartilha escalas e dimensões entre componentes
 * Similar ao contexto do Recharts, mas adaptado para entidades
 */

/**
 * @typedef {Object} ChartContext
 * @property {import('d3-scale').ScaleBand|import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} xScale
 * @property {import('d3-scale').ScaleLinear} yScale
 * @property {Object} dimensions
 * @property {number} dimensions.width
 * @property {number} dimensions.height
 * @property {Object} dimensions.padding
 * @property {any} entity
 */

import { createScales } from "../utils/scales.js"

/**
 * Cria um contexto de chart com escalas e dimensões
 * @param {any} entity
 * @param {string} chartType
 * @returns {ChartContext}
 */
export function createChartContext(entity, chartType) {
  const { xScale, yScale } = createScales(entity, chartType)

  return {
    xScale,
    yScale,
    dimensions: {
      width: entity.width,
      height: entity.height,
      padding: entity.padding,
    },
    entity,
  }
}

