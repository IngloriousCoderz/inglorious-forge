import type { SiteConfig } from "@inglorious/ssx"
import { vue } from "@inglorious/vite-plugin-vue"

const siteConfig: SiteConfig = {
  title: "My SSX App",
  favicon: "/logo.png",
  meta: {
    description: "Built with @inglorious/ssx",
    viewport: "width=device-width, initial-scale=1.0, viewport-fit=cover",
  },
  vite: {
    plugins: [vue()],
    server: {
      port: 3000,
    },
  },
}

export default siteConfig
