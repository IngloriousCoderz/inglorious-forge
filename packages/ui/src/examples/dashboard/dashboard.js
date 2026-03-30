import { html, when } from "@inglorious/web"

import { container } from "../../layout/container/index.js"
import { flex } from "../../layout/flex/index.js"
import { grid } from "../../layout/grid/index.js"
import { AppHeader } from "./app-header.js"
import { socialCards, statCards } from "./data.js"
import { SocialCard } from "./social-card.js"
import { StatCard } from "./stat-card.js"
import { TrafficCard } from "./traffic-card.js"
import { TrafficSalesCard } from "./traffic-sales-card.js"

export const Dashboard = {
  render(entity, api) {
    const appDrawer = api.getEntity("appDrawer")
    const dashboardClassName = [
      "iw-dashboard",
      appDrawer.isHidden && "iw-dashboard-drawer-hidden",
      appDrawer.isCollapsed && "iw-dashboard-drawer-collapsed",
    ]
      .filter(Boolean)
      .join(" ")

    const router = api.getEntity("router")
    const isDashboardRoot = !router || router.path === "/"

    return flex.render({
      direction: "column",
      className: dashboardClassName,
      children: [
        api.render("appDrawer"),
        flex.render({
          element: "main",
          direction: "column",
          className: "iw-dashboard-main",
          children: [
            AppHeader.render(entity, api),
            container.render({
              maxWidth: "xl",
              padding: "lg",
              className: "iw-dashboard-container",
              children: when(
                isDashboardRoot,
                () =>
                  flex.render({
                    direction: "column",
                    gap: "lg",
                    children: [
                      grid.render({
                        minColumnWidth: "18rem",
                        gap: "lg",
                        children: statCards.map((card) =>
                          StatCard.render(card, api),
                        ),
                      }),
                      TrafficCard.render(entity, api),
                      grid.render({
                        columns: 3,
                        gap: "lg",
                        children: socialCards.map((card) =>
                          SocialCard.render(card, api),
                        ),
                      }),
                      TrafficSalesCard.render(entity, api),
                    ],
                  }),
                () => api.render("primitiveSection"),
              ),
            }),
            flex.render({
              element: "footer",
              justify: "between",
              gap: "md",
              padding: "md",
              className: "iw-dashboard-footer",
              children: [
                html`<div>Admin dashboard example © 2026</div>`,
                html`<div>Built with Inglorious UI primitives and charts</div>`,
              ],
            }),
          ],
        }),
      ],
    })
  },
}
