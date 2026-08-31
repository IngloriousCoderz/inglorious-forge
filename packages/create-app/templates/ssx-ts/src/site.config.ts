import type { SiteConfig } from "@inglorious/ssx"

const siteConfig: SiteConfig = {
  title: "My SSX App",
  meta: {
    description: "Built with @inglorious/ssx",
    viewport: "width=device-width, initial-scale=1.0, viewport-fit=cover",
  },
  // SSX includes image optimization by default
  vite: {
    server: {
      port: 3000,
    },
  },
}

export default siteConfig
