import { chart } from "@inglorious/charts"
import { html } from "@inglorious/web"

import { divider } from "../../data-display/divider"
import { materialIcon } from "../../data-display/material-icon"
import { typography } from "../../data-display/typography"
import { grid } from "../../layout/grid"
import { card } from "../../surfaces/card"

export const socialCard = {
  render(entity, api) {
    return card.render({
      className: "iw-dashboard-social-card",
      header: html`
        <div class="iw-dashboard-social-cap ${entity.capClass}">
          ${materialIcon.render({ name: entity.icon, size: "lg" })}
          <div class="iw-dashboard-social-chart">
            ${this.renderAreaSpark(entity, api)}
          </div>
        </div>
      `,
      body: grid.render({
        columns: "1fr auto 1fr",
        gap: "md",
        className: "iw-dashboard-social-stats",
        children: [
          html`<div>
            ${typography.render({ variant: "h3", children: entity.top })}
            ${typography.render({
              variant: "caption",
              children: entity.topLabel,
              color: "var(--iw-color-text-secondary)",
            })}
          </div>`,
          divider.render({ orientation: "vertical" }),
          html`<div>
            ${typography.render({ variant: "h3", children: entity.bottom })}
            ${typography.render({
              variant: "caption",
              children: entity.bottomLabel,
              color: "var(--iw-color-text-secondary)",
            })}
          </div>`,
        ],
      }),
    })
  },

  renderAreaSpark(entity, api) {
    return chart.renderAreaChart(
      {
        type: "area",
        data: entity.data.map((value, index) => ({ name: `${index}`, value })),
      },
      {
        width: 640,
        height: 200,
        padding: 0,
        dataKeys: ["value"],
        children: [
          chart.Area({
            dataKey: "value",
            stroke: "rgba(255,255,255,0.9)",
            fill: "rgba(255,255,255,0.35)",
            strokeWidth: 2,
          }),
        ],
      },
      api,
    )
  },
}
