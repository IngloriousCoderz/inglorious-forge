/**
 * @param {"text" | "text-muted" | "axis" | "grid" | "surface" | "border" | "accent"} role
 * @param {string} fallback - The color without a theme.
 * @returns {string} A CSS color.
 */
export function themeColor(role, fallback) {
  return `var(--iw-chart-${role}, ${fallback})`
}
