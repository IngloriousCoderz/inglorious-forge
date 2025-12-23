import { arc, area, curveLinear, curveMonotoneX, line, pie } from "d3-shape"

export function generateLinePath(data, xScale, yScale, curveType = "linear") {
  const curve = curveType === "monotone" ? curveMonotoneX : curveLinear
  const lineGenerator = line()
    .x((d) => xScale(d.x ?? d.date))
    .y((d) => yScale(d.y ?? d.value))
    .curve(curve)
  return lineGenerator(data)
}

/* eslint-disable no-magic-numbers */
export function generateAreaPath(
  data,
  xScale,
  yScale,
  baseValue = 0,
  curveType = "linear",
) {
  const curve = curveType === "monotone" ? curveMonotoneX : curveLinear
  const areaGenerator = area()
    .x((d) => xScale(d.x ?? d.date))
    .y0(() => yScale(baseValue))
    .y1((d) => yScale(d.y ?? d.value))
    .curve(curve)
  return areaGenerator(data)
}

export function calculatePieData(data, valueAccessor = (d) => d.value) {
  return pie().value(valueAccessor).sort(null)(data)
}

export function generateArcPath(
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
) {
  return arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle)()
}
