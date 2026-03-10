import { html } from "@inglorious/web"

import { button } from "../../controls/button"
import { avatar } from "../../data-display/avatar"
import { materialIcon } from "../../data-display/material-icon"
import { table } from "../../data-display/table"
import { typography } from "../../data-display/typography"
import { progress } from "../../feedback/progress"
import { card } from "../../surfaces/card"
import { clientBars, sourceBars, userRows } from "./data"

export const trafficSalesCard = {
  render(entity, api) {
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
}
