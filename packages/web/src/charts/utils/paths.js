import { arc, curveLinear, curveMonotoneX, line, pie } from "d3-shape"

export function generateLinePath(data, xScale, yScale, curveType = "linear") {
  const curve = curveType === "monotone" ? curveMonotoneX : curveLinear
  const lineGenerator = line()
    .x((d) => xScale(d.x ?? d.date))
    .y((d) => yScale(d.y ?? d.value))
    .curve(curve)
  return lineGenerator(data)
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
