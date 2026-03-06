import { CHART_TYPE_METHODS } from "./chart-type-methods.js"
import {
  DECLARATIVE_CHILD_NAMES,
} from "./declarative-children.js"
import { renderEmptyTemplate } from "./render-dispatch.js"

export function getEmptyChartInstance() {
  const chartMethods = buildNoopChartMethods()
  const declarativeMethods = buildNoopDeclarativeMethods()
  const compatibilityMethods = buildNoopCompatibilityMethods()

  return {
    Dots: renderEmptyTemplate,
    Legend: renderEmptyTemplate,
    ...chartMethods,
    ...compatibilityMethods,
    ...declarativeMethods,
  }
}

function buildNoopChartMethods() {
  return Object.fromEntries(
    CHART_TYPE_METHODS.flatMap(({ suffix }) => [
      [`${suffix}Chart`, renderEmptyTemplate],
      [`render${suffix}Chart`, renderEmptyTemplate],
    ]),
  )
}

function buildNoopDeclarativeMethods() {
  return Object.fromEntries(
    DECLARATIVE_CHILD_NAMES.map((methodName) => [methodName, renderEmptyTemplate]),
  )
}

function buildNoopCompatibilityMethods() {
  return {
    renderCartesianGrid: renderEmptyTemplate,
    renderXAxis: renderEmptyTemplate,
    renderYAxis: renderEmptyTemplate,
    renderLine: renderEmptyTemplate,
    renderArea: renderEmptyTemplate,
    renderBar: renderEmptyTemplate,
    renderPie: renderEmptyTemplate,
    renderTooltip: renderEmptyTemplate,
    renderBrush: renderEmptyTemplate,
    renderDots: renderEmptyTemplate,
    renderLegend: renderEmptyTemplate,
  }
}
