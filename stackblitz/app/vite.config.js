import path from "node:path"
import { fileURLToPath } from "node:url"

import { hmr } from "@inglorious/vite-plugin-hmr"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [hmr()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
