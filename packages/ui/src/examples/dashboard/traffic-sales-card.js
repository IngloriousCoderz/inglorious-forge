import { html } from "@inglorious/web"

import { button } from "../../controls/button"
import { avatar } from "../../data-display/avatar"
import { materialIcon } from "../../data-display/material-icon"
import { table } from "../../data-display/table"
import { typography } from "../../data-display/typography"
import { progress } from "../../feedback/progress"
import { flex } from "../../layout/flex"
import { grid } from "../../layout/grid"
import { card } from "../../surfaces/card"
import { clientBars, sourceBars, userRows } from "./data"

export const trafficSalesCard = {
  render(entity, api) {
    return card.render({
      title: "Traffic & Sales",
      body: html`
        ${grid.render({
          columns: 2,
          gap: "lg",
          className: "iw-dashboard-sales-layout",
          children: [
            html`
              <div>
                ${grid.render({
                  columns: 2,
                  gap: "md",
                  className: "iw-dashboard-kpi-grid",
                  children: [
                    this.renderKpi(
                      entity,
                      {
                        label: "New Clients",
                        value: "9.123",
                        color: "#39a2f1",
                      },
                      api,
                    ),
                    this.renderKpi(
                      entity,
                      {
                        label: "Recurring Clients",
                        value: "22.643",
                        color: "#e55353",
                      },
                      api,
                    ),
                  ],
                })}
                <hr class="iw-dashboard-divider" />
                ${flex.render({
                  direction: "column",
                  gap: "md",
                  className: "iw-dashboard-progress-list",
                  children: clientBars.map(([day, first, second]) =>
                    grid.render({
                      columns: "6rem 1fr",
                      gap: "md",
                      align: "center",
                      className: "iw-dashboard-progress-row",
                      children: [
                        html`<span>${day}</span>`,
                        flex.render({
                          direction: "column",
                          gap: "sm",
                          children: [
                            progress.render({
                              value: first,
                              className: "iw-progress-info",
                            }),
                            progress.render({
                              value: second,
                              className: "iw-progress-error",
                            }),
                          ],
                        }),
                      ],
                    }),
                  ),
                })}
              </div>
            `,
            html`
              <div>
                ${grid.render({
                  columns: 2,
                  gap: "md",
                  className: "iw-dashboard-kpi-grid",
                  children: [
                    this.renderKpi(
                      entity,
                      {
                        label: "Pageviews",
                        value: "78.623",
                        color: "#f5a524",
                      },
                      api,
                    ),
                    this.renderKpi(
                      entity,
                      { label: "Organic", value: "49.123", color: "#2eb85c" },
                      api,
                    ),
                  ],
                })}
                <hr class="iw-dashboard-divider" />
                ${flex.render({
                  direction: "column",
                  gap: "md",
                  className: "iw-dashboard-progress-list",
                  children: sourceBars.map(
                    ([label, value, iconName, tone, metric, suffix]) => html`
                      <div>
                        ${flex.render({
                          align: "center",
                          justify: "between",
                          gap: "md",
                          children: [
                            flex.render({
                              align: "center",
                              gap: "sm",
                              children: [
                                materialIcon.render({
                                  name: iconName,
                                  size: "sm",
                                }),
                                html`<span>${label}</span>`,
                              ],
                            }),
                            flex.render({
                              align: "center",
                              gap: "sm",
                              className: "iw-dashboard-progress-meta",
                              children: metric
                                ? [
                                    html`<span>${metric}</span>`,
                                    html`<span>${suffix}</span>`,
                                  ]
                                : [html`<span>${value}%</span>`],
                            }),
                          ],
                        })}
                        ${progress.render({
                          value,
                          className: `iw-progress-${tone}`,
                        })}
                      </div>
                    `,
                  ),
                })}
              </div>
            `,
          ],
        })}

        <div style="height: var(--iw-space-5)"></div>

        ${table.render({
          isFullWidth: true,
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
              ${flex.render({
                align: "center",
                gap: "md",
                children: [
                  avatar.render({ initials: row.initials }),
                  html`<div>
                    <div>${row.name}</div>
                    <div class="iw-dashboard-user-subtitle">
                      ${row.subtitle}
                    </div>
                  </div>`,
                ],
              })}
            `,
            country: html`<div class="iw-dashboard-country">
              ${row.country}
            </div>`,
            usage: html`
              ${flex.render({
                direction: "column",
                gap: "sm",
                children: [
                  flex.render({
                    justify: "between",
                    gap: "sm",
                    children: [
                      html`<span>${row.usage}%</span>`,
                      html`<span class="iw-dashboard-user-subtitle"
                        >${row.range}</span
                      >`,
                    ],
                  }),
                  progress.render({
                    value: row.usage,
                    className: `iw-progress-${row.status}`,
                  }),
                ],
              })}
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
