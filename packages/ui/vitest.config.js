import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.js"],
    /* So a stylesheet can be imported as text and asserted on. Vitest hands back
       an empty string otherwise, which turns a check into a silent pass. */
    css: true,
  },
})
