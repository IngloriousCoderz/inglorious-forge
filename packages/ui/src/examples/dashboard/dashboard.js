import { html } from "@inglorious/web"
import { when } from "@inglorious/web/directives/when"

import { Container } from "../../layout/container/index.js"
import { Flex } from "../../layout/flex/index.js"
import { Grid } from "../../layout/grid/index.js"
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

    return Flex.render({
      direction: "column",
      className: dashboardClassName,
      children: [
        api.render("appDrawer"),
        Flex.render({
          element: "main",
          direction: "column",
          className: "iw-dashboard-main",
          children: [
            AppHeader.render(entity, api),
            Container.render({
              maxWidth: "xl",
              padding: "lg",
              className: "iw-dashboard-container",
              children: when(
                isDashboardRoot,
                () =>
                  Flex.render({
                    direction: "column",
                    gap: "lg",
                    children: [
                      Grid.render({
                        minColumnWidth: "18rem",
                        gap: "lg",
                        children: statCards.map((card) =>
                          StatCard.render(card, api),
                        ),
                      }),
                      TrafficCard.render(entity, api),
                      Grid.render({
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
            Flex.render({
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
