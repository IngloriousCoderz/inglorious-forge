import { html } from "@inglorious/web"

import { Button } from "../../controls/button"
import { Avatar } from "../../data-display/avatar"
import { Badge } from "../../data-display/badge"
import { Icon } from "../../data-display/icon"
import { MaterialIcon } from "../../data-display/material-icon"
import { Table } from "../../data-display/table"
import { Typography } from "../../data-display/typography"
import { Progress } from "../../feedback/progress"
import { Flex } from "../../layout/flex"
import { Grid } from "../../layout/grid"
import { Card } from "../../surfaces/card"
import { clientBars, sourceBars, userRows } from "./data"

export const TrafficSalesCard = {
  render(entity, api) {
    return Card.render({
      title: "Traffic & Sales",
      body: html`
        ${Grid.render({
          columns: 2,
          gap: "lg",
          className: "iw-dashboard-sales-layout",
          children: [
            html`
              <div>
                ${Grid.render({
                  columns: 2,
                  gap: "lg",
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
                ${Flex.render({
                  direction: "column",
                  gap: "lg",
                  className: "iw-dashboard-progress-list",
                  children: clientBars.map(([day, first, second]) =>
                    Grid.render({
                      columns: "6rem 1fr",
                      gap: "lg",
                      align: "center",
                      className: "iw-dashboard-progress-row",
                      children: [
                        html`<span>${day}</span>`,
                        Flex.render({
                          direction: "column",
                          gap: "sm",
                          children: [
                            Progress.render({
                              value: first,
                              className: "iw-progress-info",
                            }),
                            Progress.render({
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
                ${Grid.render({
                  columns: 2,
                  gap: "lg",
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
                ${Flex.render({
                  direction: "column",
                  gap: "lg",
                  className: "iw-dashboard-progress-list",
                  children: sourceBars.map(
                    ([label, value, iconName, tone, metric, suffix]) => html`
                      <div>
                        ${Flex.render({
                          align: "center",
                          justify: "between",
                          gap: "lg",
                          children: [
                            Flex.render({
                              align: "center",
                              gap: "sm",
                              children: [
                                MaterialIcon.render({
                                  name: iconName,
                                  size: "lg",
                                }),
                                html`<span>${label}</span>`,
                              ],
                            }),
                            Flex.render({
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
                        ${Progress.render({
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

        ${Table.render({
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
              ${Flex.render({
                align: "center",
                gap: "lg",
                children: [
                  html`<span class="iw-dashboard-avatar">
                    ${Avatar.render({
                      size: "lg",
                      color: "auto",
                      initials: row.initials,
                    })}
                    ${Badge.render({
                      shape: "circle",
                      ringWidth: "1px",
                      color: row.status,
                      className: "iw-dashboard-avatar-badge",
                      children: "",
                    })}
                  </span>`,
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
              ${Flex.render({
                direction: "column",
                gap: "sm",
                children: [
                  Flex.render({
                    justify: "between",
                    gap: "sm",
                    children: [
                      html`<span>${row.usage}%</span>`,
                      html`<span class="iw-dashboard-user-subtitle"
                        >${row.range}</span
                      >`,
                    ],
                  }),
                  Progress.render({
                    value: row.usage,
                    className: `iw-progress-${row.status}`,
                  }),
                ],
              })}
            `,
            payment: html`<div class="iw-dashboard-payment">
              ${Icon.render({
                size: "lg",
                children: html`<i
                  class="fa-brands fa-${row.payment}"
                  aria-hidden="true"
                ></i>`,
              })}
            </div>`,
            activity: html`
              <div>
                <div class="iw-dashboard-user-subtitle">Last login</div>
                <div>${row.activity}</div>
              </div>
            `,
            menu: html`
              <div class="iw-dashboard-menu-cell">
                ${Button.render({
                  variant: "ghost",
                  color: "secondary",
                  children: MaterialIcon.render({ name: "more_vert" }),
                  "aria-label": "Row actions",
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
        ${Typography.render({
          variant: "caption",
          children: label,
          color: "var(--iw-color-text-secondary)",
        })}
        ${Typography.render({ variant: "h3", children: value })}
      </div>
    `
  },
}
