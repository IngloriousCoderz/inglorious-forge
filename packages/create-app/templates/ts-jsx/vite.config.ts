import path from "node:path"
import { fileURLToPath } from "node:url"

import { jsx } from "@inglorious/vite-plugin-jsx"
import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals"
import { defineConfig } from "vite"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  // @see https://github.com/vitejs/vite/issues/1973
  define: { "process.env": {} },

  plugins: [minifyTemplateLiterals(), ViteImageOptimizer(), jsx()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
})
