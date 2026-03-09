import { chart } from "@inglorious/charts"
import { classMap, html } from "@inglorious/web"

import { button } from "../../controls/button/index.js"
import { buttonGroup } from "../../controls/button-group/index.js"
import { avatar } from "../../data-display/avatar/index.js"
import { badge } from "../../data-display/badge/index.js"
import { divider } from "../../data-display/divider/index.js"
import { list } from "../../data-display/list/index.js"
import { materialIcon } from "../../data-display/material-icon/index.js"
import { table } from "../../data-display/table/index.js"
import { typography } from "../../data-display/typography/index.js"
import { progress } from "../../feedback/progress/index.js"
import { flex } from "../../layout/flex/index.js"
import { grid } from "../../layout/grid/index.js"
import { breadcrumbs } from "../../navigation/breadcrumbs/template.js"
import { drawer } from "../../navigation/drawer/index.js"
import { appBar } from "../../surfaces/app-bar/index.js"
import { card } from "../../surfaces/card/template.js"
import {
  clientBars,
  socialCards,
  sourceBars,
  statCards,
  trafficSeries,
  trafficSummary,
  userRows,
} from "./data.js"

export const dashboard = {
  drawerToggle(entity) {
    entity.isDrawerOpen = !entity.isDrawerOpen
    entity.isDrawerHidden = !entity.isDrawerHidden
  },

  drawerCollapseToggle(entity) {
    entity.isDrawerCollapsed = !entity.isDrawerCollapsed
  },

  render(entity, api) {
    return html`
      <div
        class=${classMap({
          "iw-dashboard": true,
          "iw-dashboard-drawer-hidden": entity.isDrawerHidden,
          "iw-dashboard-drawer-collapsed": entity.isDrawerCollapsed,
        })}
      >
        ${drawer.render({
          isOpen: entity.isDrawerOpen,
          isHidden: entity.isDrawerHidden,
          isCollapsed: entity.isDrawerCollapsed,
          anchor: "left",
          onClose: () => api.notify(`#${entity.id}:drawerToggle`),
          onCollapseToggle: () =>
            api.notify(`#${entity.id}:drawerCollapseToggle`),
          title: html`<div class="iw-dashboard-brand">
            ${avatar.render({ src: "/transparent.png", shape: "square" })}
            <span class="iw-dashboard-brand-title">Inglorious UI</span>
          </div>`,
          children: html`
            ${list.render({
              inset: true,
              items: [
                {
                  primary: "Dashboard",
                  icon: materialIcon.render({ name: "speed", size: "lg" }),
                  selected: true,
                  action: badge.render({ color: "info", children: "NEW" }),
                },
                {
                  primary: "Colors",
                  icon: materialIcon.render({ name: "palette", size: "lg" }),
                },
                {
                  primary: "Typography",
                  icon: materialIcon.render({
                    name: "text_fields",
                    size: "lg",
                  }),
                },
                {
                  primary: "Base",
                  icon: materialIcon.render({ name: "extension", size: "lg" }),
                  expanded: true,
                  children: [
                    { primary: "Accordion" },
                    { primary: "Cards" },
                    { primary: "Pagination" },
                    { primary: "Tables" },
                  ],
                },
                {
                  primary: "Buttons",
                  icon: materialIcon.render({ name: "ads_click", size: "lg" }),
                  children: [
                    { primary: "Buttons" },
                    { primary: "Button Group" },
                  ],
                },
                {
                  primary: "Charts",
                  icon: materialIcon.render({ name: "pie_chart", size: "lg" }),
                },
                {
                  primary: "Forms",
                  icon: materialIcon.render({ name: "fact_check", size: "lg" }),
                  children: [
                    { primary: "Checks and radios" },
                    { primary: "Select" },
                  ],
                },
              ],
            })}
          `,
        })}

        <div class="iw-dashboard-main">
          ${this.renderHeader(entity, api)}
          ${flex.render({
            direction: "column",
            gap: "md",
            className: "iw-dashboard-content",
            children: [
              grid.render({
                minColumnWidth: "20rem",
                gap: "md",
                children: statCards.map((card) =>
                  this.renderStatCard(entity, card, api),
                ),
              }),
              this.renderTrafficCard(entity, api),
              grid.render({
                columns: 3,
                gap: "md",
                children: socialCards.map((card) =>
                  this.renderSocialCard(entity, card, api),
                ),
              }),
              this.renderTrafficSalesCard(),
            ],
          })}

          <footer class="iw-dashboard-footer">
            <div>Admin dashboard example © 2026</div>
            <div>Built with Inglorious UI primitives and charts</div>
          </footer>
        </div>
      </div>
    `
  },

  renderHeader(entity, api) {
    return html`
      <div class="iw-dashboard-header">
        ${appBar.render({
          position: "static",
          elevated: false,
          children: html`
            <div class="iw-dashboard-header-row">
              ${button.render({
                variant: "ghost",
                shape: "square",
                children: materialIcon.render({ name: "menu", size: "lg" }),
                onClick: () => api.notify(`#${entity.id}:drawerToggle`),
              })}
              <div class="iw-dashboard-header-nav">
                ${button.render({
                  variant: "ghost",
                  children: "Dashboard",
                })}
                ${button.render({
                  variant: "ghost",
                  children: "Users",
                })}
                ${button.render({
                  variant: "ghost",
                  children: "Settings",
                })}
              </div>
              <div class="iw-dashboard-header-actions">
                ${button.render({
                  variant: "ghost",
                  shape: "square",
                  children: materialIcon.render({
                    name: "notifications",
                    size: "lg",
                  }),
                })}
                ${button.render({
                  variant: "ghost",
                  shape: "square",
                  children: materialIcon.render({
                    name: "format_list_bulleted",
                  }),
                })}
                ${button.render({
                  variant: "ghost",
                  shape: "square",
                  children: materialIcon.render({ name: "mail", size: "lg" }),
                })}
                ${divider.render({ orientation: "vertical" })}
                ${button.render({
                  variant: "ghost",
                  shape: "square",
                  children: materialIcon.render({
                    name: "contrast",
                    size: "lg",
                  }),
                })}
                ${divider.render({ orientation: "vertical" })}
                ${avatar.render({ src: "/antony.jpeg" })}
              </div>
            </div>
          `,
        })}
        <div class="iw-dashboard-header-row iw-dashboard-breadcrumbs">
          ${breadcrumbs.render({
            items: [{ label: "Home", href: "#" }, { label: "Dashboard" }],
          })}
        </div>
      </div>
    `
  },

  renderStatCard(entity, item, api) {
    return card.render({
      className: `iw-dashboard-stat ${item.className}`,
      body: html`
        <div class="iw-dashboard-stat-top">
          <div>
            <div class="iw-dashboard-stat-value">
              ${typography.render({ variant: "h2", children: item.value })}
              ${typography.render({
                variant: "caption",
                children: html`${item.change}
                ${materialIcon.render({ name: item.direction, size: "sm" })}`,
              })}
            </div>
            ${typography.render({ children: item.label })}
          </div>
          ${button.render({
            variant: "ghost",
            shape: "square",
            children: materialIcon.render({ name: "more_vert", size: "lg" }),
          })}
        </div>
        <div class="iw-dashboard-stat-chart">
          ${this.renderStatChart(entity, item, api)}
        </div>
      `,
    })
  },

  renderStatChart(_, item, api) {
    const data = item.data.map((value, index) => ({
      name: `${index}`,
      value,
    }))

    const chartConfig = {
      type: item.chartType,
      data,
      width: 400,
      height: 80,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    }

    const children = []
    if (item.hasDots) {
      children.push(chart.Dots({ dataKey: "value", fill: "white" }))
    }

    if (item.chartType === "area") {
      children.push(
        chart.Area({ dataKey: "value", fill: "rgba(255,255,255,0.3)" }),
      )
      return chart.renderAreaChart(
        chartConfig,
        { children, config: { dataKeys: ["value"] } },
        api,
      )
    } else if (item.chartType === "bar") {
      children.push(
        chart.Bar({ dataKey: "value", fill: "rgba(255,255,255,0.5)" }),
      )
      return chart.renderBarChart(
        chartConfig,
        { children, config: { dataKeys: ["value"] } },
        api,
      )
    } else {
      children.push(chart.Line({ dataKey: "value", stroke: "white" }))
      return chart.renderLineChart(
        chartConfig,
        { children, config: { dataKeys: ["value"] } },
        api,
      )
    }
  },

  renderTrafficCard(entity, api) {
    return card.render({
      header: html`
        <div class="iw-dashboard-card-header">
          <div>
            ${typography.render({ variant: "h3", children: "Traffic" })}
            ${typography.render({
              variant: "caption",
              children: "January - July 2023",
              color: "var(--iw-color-text-secondary)",
            })}
          </div>
          <div class="iw-dashboard-traffic-toolbar">
            ${buttonGroup.render({
              value: "month",
              variant: "outline",
              color: "secondary",
              size: "sm",
              buttons: [
                { id: "day", label: "Day" },
                { id: "month", label: "Month" },
                { id: "year", label: "Year" },
              ],
            })}
            ${button.render({
              size: "sm",
              children: materialIcon.render({ name: "download" }),
            })}
          </div>
        </div>
      `,
      body: html`
        <div class="iw-dashboard-traffic-chart">
          ${this.renderTrafficChart(entity, api)}
        </div>
      `,
      footer: html`
        <div class="iw-dashboard-traffic-summary">
          ${trafficSummary.map(
            (item) => html`
              <div class="iw-dashboard-progress-block">
                ${typography.render({
                  variant: "caption",
                  children: item.label,
                  color: "var(--iw-color-text-secondary)",
                })}
                ${typography.render({ children: item.value, weight: 600 })}
                ${progress.render({
                  value: item.progress,
                  className: `iw-progress-${item.tone}`,
                })}
              </div>
            `,
          )}
        </div>
      `,
    })
  },

  renderSocialCard(entity, item, api) {
    return card.render({
      className: "iw-dashboard-social-card",
      header: html`
        <div class="iw-dashboard-social-cap ${item.capClass}">
          ${materialIcon.render({ name: item.icon, size: "lg" })}
          <div class="iw-dashboard-social-chart">
            ${this.renderAreaSpark(entity, item.data, api)}
          </div>
        </div>
      `,
      body: html`
        <div class="iw-dashboard-social-stats">
          <div>
            ${typography.render({ variant: "h3", children: item.top })}
            ${typography.render({
              variant: "caption",
              children: item.topLabel,
              color: "var(--iw-color-text-secondary)",
            })}
          </div>
          <div class="iw-dashboard-vr"></div>
          <div>
            ${typography.render({ variant: "h3", children: item.bottom })}
            ${typography.render({
              variant: "caption",
              children: item.bottomLabel,
              color: "var(--iw-color-text-secondary)",
            })}
          </div>
        </div>
      `,
    })
  },

  renderTrafficSalesCard(entity, api) {
    return card.render({
      title: "Traffic & Sales",
      body: html`
        <div class="iw-dashboard-sales-layout">
          <div>
            <div class="iw-dashboard-kpi-grid">
              ${this.renderKpi(
                entity,
                { label: "New Clients", value: "9.123", color: "#39a2f1" },
                api,
              )}
              ${this.renderKpi(
                entity,
                {
                  label: "Recurring Clients",
                  value: "22.643",
                  color: "#e55353",
                },
                api,
              )}
            </div>
            <hr class="iw-dashboard-divider" />
            <div class="iw-dashboard-progress-list">
              ${clientBars.map(
                ([day, first, second]) => html`
                  <div
                    class="iw-dashboard-progress-row iw-dashboard-progress-row-dual"
                  >
                    <span class="iw-dashboard-progress-label">${day}</span>
                    <div class="iw-dashboard-progress-row-bars">
                      ${progress.render({
                        value: first,
                        className: "iw-progress-info",
                      })}
                      ${progress.render({
                        value: second,
                        className: "iw-progress-error",
                      })}
                    </div>
                  </div>
                `,
              )}
            </div>
          </div>
          <div>
            <div class="iw-dashboard-kpi-grid">
              ${this.renderKpi(
                entity,
                { label: "Pageviews", value: "78.623", color: "#f5a524" },
                api,
              )}
              ${this.renderKpi(
                entity,
                { label: "Organic", value: "49.123", color: "#2eb85c" },
                api,
              )}
            </div>
            <hr class="iw-dashboard-divider" />
            <div class="iw-dashboard-progress-list">
              ${sourceBars.map(
                ([label, value, iconName, tone, metric, suffix]) => html`
                  <div class="iw-dashboard-progress-block">
                    <div
                      class="iw-dashboard-progress-header iw-dashboard-progress-header-spread"
                    >
                      <div class="iw-dashboard-progress-header">
                        ${materialIcon.render({ name: iconName, size: "sm" })}
                        <span>${label}</span>
                      </div>
                      <div class="iw-dashboard-progress-meta">
                        ${metric
                          ? html`<span>${metric}</span><span>${suffix}</span>`
                          : html`<span>${value}%</span>`}
                      </div>
                    </div>
                    ${progress.render({
                      value,
                      className: `iw-progress-${tone}`,
                    })}
                  </div>
                `,
              )}
            </div>
          </div>
        </div>

        <div style="height: var(--iw-space-5)"></div>

        ${table.render({
          fullWidth: true,
          columns: [
            { id: "user", title: "User" },
            { id: "country", title: "Country" },
            { id: "usage", title: "Usage" },
            { id: "payment", title: "Payment Method" },
            { id: "activity", title: "Activity" },
            { id: "menu", title: "" },
          ],
          rows: userRows.map((row) => ({
            user: html`
              <div class="iw-dashboard-user">
                ${avatar.render({ initials: row.initials })}
                <div>
                  <div>${row.name}</div>
                  <div class="iw-dashboard-user-subtitle">${row.subtitle}</div>
                </div>
              </div>
            `,
            country: html`<div class="iw-dashboard-country">
              ${row.country}
            </div>`,
            usage: html`
              <div class="iw-dashboard-usage">
                <div class="iw-dashboard-progress-header-spread">
                  <span>${row.usage}%</span>
                  <span class="iw-dashboard-user-subtitle">${row.range}</span>
                </div>
                ${progress.render({
                  value: row.usage,
                  className: `iw-progress-${row.status}`,
                })}
              </div>
            `,
            payment: html`<div class="iw-dashboard-payment">
              ${row.payment}
            </div>`,
            activity: html`
              <div>
                <div class="iw-dashboard-user-subtitle">Last login</div>
                <div>${row.activity}</div>
              </div>
            `,
            menu: html`
              <div class="iw-dashboard-menu-cell">
                ${button.render({
                  variant: "ghost",
                  color: "secondary",
                  children: materialIcon.render({ name: "more_vert" }),
                })}
              </div>
            `,
          })),
        })}
      `,
    })
  },

  renderKpi(_, { label, value, color }) {
    return html`
      <div class="iw-dashboard-kpi" style=${`color: ${color};`}>
        ${typography.render({
          variant: "caption",
          children: label,
          color: "var(--iw-color-text-secondary)",
        })}
        ${typography.render({ variant: "h3", children: value })}
      </div>
    `
  },

  renderMiniLineChart(_, { values, stroke }, api) {
    return chart.renderLineChart(
      {
        type: "line",
        data: values.map((value, index) => ({ name: `${index}`, value })),
      },
      {
        width: 240,
        height: 80,
        dataKeys: ["value"],
        children: [chart.Line({ dataKey: "value", stroke, strokeWidth: 2 })],
      },
      api,
    )
  },

  renderAreaSpark(_, values, api) {
    return chart.renderAreaChart(
      {
        type: "area",
        data: values.map((value, index) => ({ name: `${index}`, value })),
      },
      {
        width: 320,
        height: 120,
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

  renderTrafficChart(_, api) {
    return chart.renderLineChart(
      { type: "line", data: trafficSeries },
      {
        width: 960,
        height: 320,
        dataKeys: ["visits", "unique", "pageviews"],
        children: [
          chart.CartesianGrid({
            stroke: "rgba(255,255,255,0.08)",
            strokeDasharray: "4 4",
          }),
          chart.XAxis({ dataKey: "name" }),
          chart.YAxis({ width: "auto" }),
          chart.Line({ dataKey: "visits", stroke: "#5856d6", strokeWidth: 3 }),
          chart.Line({ dataKey: "unique", stroke: "#39a2f1", strokeWidth: 3 }),
          chart.Line({
            dataKey: "pageviews",
            stroke: "#2eb85c",
            strokeWidth: 3,
          }),
          chart.Tooltip({}),
        ],
      },
      api,
    )
  },
}
