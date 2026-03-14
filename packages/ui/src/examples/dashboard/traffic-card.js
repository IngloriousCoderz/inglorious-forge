import { chart } from "@inglorious/charts"
import { html } from "@inglorious/web"

import { button } from "../../controls/button"
import { buttonGroup } from "../../controls/button-group"
import { materialIcon } from "../../data-display/material-icon"
import { typography } from "../../data-display/typography"
import { progress } from "../../feedback/progress"
import { flex } from "../../layout/flex"
import { grid } from "../../layout/grid"
import { card } from "../../surfaces/card"
import { trafficSeries, trafficSummary } from "./data"

export const trafficCard = {
  render(entity, api) {
    return card.render({
      header: flex.render({
        justify: "between",
        align: "start",
        gap: "md",
        children: [
          html`<div>
            ${typography.render({ variant: "h3", children: "Traffic" })}
            ${typography.render({
              variant: "caption",
              children: "January - July 2023",
              color: "var(--iw-color-text-secondary)",
            })}
          </div>`,
          flex.render({
            gap: "md",
            children: [
              buttonGroup.render({
                value: "month",
                variant: "outline",
                color: "secondary",
                size: "md",
                buttons: [
                  { id: "day", label: "Day" },
                  { id: "month", label: "Month" },
                  { id: "year", label: "Year" },
                ],
              }),
              button.render({
                size: "md",
                color: "primary",
                children: materialIcon.render({ name: "download" }),
                "aria-label": "Download report",
              }),
            ],
          }),
        ],
      }),
      body: html`
        <div class="iw-dashboard-traffic-chart">
          ${this.renderTrafficChart(entity, api)}
        </div>
      `,
      footer: grid.render({
        minColumnWidth: "17rem",
        gap: "lg",
        children: [
          trafficSummary.map((item) =>
            flex.render({
              direction: "column",
              align: "center",
              gap: "sm",
              children: [
                typography.render({
                  children: item.label,
                  color: "var(--iw-color-text-secondary)",
                }),
                typography.render({ children: item.value, weight: 600 }),
                progress.render({
                  value: item.progress,
                  className: `iw-progress-${item.color}`,
                }),
              ],
            }),
          ),
        ],
      }),
    })
  },

  renderTrafficChart(_, api) {
    return chart.renderAreaChart(
      { id: "traffic", type: "area", data: trafficSeries },
      {
        width: 1400,
        height: 320,
        dataKeys: ["visits", "unique"],
        children: [
          chart.CartesianGrid({
            stroke: "rgba(255,255,255,0.08)",
            strokeDasharray: "4 4",
          }),
          chart.XAxis({ dataKey: "month" }),
          chart.YAxis({ width: "auto" }),
          chart.Area({ dataKey: "visits", stroke: "#39a2f1", strokeWidth: 3 }),
          chart.Area({ dataKey: "unique", stroke: "#2eb85c", strokeWidth: 3 }),
          chart.Tooltip({}),
        ],
      },
      api,
    )
  },
}
