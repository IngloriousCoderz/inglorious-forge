/* eslint-disable no-magic-numbers */

export function createChartEntity(entity, requestedKeys) {
  const colors = resolveColors(entity.colors)

  if (entity.type === "pie" || entity.type === "donut") {
    const pieData = createPieData(entity.data)

    return {
      ...entity,
      colors,
      data: pieData,
      fullData: pieData,
      dataKey: entity.dataKey || "value",
      nameKey: entity.nameKey || "label",
      seriesKeys: [],
      xKey: null,
      padding: createPadding(entity.padding, entity.width, entity.height),
      tooltipEnabled: entity.showTooltip === true,
    }
  }

  const cartesianData = createCartesianData(entity.data, requestedKeys)

  return {
    ...entity,
    colors,
    data: cartesianData.rows,
    fullData: cartesianData.rows,
    seriesKeys: cartesianData.seriesKeys,
    xKey: cartesianData.xKey,
    padding: createPadding(entity.padding, entity.width, entity.height),
    tooltipEnabled: entity.showTooltip === true,
  }
}

export function getDataKeys(components, configDataKeys) {
  const keys = new Set(Array.isArray(configDataKeys) ? configDataKeys : [])

  components.forEach((component) => {
    const dataKey = component?.props?.dataKey
    if (dataKey) keys.add(dataKey)
  })

  return [...keys]
}

function createPieData(rawData) {
  if (!Array.isArray(rawData)) return []

  return rawData.map((row, index) => ({
    label: row?.label ?? row?.name ?? `Slice ${index + 1}`,
    value: Number.isFinite(row?.value) ? row.value : 0,
    color: row?.color,
  }))
}

function createCartesianData(rawData, requestedKeys) {
  if (!Array.isArray(rawData) || rawData.length === 0) {
    return { rows: [], xKey: "name", seriesKeys: requestedKeys }
  }

  if (Array.isArray(rawData[0]?.values)) {
    return normalizeLongSeriesData(rawData)
  }

  if (hasPointShape(rawData)) {
    return normalizePointSeriesData(rawData)
  }

  return normalizeWideSeriesData(rawData, requestedKeys)
}

function normalizeLongSeriesData(seriesList) {
  const rowsByIndex = []
  const seriesKeys = []

  seriesList.forEach((series) => {
    const dataKey =
      series?.dataKey || series?.name || `series-${seriesKeys.length + 1}`
    seriesKeys.push(dataKey)

    series.values.forEach((point, index) => {
      rowsByIndex[index] ??= {}
      const row = rowsByIndex[index]
      row.name ??=
        point?.name ?? point?.label ?? point?.date ?? `${point?.x ?? index}`
      row.x ??= point?.x ?? index
      row.date ??= point?.date
      row[dataKey] = resolveNumericValue(point)
    })
  })

  return { rows: rowsByIndex, xKey: "name", seriesKeys }
}

function normalizePointSeriesData(points) {
  const rows = points.map((point, index) => ({
    ...point,
    name: point?.name ?? point?.label ?? point?.date ?? `${point?.x ?? index}`,
    value: resolveNumericValue(point),
  }))

  return { rows, xKey: "name", seriesKeys: ["value"] }
}

function normalizeWideSeriesData(rows, requestedKeys) {
  const xKey = resolveXKey(rows)
  const seriesKeys =
    requestedKeys.length > 0 ? requestedKeys : inferSeriesKeys(rows, xKey)
  const normalizedRows = rows.map((row, index) => ({
    ...row,
    [xKey]: row?.[xKey] ?? row?.name ?? row?.label ?? row?.date ?? `${index}`,
  }))

  return { rows: normalizedRows, xKey, seriesKeys }
}

function resolveXKey(rows) {
  const X_VALUE_KEYS = ["name", "label", "date", "x"]
  const firstRow = rows[0] || {}

  for (const key of X_VALUE_KEYS) {
    if (firstRow[key] != null) return key
  }

  return "name"
}

function inferSeriesKeys(rows, xKey) {
  const NON_SERIES_KEYS = new Set([
    "id",
    "type",
    "name",
    "label",
    "date",
    "x",
    "color",
  ])
  const keys = new Set()

  rows.forEach((row) => {
    Object.keys(row || {}).forEach((key) => {
      if (key === xKey || NON_SERIES_KEYS.has(key)) return
      if (Number.isFinite(row[key])) keys.add(key)
    })
  })

  return keys.size > 0 ? [...keys] : ["value"]
}

function resolveColors(colors) {
  const PALETTE = [
    "#3b82f6",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#ec4899",
    "#64748b",
  ]
  return Array.isArray(colors) && colors.length > 0 ? colors : [...PALETTE]
}

function createPadding(padding, width, height) {
  const base = {
    top: Math.max(20, height * 0.05),
    right: Math.max(20, width * 0.05),
    bottom: Math.max(40, height * 0.1),
    left: Math.max(50, width * 0.1),
  }

  if (padding == null) return base

  if (typeof padding === "number") {
    return { top: padding, right: padding, bottom: padding, left: padding }
  }

  return {
    top: padding.top ?? base.top,
    right: padding.right ?? base.right,
    bottom: padding.bottom ?? base.bottom,
    left: padding.left ?? base.left,
  }
}

function resolveNumericValue(point) {
  if (Number.isFinite(point?.value)) return point.value
  if (Number.isFinite(point?.y)) return point.y
  if (Number.isFinite(point)) return point
  return 0
}

function hasPointShape(data) {
  return data.every(
    (point) =>
      Number.isFinite(point?.value) ||
      Number.isFinite(point?.y) ||
      Number.isFinite(point),
  )
}
