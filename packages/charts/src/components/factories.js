import { COMPONENT_TYPES } from "../core/constants.js"

export function CartesianGrid(props = {}) {
  return { type: COMPONENT_TYPES.CARTESIAN_GRID, props }
}

export function XAxis(props = {}) {
  return { type: COMPONENT_TYPES.X_AXIS, props }
}

export function YAxis(props = {}) {
  return { type: COMPONENT_TYPES.Y_AXIS, props }
}

export function Line(props = {}) {
  return { type: COMPONENT_TYPES.LINE, props }
}

export function Area(props = {}) {
  return { type: COMPONENT_TYPES.AREA, props }
}

export function Bar(props = {}) {
  return { type: COMPONENT_TYPES.BAR, props }
}

export function Pie(props = {}) {
  return { type: COMPONENT_TYPES.PIE, props }
}

export function Dots(props = {}) {
  return { type: COMPONENT_TYPES.DOTS, props }
}

export function Tooltip(props = {}) {
  return { type: COMPONENT_TYPES.TOOLTIP, props }
}

export function Legend(props = {}) {
  return { type: COMPONENT_TYPES.LEGEND, props }
}

export function Brush(props = {}) {
  return { type: COMPONENT_TYPES.BRUSH, props }
}
