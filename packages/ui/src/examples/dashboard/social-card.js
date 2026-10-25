import { Area, Chart } from "@inglorious/charts"
import { html } from "@inglorious/web"

import { Divider } from "../../data-display/divider/index.js"
import { Icon } from "../../data-display/icon/index.js"
import { Typography } from "../../data-display/typography/index.js"
import { Grid } from "../../layout/grid/index.js"
import { Card } from "../../surfaces/card/index.js"

export const SocialCard = {
  render(entity, api) {
    return Card.render({
      className: "iw-dashboard-social-card",
      headerPadding: "none",
      header: html`
        <div class="iw-dashboard-social-cap ${entity.capClass}">
          ${Icon.render({ icon: entity.icon, size: "lg" })}
          <div class="iw-dashboard-social-chart">
            ${this.renderAreaSpark(entity, api)}
          </div>
        </div>
      `,
      body: Grid.render({
        columns: "1fr auto 1fr",
        gap: "md",
        className: "iw-dashboard-social-stats",
        children: [
          html`<div>
            ${Typography.render({ variant: "h3", children: entity.top })}
            ${Typography.render({
              variant: "caption",
              children: entity.topLabel,
              color: "var(--iw-color-text-secondary)",
            })}
          </div>`,
          Divider.render({ orientation: "vertical" }),
          html`<div>
            ${Typography.render({ variant: "h3", children: entity.bottom })}
            ${Typography.render({
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
    return Chart.render(
      {
        data: entity.data.map((value, index) => ({ name: `${index}`, value })),
        width: 640,
        height: 200,
        padding: 0,
        children: [
          Area({
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
