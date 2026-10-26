import type { SiteConfig } from "@inglorious/ssx"
import { jsx } from "@inglorious/vite-plugin-jsx"

const siteConfig: SiteConfig = {
  title: "My SSX App",
  favicon: "/logo.png",
  meta: {
    description: "Built with @inglorious/ssx",
    viewport: "width=device-width, initial-scale=1.0, viewport-fit=cover",
  },
  // SSX includes image optimization by default
  vite: {
    plugins: [jsx()],
    server: {
      port: 3000,
    },
  },
}

export default siteConfig
