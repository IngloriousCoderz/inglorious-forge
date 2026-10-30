import { jsx } from "@inglorious/vite-plugin-jsx"

/** @type {import('@inglorious/ssx').SiteConfig} */
export default {
  title: "My SSX App",
  favicon: "/logo.png",
  meta: {
    description: "Built with @inglorious/ssx",
    viewport: "width=device-width, initial-scale=1.0, viewport-fit=cover",
  },
  vite: {
    plugins: [jsx()],
    server: {
      port: 3000,
    },
  },
}
