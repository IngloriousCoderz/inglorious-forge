import { container as Container } from "../../layout/container/index.js"
import { flex as Flex } from "../../layout/flex/index.js"
import { grid as Grid } from "../../layout/grid/index.js"
import { appHeader } from "./app-header.js"
import { socialCards, statCards } from "./data.js"
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
      appDrawer.isHidden && "iw-dashboard-drawer-hidden",
      appDrawer.isCollapsed && "iw-dashboard-drawer-collapsed",
    ]
      .filter(Boolean)
      .join(" ")

    const isDashboardRoot = !router || router.path === "/"

    let mainContent
    if (isDashboardRoot) {
      mainContent = (
        <Flex direction="column" gap="lg">
          <Grid minColumnWidth="18rem" gap="lg">
            {statCards.map((card) => statCard.render(card, api))}
          </Grid>
          {trafficCard.render(entity, api)}
          <Grid columns={3} gap="lg">
            {socialCards.map((card) => socialCard.render(card, api))}
          </Grid>
          {trafficSalesCard.render(entity, api)}
        </Flex>
      )
    } else {
      mainContent = api.render("primitiveSection")
    }

    return (
      <Flex direction="column" className={dashboardClassName}>
        <AppDrawer />
        <Flex element="main" direction="column" className="iw-dashboard-main">
          {appHeader.render(entity, api)}
          <Container
            maxWidth="xl"
            padding="lg"
            className="iw-dashboard-container"
          >
            {mainContent}
          </Container>
          <Flex
            element="footer"
            justify="between"
            gap="md"
            padding="md"
            className="iw-dashboard-footer"
          >
            <div>Admin dashboard example © 2026</div>
            <div>Built with Inglorious UI primitives and charts</div>
          </Flex>
        </Flex>
      </Flex>
    )
  },
}
