// The colors charts draw with besides their series: text, axes, grid, the
// brush and the tooltip. Each is a CSS custom property, so a theme can restyle
// charts (see theme.css), falling back to the default look when none does.
// They go in `style`, because SVG presentation attributes do not resolve
// custom properties.

/**
 * @param {"text" | "text-muted" | "axis" | "grid" | "surface" | "border" | "accent"} role
 * @param {string} fallback - The color without a theme.
 * @returns {string} A CSS color.
 */
export function themeColor(role, fallback) {
  return `var(--iw-chart-${role}, ${fallback})`
}
