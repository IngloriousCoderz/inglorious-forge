<template>
  <div :class="rootClass">
    <AppDrawer />
    <main
      class="iw-flex iw-flex-direction-column iw-flex-wrap-nowrap iw-flex-justify-start iw-flex-align-stretch iw-flex-gap-none iw-flex-padding-none iw-dashboard-main"
    >
      <AppHeader />
      <div
        class="iw-container iw-container-centered iw-container-padding-lg iw-dashboard-container"
        :style="{ maxWidth: '80rem' }"
      >
        <div
          v-if="isDashboardRoot"
          class="iw-flex iw-flex-direction-column iw-flex-wrap-nowrap iw-flex-justify-start iw-flex-align-stretch iw-flex-gap-lg iw-flex-padding-none"
        >
          <div
            class="iw-grid iw-grid-gap-lg iw-grid-padding-none"
            :style="{
              gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
            }"
          >
            <div v-for="card in statCards" :key="card.id">
              <StatCard :card="card" />
            </div>
          </div>
          <TrafficCard />
          <div
            class="iw-grid iw-grid-gap-lg iw-grid-padding-none"
            :style="{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }"
          >
            <div v-for="card in socialCards" :key="card.icon">
              <SocialCard :card="card" />
            </div>
          </div>
          <TrafficSalesCard />
        </div>
        <PrimitiveSection v-else />
      </div>
      <footer
        class="iw-flex iw-flex-direction-row iw-flex-wrap-nowrap iw-flex-justify-between iw-flex-align-stretch iw-flex-gap-md iw-flex-padding-md iw-dashboard-footer"
      >
        <div>Admin dashboard example © 2026</div>
        <div>Built with Inglorious UI primitives and charts</div>
      </footer>
    </main>
  </div>
</template>

<script>
import { socialCards, statCards } from "./data.js"
import { socialCard as SocialCard } from "./social-card.js"
import { statCard as StatCard } from "./stat-card.js"

const rootClass =
  "iw-flex iw-flex-direction-column iw-flex-wrap-nowrap iw-flex-justify-start iw-flex-align-stretch iw-flex-gap-none iw-flex-padding-none iw-dashboard"
const isDashboardRoot = true
</script>
