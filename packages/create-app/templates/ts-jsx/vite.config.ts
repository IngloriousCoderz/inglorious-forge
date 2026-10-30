import path from "node:path"
import { fileURLToPath } from "node:url"

import { hmr } from "@inglorious/vite-plugin-hmr"
import { jsx } from "@inglorious/vite-plugin-jsx"
import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals"
import { defineConfig } from "vite"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  define: { "process.env": {} },

  plugins: [ViteImageOptimizer(), jsx(), hmr()],

  build: {
    rollupOptions: {
      plugins: [minifyTemplateLiterals()],
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
