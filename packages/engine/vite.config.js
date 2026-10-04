import { defineConfig } from "vite"

export default defineConfig({
  resolve: {
    alias: {
      "@inglorious/engine/": "/src/",
    },
  },
})
