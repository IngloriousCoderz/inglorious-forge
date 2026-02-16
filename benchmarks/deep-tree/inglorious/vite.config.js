import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [minifyTemplateLiterals()],
    },
  },
})
