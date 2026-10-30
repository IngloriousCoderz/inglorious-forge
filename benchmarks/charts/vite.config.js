import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: "index.html",
        recharts: "recharts.html",
        "inglorious-config": "inglorious-config.html",
        "inglorious-composition": "inglorious-composition.html",
      },
    },
  },
})
