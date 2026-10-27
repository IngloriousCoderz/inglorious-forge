export const DEFAULT_HEIGHT = 300

export const MISSING_VALUE = 0

/** A legend is only worth its room when there is more than one series. */
export const SINGLE_SERIES = 1

/**
 * One row per label with a field per series, the shape the chart engine
 * reads: OpenUI's charts come column by column, like its tables.
 */
export function toRows(labels, lines) {
  return (labels ?? []).map((label, index) => ({
    label,
    ...Object.fromEntries(
      lines.map((line) => [
        line.category,
        line.values?.[index] ?? MISSING_VALUE,
      ]),
    ),
  }))
}

/** A dataset or point, written as a component or as a plain object. */
export function unwrap(value) {
  return value?.type === "element" ? value.props : value
}
