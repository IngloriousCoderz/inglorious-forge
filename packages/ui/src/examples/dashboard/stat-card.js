import { Chart } from "@inglorious/charts"
import { html } from "@inglorious/web"

import { Button } from "../../controls/button"
import { MaterialIcon } from "../../data-display/material-icon"
import { Typography } from "../../data-display/typography"
import { Card } from "../../surfaces/card"

export const StatCard = {
  render(entity, api) {
    return Card.render({
      className: `iw-dashboard-stat ${entity.className}`,
      bodyPadding: "none",
      body: html`
        <div class="iw-dashboard-stat-container">
          <div class="iw-dashboard-stat-top">
            <div>
              <div class="iw-dashboard-stat-value">
                ${Typography.render({ variant: "h2", children: entity.value })}
                <span
                  >(${Typography.render({
                    variant: "caption",
                    children: html`<span class="iw-dashboard-stat-change">
                      ${entity.change}
                      ${MaterialIcon.render({
                        name: entity.direction,
                        size: "sm",
                      })}
                    </span>`,
                  })})</span
                >
              </div>
              ${Typography.render({ children: entity.label })}
            </div>
          </div>
          <div class="iw-dashboard-stat-chart">
            ${this.renderStatChart(entity, api)}
          </div>
          ${Button.render({
            variant: "ghost",
            shape: "square",
            className: "iw-dashboard-stat-more",
            children: MaterialIcon.render({ name: "more_vert", size: "lg" }),
            "aria-label": "More options",
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

    const base = {
      data,
      width: 400,
      height: 80,
      padding: { top: 0, right: 16, bottom: -8, left: 16 },
      dataKeys: ["value"],
    }

    const children = []

    if (entity.chartType === "area") {
      children.push(
        Chart.Area({ dataKey: "value", fill: "rgba(255,255,255,0.3)" }),
      )
    } else if (entity.chartType === "bar") {
      children.push(
        Chart.Bar({ dataKey: "value", fill: "rgba(255,255,255,0.3)" }),
      )
    } else if (entity.chartType === "line") {
      children.push(Chart.Line({ dataKey: "value", stroke: "white" }))
    }

    if (entity.hasDots) {
      children.push(
        Chart.Dots({ dataKey: "value", stroke: "white", fill: "#39a2f1" }),
      )
    }

    return Chart.render({ ...base, children }, api)
  },
}
