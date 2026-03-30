import { container as Container } from "../../layout/container/index.js"
import { flex as Flex } from "../../layout/flex/index.js"
import { grid as Grid } from "../../layout/grid/index.js"
import { AppDrawer } from "./app-drawer.js"
import { AppHeader } from "./app-header.js"
import { socialCards, statCards } from "./data.js"
import { PrimitiveSection } from "./primitive-section.js"
import { SocialCard } from "./social-card.js"
import { StatCard } from "./stat-card.js"
import { TrafficCard } from "./traffic-card.js"
import { TrafficSalesCard } from "./traffic-sales-card.js"

export const DashboardJsx = {
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

    return (
      <Flex direction="column" className={dashboardClassName}>
        <AppDrawer />

        <Flex element="main" direction="column" className="iw-dashboard-main">
          <AppHeader />

          <Container
            maxWidth="xl"
            padding="lg"
            className="iw-dashboard-container"
          >
            {isDashboardRoot && (
              <Flex direction="column" gap="lg">
                <Grid minColumnWidth="18rem" gap="lg">
                  {statCards.map((card) => (
                    <StatCard key={card.id} {...card} />
                  ))}
                </Grid>

                <TrafficCard />

                <Grid columns={3} gap="lg">
                  {socialCards.map((card) => (
                    <SocialCard key={card.id} {...card} />
                  ))}
                </Grid>

                <TrafficSalesCard />
              </Flex>
            )}

            {!isDashboardRoot && <PrimitiveSection />}
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
