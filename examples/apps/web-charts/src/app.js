import { html } from "@inglorious/web"

import { renderAreaSections } from "./sections/area.js"
import { renderBarSection } from "./sections/bar.js"
import { renderDonutSection } from "./sections/donut.js"
import { renderLineSections } from "./sections/line.js"
import { renderPieSection } from "./sections/pie.js"

export const app = {
  render(api) {
    const isPaused = (id) => Boolean(api.getEntity(id)?.realtime?.paused)
    const status = {
      isRealtimeConfigPaused: isPaused("realtimeLineChartConfig"),
      isRealtimeCompositionPaused: isPaused("realtimeLineChart"),
    }

    return html`
      <div class="app">
        <header>
          <h1>Charts Examples</h1>
          <p>Examples of Line, Area, Bar, Pie, and Donut charts</p>
        </header>

        <main>
          ${renderLineSections(api, status)} ${renderAreaSections(api)}
          ${renderBarSection(api)} ${renderPieSection(api)}
          ${renderDonutSection(api)}
        </main>
      </div>
    `
  },
}
