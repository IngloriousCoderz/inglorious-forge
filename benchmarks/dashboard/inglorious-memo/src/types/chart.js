import { html, repeat } from "@inglorious/web"

import { chartData } from "@/store/select"

const VALUE_TO_PX = 100
const VALUE_TO_HSL = 120

export const chart = {
  render(entity, api) {
    const { values, max, avg } = api.select(chartData(entity))

    return html`
      <div class="chart">
        <h3>${entity.title}</h3>
        <div class="chart-bars">
          ${repeat(
            values,
            (_, i) => i,
            (value) => html`
              <div
                class="bar"
                style="
                height: ${(value / max) * VALUE_TO_PX}px;
                background-color: hsl(${(value / max) *
                VALUE_TO_HSL}, 70%, 50%);
              "
              ></div>
            `,
          )}
        </div>
        <div class="chart-info">Avg: ${avg}</div>
      </div>
    `
  },
}
