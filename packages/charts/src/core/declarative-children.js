export function createDeclarativeChildren() {
  return {
    XAxis: (config = {}) => ({ type: "XAxis", config }),
    YAxis: (config = {}) => ({ type: "YAxis", config }),
    Line: (config = {}) => ({ type: "Line", config }),
    Area: (config = {}) => ({ type: "Area", config }),
    Bar: (config = {}) => ({ type: "Bar", config }),
    Pie: (config = {}) => ({ type: "Pie", config }),
    CartesianGrid: (config = {}) => ({ type: "CartesianGrid", config }),
    Tooltip: (config = {}) => ({ type: "Tooltip", config }),
    Brush: (config = {}) => ({ type: "Brush", config }),
    Dots: (config = {}) => ({ type: "Dots", config }),
    Legend: (config = {}) => ({ type: "Legend", config }),
  }
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
