/* eslint-disable no-magic-numbers */

const DEFAULT_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
]

const EXTENDED_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
  "#14b8a6",
  "#a855f7",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#64748b",
  "#f43f5e",
  "#8b5cf6",
  "#0ea5e9",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
]

/**
 * @param {number} count
 * @param {string[]} [customColors]
 * @returns {string[]}
 */
export function generateColors(count, customColors = null) {
  const baseColors = customColors || EXTENDED_COLORS

  if (count <= baseColors.length) {
    return baseColors.slice(0, count)
  }

  const colors = [...baseColors]
  const needed = count - baseColors.length

  for (let i = 0; i < needed; i++) {
    const baseIndex = i % baseColors.length
    const baseColor = baseColors[baseIndex]
    const variation = Math.floor(i / baseColors.length) + 1

    const hex = baseColor.replace("#", "")
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    const factor = 0.7 + (variation * 0.1)
    const newR = Math.min(255, Math.floor(r * factor))
    const newG = Math.min(255, Math.floor(g * factor))
    const newB = Math.min(255, Math.floor(b * factor))

    colors.push(
      `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`,
    )
  }

  return colors
}

/**
 * @returns {string[]}
 */
export function getDefaultColors() {
  return [...DEFAULT_COLORS]
}

/**
 * @returns {string[]}
 */
export function getExtendedColors() {
  return [...EXTENDED_COLORS]
}

