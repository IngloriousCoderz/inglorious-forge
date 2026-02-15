import path from "node:path"
import { fileURLToPath } from "node:url"

import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals"
import { defineConfig } from "vite"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
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
