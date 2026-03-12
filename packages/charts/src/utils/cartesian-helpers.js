/* eslint-disable no-magic-numbers */
export const DEFAULT_SERIES_INDEX = 0

export function inferSeriesDataKey(data, preferredKey) {
  if (!Array.isArray(data) || data.length === DEFAULT_SERIES_INDEX) {
    return undefined
  }
  const sample = data[DEFAULT_SERIES_INDEX]
  if (!sample || typeof sample !== "object") return undefined

  if (preferredKey && typeof sample[preferredKey] === "number") {
    return preferredKey
  }

  if (typeof sample.value === "number") return "value"
  if (typeof sample.y === "number") return "y"

  const numericKeys = Object.keys(sample).filter(
    (key) =>
      !["name", "label", "x", "date"].includes(key) &&
      typeof sample[key] === "number",
  )
  return numericKeys[DEFAULT_SERIES_INDEX]
}

export function resolveCategoryLabel(entity, index) {
  const item = entity?.data?.[index]
  return (
    item?.label ??
    item?.name ??
    item?.category ??
    item?.x ??
    item?.date ??
    String(index)
  )
}

export function createBandCenterScale(bandScale) {
  const scale = (value) => {
    const base = bandScale(value)
    if (base == null || Number.isNaN(base)) return base
    return base + bandScale.bandwidth() / 2
  }
  scale.domain = () => bandScale.domain()
  scale.range = () => bandScale.range()
  return scale
}
