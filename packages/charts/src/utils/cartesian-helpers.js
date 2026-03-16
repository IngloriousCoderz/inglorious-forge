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

/**
 * Resolves the most appropriate entity from render context.
 * Prefers context-specific entity, then fullEntity (for brush / overlays),
 * and finally falls back to the original entity argument.
 *
 * @param {Record<string, any>} ctx
 * @param {import("../types/charts").ChartEntity} entity
 * @returns {import("../types/charts").ChartEntity | undefined}
 */
export function getResolvedEntity(ctx, entity) {
  if (!ctx) return entity
  if (ctx.entity) return ctx.entity
  if (ctx.fullEntity) return ctx.fullEntity
  return entity
}
