import { resolve } from "path"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
})
