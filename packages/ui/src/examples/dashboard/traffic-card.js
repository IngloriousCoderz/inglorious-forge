import downloadOutline from "@iconify-icons/material-symbols/download-outline"
import {
  Area,
  CartesianGrid,
  Chart,
  Tooltip,
  XAxis,
  YAxis,
} from "@inglorious/charts"
import { html } from "@inglorious/web"

import { Button } from "../../controls/button"
import { ButtonGroup } from "../../controls/button-group"
import { Icon } from "../../data-display/icon"
import { Typography } from "../../data-display/typography"
import { Progress } from "../../feedback/progress"
import { Flex } from "../../layout/flex"
import { Grid } from "../../layout/grid"
import { Card } from "../../surfaces/card"
import { trafficSeries, trafficSummary } from "./data"

export const TrafficCard = {
  render(entity, api) {
    return Card.render({
      header: Flex.render({
        justify: "between",
        align: "start",
        gap: "md",
        children: [
          html`<div>
            ${Typography.render({ variant: "h3", children: "Traffic" })}
            ${Typography.render({
              variant: "caption",
              children: "January - July 2023",
              color: "var(--iw-color-text-secondary)",
            })}
          </div>`,
          Flex.render({
            gap: "md",
            children: [
              ButtonGroup.render({
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
              Button.render({
                size: "md",
                color: "primary",
                children: Icon.render({ icon: downloadOutline }),
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
      footer: Grid.render({
        minColumnWidth: "17rem",
        gap: "lg",
        children: [
          trafficSummary.map((item) =>
            Flex.render({
              direction: "column",
              align: "center",
              gap: "sm",
              children: [
                Typography.render({
                  children: item.label,
                  color: "var(--iw-color-text-secondary)",
                }),
                Typography.render({ children: item.value, weight: 600 }),
                Progress.render({
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
    return Chart.render(
      {
        id: "traffic",
        type: "area",
        data: trafficSeries,
        width: 1400,
        height: 320,
        dataKeys: ["visits", "unique"],
        children: [
          CartesianGrid({
            stroke: "rgba(255,255,255,0.08)",
            strokeDasharray: "4 4",
          }),
          XAxis({ dataKey: "month" }),
          YAxis(),
          Area({ dataKey: "visits", stroke: "#39a2f1", strokeWidth: 3 }),
          Area({ dataKey: "unique", stroke: "#2eb85c", strokeWidth: 3 }),
          Tooltip({}),
        ],
      },
      api,
    )
  },
}
