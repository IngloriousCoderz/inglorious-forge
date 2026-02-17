/* eslint-disable no-magic-numbers */
const PRICE_BUMP = 15

/**
 * @typedef {Record<string, any> & {
 *   tickCount?: number
 *   rowIdField?: string
 *   rowData: Record<string, any>[]
 * }} GridDemoEntity
 */

/**
 * Initializes demo-specific counters.
 * @param {GridDemoEntity} entity
 */
export function create(entity) {
  entity.tickCount ??= 0
}

/**
 * Increments the render tick counter for the demo UI.
 * @param {GridDemoEntity} entity
 */
export function tick(entity) {
  entity.tickCount += 1
}

/**
 * Shuffles rows to showcase incremental row updates.
 * @param {GridDemoEntity} entity
 */
export function shuffleRows(entity) {
  const nextRows = [...entity.rowData]
  for (let i = nextRows.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = nextRows[i]
    nextRows[i] = nextRows[j]
    nextRows[j] = current
  }
  entity.rowData = nextRows
}

/**
 * Applies a simple price/rating mutation used by demo controls.
 * @param {GridDemoEntity} entity
 */
export function bumpPrices(entity) {
  entity.rowData = entity.rowData.map((row) => ({
    ...row,
    price: typeof row.price === "number" ? row.price + PRICE_BUMP : row.price,
    rating:
      typeof row.rating === "number"
        ? Number((row.rating + Math.random()).toFixed(1))
        : row.rating,
  }))
}

/**
 * Appends a synthetic row based on the last row shape.
 * @param {GridDemoEntity} entity
 */
export function addRow(entity) {
  const idField = entity.rowIdField || "id"
  const nextId = entity.rowData.length + 1
  const previousRow = entity.rowData.at(-1) || {}
  const nextRow = {}

  const entries = Object.entries(previousRow)
  if (!entries.length) {
    nextRow[idField] = nextId
  }

  for (const [key, value] of entries) {
    if (key === idField) {
      nextRow[key] = nextId
      continue
    }

    if (typeof value === "number") {
      const randomFactor = 0.9 + Math.random() * 0.2
      nextRow[key] = Number((value * randomFactor).toFixed(2))
      continue
    }

    if (typeof value === "string") {
      nextRow[key] = `${value} ${nextId}`
      continue
    }

    nextRow[key] = value
  }

  if (!(idField in nextRow)) {
    nextRow[idField] = nextId
  }

  entity.rowData = [...entity.rowData, nextRow]
}
