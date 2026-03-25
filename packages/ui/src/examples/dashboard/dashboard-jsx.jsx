import { flex as Flex } from "../../layout/flex/index.js"
import { appHeader } from "./app-header.js"
import { socialCards, statCards } from "./data.js"
import { primitiveSection } from "./primitive-section.js"
import { socialCard } from "./social-card.js"
import { statCard } from "./stat-card.js"
import { trafficCard } from "./traffic-card.js"
import { trafficSalesCard } from "./traffic-sales-card.js"

export const dashboardJsx = {
  render(entity, api) {
    const appDrawer = api.getEntity("appDrawer")
    const router = api.getEntity("router")

    const dashboardClassName = [
      "iw-dashboard",
      appDrawer?.isHidden && "iw-dashboard-drawer-hidden",
      appDrawer?.isCollapsed && "iw-dashboard-drawer-collapsed",
    ]
      .filter(Boolean)
      .join(" ")

    const isDashboardRoot = !router || router.path === "/"

    const mainContent = isDashboardRoot ? (
      // <div className="iw-flex iw-flex-direction-column iw-flex-wrap-nowrap iw-flex-justify-start iw-flex-align-stretch iw-flex-gap-lg iw-flex-padding-none">
      <Flex direction="column" gap="lg">
        <div
          className="iw-grid iw-grid-gap-lg iw-grid-padding-none"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))",
          }}
        >
          {statCards.map((card) => statCard.render(card, api))}
        </div>
        {trafficCard.render(entity, api)}
        <div
          className="iw-grid iw-grid-gap-lg iw-grid-padding-none"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
        >
          {socialCards.map((card) => socialCard.render(card, api))}
        </div>
        {trafficSalesCard.render(entity, api)}
      </Flex>
    ) : (
      primitiveSection.render(entity, api)
    )

    return (
      <div
        className={`iw-flex iw-flex-direction-column iw-flex-wrap-nowrap iw-flex-justify-start iw-flex-align-stretch iw-flex-gap-none iw-flex-padding-none ${dashboardClassName}`}
      >
        <AppDrawer />
        <main className="iw-flex iw-flex-direction-column iw-flex-wrap-nowrap iw-flex-justify-start iw-flex-align-stretch iw-flex-gap-none iw-flex-padding-none iw-dashboard-main">
          {appHeader.render(entity, api)}
          <div
            className="iw-container iw-container-centered iw-container-padding-lg iw-dashboard-container"
            style={{ maxWidth: "80rem" }}
          >
            {mainContent}
          </div>
          <footer className="iw-flex iw-flex-direction-row iw-flex-wrap-nowrap iw-flex-justify-between iw-flex-align-stretch iw-flex-gap-md iw-flex-padding-md iw-dashboard-footer">
            <div>Admin dashboard example © 2026</div>
            <div>Built with Inglorious UI primitives and charts</div>
          </footer>
        </main>
      </div>
    )
  },
}
