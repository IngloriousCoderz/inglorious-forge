export const DECLARATIVE_CHILD_NAMES = [
  "XAxis",
  "YAxis",
  "Line",
  "Area",
  "Bar",
  "Pie",
  "CartesianGrid",
  "Tooltip",
  "Brush",
  "Dots",
  "Legend",
]

export function createDeclarativeChildren() {
  return Object.fromEntries(
    DECLARATIVE_CHILD_NAMES.map((name) => [name, buildDeclarativeChild(name)]),
  )
}

export function createInstanceRenderAliases(declarativeChildren) {
  return {
    renderCartesianGrid: declarativeChildren.CartesianGrid,
    renderXAxis: declarativeChildren.XAxis,
    renderYAxis: declarativeChildren.YAxis,
    renderLine: declarativeChildren.Line,
    renderArea: declarativeChildren.Area,
    renderBar: declarativeChildren.Bar,
    renderPie: declarativeChildren.Pie,
    renderTooltip: declarativeChildren.Tooltip,
    renderBrush: declarativeChildren.Brush,
    renderDots: declarativeChildren.Dots,
    renderLegend: declarativeChildren.Legend,
  }
}

export function attachInstancePascalAliases(instance) {
  instance.Dots = instance.renderDots
  instance.Legend = instance.renderLegend
  return instance
}

function buildDeclarativeChild(typeName) {
  return (config = {}) => ({ type: typeName, config })
}
