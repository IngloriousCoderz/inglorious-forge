import { chart } from "@inglorious/charts"
import { html } from "@inglorious/web"

import { button } from "../../controls/button"
import { materialIcon } from "../../data-display/material-icon"
import { typography } from "../../data-display/typography"
import { card } from "../../surfaces/card"

export const statCard = {
  render(entity, api) {
    return card.render({
      className: `iw-dashboard-stat ${entity.className}`,
      body: html`
        <div class="iw-dashboard-stat-container">
          <div class="iw-dashboard-stat-top">
            <div>
              <div class="iw-dashboard-stat-value">
                ${typography.render({ variant: "h2", children: entity.value })}
                ${typography.render({
                  variant: "caption",
                  children: html`${entity.change}
                  ${materialIcon.render({ name: entity.direction, size: "sm" })}`,
                })}
              </div>
              ${typography.render({ children: entity.label })}
            </div>
          </div>
          <div class="iw-dashboard-stat-chart">
            ${this.renderStatChart(entity, api)}
          </div>
          ${button.render({
            variant: "ghost",
            shape: "square",
            className: "iw-dashboard-stat-more",
            children: materialIcon.render({ name: "more_vert", size: "lg" }),
          })}
        </div>
      `,
    })
  },

  renderStatChart(entity, api) {
    const data = entity.data.map((value, index) => ({
      name: `${index}`,
      value,
    }))

    const chartConfig = {
      id: entity.id,
      type: entity.chartType,
      data,
      width: 400,
      height: 80,
      padding: { top: 0, right: 16, bottom: -16, left: 16 },
    }

    const children = []
    if (entity.hasDots) {
      children.push(
        chart.Dots({ dataKey: "value", stroke: "white", fill: "#39a2f1" }),
      )
    }

    if (entity.chartType === "area") {
      children.push(chart.Area({ fill: "rgba(255,255,255,0.3)" }))
      return chart.renderAreaChart(chartConfig, { children }, api)
    } else if (entity.chartType === "bar") {
      children.push(chart.Bar({ fill: "rgba(255,255,255,0.3)" }))
      return chart.renderBarChart(chartConfig, { children }, api)
    } else {
      children.push(chart.Line({ stroke: "white" }))
      return chart.renderLineChart(chartConfig, { children }, api)
    }
  },
}
