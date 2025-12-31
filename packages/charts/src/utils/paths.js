import { arc, area, curveLinear, curveMonotoneX, line, pie, stack } from "d3-shape"

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

/**
 * Generate stacked area path with dynamic y0 and y1 values
 * @param {any[]} data - Data points
 * @param {import('d3-scale').ScaleLinear|import('d3-scale').ScaleTime} xScale - X scale
 * @param {import('d3-scale').ScaleLinear} yScale - Y scale
 * @param {Array<[number, number]>} stackedData - Array of [y0, y1] tuples for each data point
 * @param {string} curveType - Curve type ("linear" or "monotone")
 * @returns {string} SVG path string
 */
export function generateStackedAreaPath(
  data,
  xScale,
  yScale,
  stackedData,
  curveType = "linear",
) {
  const curve = curveType === "monotone" ? curveMonotoneX : curveLinear
  const areaGenerator = area()
    .x((d) => xScale(d.x ?? d.date))
    .y0((d, i) => yScale(stackedData[i]?.[0] ?? 0))
    .y1((d, i) => yScale(stackedData[i]?.[1] ?? 0))
    .curve(curve)
  return areaGenerator(data)
}

/**
 * Calculate stacked data for multiple series
 * Returns array where each element is an array of [y0, y1] tuples for each data point
 * @param {any[]} seriesData - Array of series objects with values arrays
 * @param {Function} valueAccessor - Function to extract value from data point
 * @returns {Array<Array<[number, number]>>} Stacked data for each series
 */
export function calculateStackedData(
  seriesData,
  valueAccessor = (d) => d.y ?? d.value ?? 0,
) {
  if (!seriesData || seriesData.length === 0) {
    return []
  }

  // Get all series values
  const allSeriesValues = seriesData.map((series) =>
    Array.isArray(series.values) ? series.values : [series],
  )

  // Find maximum length to handle different series lengths
  const maxLength = Math.max(...allSeriesValues.map((s) => s.length))

  // Create data structure for d3-shape stack
  // Each entry represents one x position with values from all series
  const data = []
  for (let i = 0; i < maxLength; i++) {
    const entry = {}
    allSeriesValues.forEach((values, seriesIndex) => {
      const point = values[i]
      entry[seriesIndex] = point ? valueAccessor(point) : 0
    })
    data.push(entry)
  }

  // Create stack generator
  const keys = seriesData.map((_, i) => i)
  const stackGenerator = stack()
    .keys(keys)
    .value((d, key) => d[key] ?? 0)

  // Generate stacked data
  const stacked = stackGenerator(data)

  // Transform to array of [y0, y1] tuples for each series
  return stacked.map((series) =>
    series.map((point) => [point[0], point[1]]),
  )
}

/**
 * Calculates pie data with support for startAngle, endAngle, paddingAngle, and minAngle
 * @param {any[]} data - The data array
 * @param {Function} valueAccessor - Function to extract value from data (default: d => d.value)
 * @param {number} startAngle - Start angle in degrees (default: 0)
 * @param {number} endAngle - End angle in degrees (default: 360)
 * @param {number} paddingAngle - Padding angle between sectors in degrees (default: 0)
 * @param {number} minAngle - Minimum angle for each sector in degrees (default: 0)
 * @returns {any[]} Pie data with calculated angles
 */
export function calculatePieData(
  data,
  valueAccessor = (d) => d.value,
  startAngle = 0,
  endAngle = 360,
  paddingAngle = 0,
  minAngle = 0,
) {
  // Calculate total angle range
  const deltaAngle = endAngle - startAngle
  const absDeltaAngle = Math.abs(deltaAngle)
  const sign = Math.sign(deltaAngle) || 1

  // Count non-zero items
  const notZeroItemCount = data.filter(
    (entry) => valueAccessor(entry) !== 0,
  ).length

  // Calculate total padding angle
  const totalPaddingAngle =
    absDeltaAngle >= 360
      ? notZeroItemCount * paddingAngle
      : (notZeroItemCount - 1) * paddingAngle

  // Calculate real total angle (subtract minAngle for each non-zero item and padding)
  const minAngleRad = Math.abs(minAngle) * (Math.PI / 180)
  const realTotalAngle =
    absDeltaAngle * (Math.PI / 180) -
    notZeroItemCount * minAngleRad -
    totalPaddingAngle * (Math.PI / 180)

  // Calculate sum of values
  const sum = data.reduce((result, entry) => {
    const val = valueAccessor(entry)
    return result + (typeof val === "number" ? val : 0)
  }, 0)

  // Build pie data manually to apply minAngle correctly
  if (sum > 0) {
    const startAngleRad = (startAngle - 90) * (Math.PI / 180) // Offset by -90° (SVG starts at top)
    const paddingAngleRad = paddingAngle * (Math.PI / 180)

    let currentAngle = startAngleRad

    return data.map((entry, i) => {
      const val = valueAccessor(entry)
      const isZero = val === 0 || typeof val !== "number"

      const percent = isZero ? 0 : val / sum
      const sliceAngle = isZero
        ? 0
        : minAngleRad + percent * realTotalAngle

      const sliceStartAngle = currentAngle
      const sliceEndAngle = currentAngle + sign * sliceAngle

      // Move to next slice (add padding if not last)
      if (!isZero && i < data.length - 1) {
        currentAngle = sliceEndAngle + sign * paddingAngleRad
      } else {
        currentAngle = sliceEndAngle
      }

      return {
        data: entry,
        value: isZero ? 0 : val,
        index: i,
        startAngle: sliceStartAngle,
        endAngle: sliceEndAngle,
        padAngle: isZero ? 0 : paddingAngleRad,
      }
    })
  }

  // Fallback to d3-shape if no data or sum is 0
  const pieGenerator = pie()
    .value(valueAccessor)
    .sort(null)
    .startAngle((startAngle - 90) * (Math.PI / 180))
    .endAngle((endAngle - 90) * (Math.PI / 180))
    .padAngle(paddingAngle * (Math.PI / 180))

  return pieGenerator(data)
}

/**
 * Generates SVG arc path with support for cornerRadius
 * @param {number} innerRadius - Inner radius
 * @param {number} outerRadius - Outer radius
 * @param {number} startAngle - Start angle in radians
 * @param {number} endAngle - End angle in radians
 * @param {number} cornerRadius - Corner radius for rounded edges (default: 0)
 * @returns {string} SVG path string
 */
export function generateArcPath(
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  cornerRadius = 0,
) {
  return arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .cornerRadius(cornerRadius)()
}
