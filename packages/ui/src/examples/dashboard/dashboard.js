import { classMap, html } from "@inglorious/web"

import { container } from "../../layout/container/index.js"
import { flex } from "../../layout/flex/index.js"
import { grid } from "../../layout/grid/index.js"
import { appHeader } from "./app-header.js"
import { socialCards, statCards } from "./data.js"
import { socialCard } from "./social-card.js"
import { statCard } from "./stat-card.js"
import { trafficCard } from "./traffic-card.js"
import { trafficSalesCard } from "./traffic-sales-card.js"

export const dashboard = {
  render(entity, api) {
    const appDrawer = api.getEntity("appDrawer")

    return html`
      <div
        class=${classMap({
          "iw-dashboard": true,
          "iw-dashboard-drawer-hidden": appDrawer.isHidden,
          "iw-dashboard-drawer-collapsed": appDrawer.isCollapsed,
        })}
      >
        ${api.render("appDrawer")}

        <div class="iw-dashboard-main">
          ${appHeader.render(entity, api)}
          ${container.render({
            maxWidth: "xl",
            className: "iw-dashboard-content",
            children: flex.render({
              direction: "column",
              gap: "lg",
              children: [
                grid.render({
                  minColumnWidth: "18rem",
                  gap: "lg",
                  children: statCards.map((card) => statCard.render(card, api)),
                }),
                trafficCard.render(entity, api),
                grid.render({
                  columns: 3,
                  gap: "lg",
                  children: socialCards.map((card) =>
                    socialCard.render(card, api),
                  ),
                }),
                trafficSalesCard.render(entity, api),
              ],
            }),
          })}
          ${flex.render({
            element: "footer",
            justify: "between",
            gap: "md",
            padding: "md",
            className: "iw-dashboard-footer",
            children: [
              html`<div>Admin dashboard example © 2026</div>`,
              html`<div>Built with Inglorious UI primitives and charts</div>`,
            ],
          })}
        </div>
      </div>
    `
  },
}
