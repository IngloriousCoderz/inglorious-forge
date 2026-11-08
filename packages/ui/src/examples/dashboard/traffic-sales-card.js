import groupOutline from "@iconify-icons/material-symbols/group-outline"
import moreVertOutline from "@iconify-icons/material-symbols/more-vert-outline"
import { html } from "@inglorious/web"

import { Button } from "../../controls/button/index.js"
import { Avatar } from "../../data-display/avatar/index.js"
import { Badge } from "../../data-display/badge/index.js"
import { Icon } from "../../data-display/icon/index.js"
import { Table } from "../../data-display/table/index.js"
import { Typography } from "../../data-display/typography/index.js"
import { Progress } from "../../feedback/progress/index.js"
import { Flex } from "../../layout/flex/index.js"
import { Grid } from "../../layout/grid/index.js"
import { Card } from "../../surfaces/card/index.js"
import { clientBars, sourceBars, userRows } from "./data.js"

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
                        color: "var(--iw-color-info-emphasis)",
                      },
                      api,
                    ),
                    this.renderKpi(
                      entity,
                      {
                        label: "Recurring Clients",
                        value: "22.643",
                        color: "var(--iw-color-error-emphasis)",
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
                        html`<span class="iw-typography">${day}</span>`,
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
                        color: "var(--iw-color-warning-emphasis)",
                      },
                      api,
                    ),
                    this.renderKpi(
                      entity,
                      {
                        label: "Organic",
                        value: "49.123",
                        color: "var(--iw-color-success-emphasis)",
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
                                Icon.render({
                                  icon: iconName,
                                  size: "lg",
                                }),
                                html`<span class="iw-typography"
                                  >${label}</span
                                >`,
                              ],
                            }),
                            Flex.render({
                              align: "center",
                              gap: "sm",
                              className: "iw-dashboard-progress-meta",
                              children: metric
                                ? [
                                    html`<span class="iw-typography"
                                      >${metric}</span
                                    >`,
                                    html`<span class="iw-typography"
                                      >${suffix}</span
                                    >`,
                                  ]
                                : [
                                    html`<span class="iw-typography"
                                      >${value}%</span
                                    >`,
                                  ],
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
            {
              id: "avatar",
              title: html`<div class="iw-dashboard-avatar-cell">
                ${Icon.render({ icon: groupOutline, label: "Avatar" })}
              </div>`,
            },
            { id: "user", title: "User" },
            { id: "country", title: "Country" },
            { id: "usage", title: "Usage" },
            { id: "payment", title: "Payment Method" },
            { id: "activity", title: "Activity" },
            { id: "menu", title: "" },
          ],
          rows: userRows.map((row) => ({
            avatar: html`<div class="iw-dashboard-avatar-cell">
              <span class="iw-dashboard-avatar">
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
              </span>
            </div>`,
            user: html`<div class="iw-typography">
              <div>${row.name}</div>
              <div class="iw-dashboard-user-subtitle">${row.subtitle}</div>
            </div>`,
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
                      html`<span class="iw-typography">${row.usage}%</span>`,
                      html`<span
                        class="iw-typography iw-dashboard-user-subtitle"
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
              ${Icon.render({ icon: row.payment, size: "lg" })}
            </div>`,
            activity: html`
              <div>
                <div class="iw-typography iw-dashboard-user-subtitle">
                  Last login
                </div>
                <div class="iw-typography">${row.activity}</div>
              </div>
            `,
            menu: html`
              <div class="iw-dashboard-menu-cell">
                ${Button.render({
                  variant: "ghost",
                  color: "secondary",
                  children: Icon.render({ icon: moreVertOutline }),
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
