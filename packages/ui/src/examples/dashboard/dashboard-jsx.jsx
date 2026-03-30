import { container as Container } from "../../layout/container/index.js"
import { flex as Flex } from "../../layout/flex/index.js"
import { grid as Grid } from "../../layout/grid/index.js"
import { AppHeader } from "./app-header.js"
import { socialCards, statCards } from "./data.js"
import { SocialCard } from "./social-card.js"
import { StatCard } from "./stat-card.js"
import { TrafficCard } from "./traffic-card.js"
import { TrafficSalesCard } from "./traffic-sales-card.js"

export const DashboardJsx = {
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
            {statCards.map((card) => (
              <StatCard key={card.id} {...card} />
            ))}
          </Grid>
          {TrafficCard.render(entity, api)}
          <Grid columns={3} gap="lg">
            {socialCards.map((card) => (
              <SocialCard key={card.id} {...card} />
            ))}
          </Grid>
          {TrafficSalesCard.render(entity, api)}
        </Flex>
      )
    } else {
      mainContent = api.render("primitiveSection")
    }

    return (
      <Flex direction="column" className={dashboardClassName}>
        <AppDrawer />
        <Flex element="main" direction="column" className="iw-dashboard-main">
          {AppHeader.render(entity, api)}
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
