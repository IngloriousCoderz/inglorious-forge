import { registerChartType } from "./registry.js"
import { bar } from "./types/bar.js"
import { donut } from "./types/donut.js"
import { line } from "./types/line.js"
import { pie } from "./types/pie.js"

registerChartType("line", line)
registerChartType("bar", bar)
registerChartType("pie", pie)
registerChartType("donut", donut)

export * from "./logic.js"
export * from "./rendering.js"
export { bar } from "./types/bar.js"
export { donut } from "./types/donut.js"
export { line } from "./types/line.js"
export { pie } from "./types/pie.js"
