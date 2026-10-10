import { defineConfig } from "vitest/config"

// There is no `vite.config.js` to merge here: this game resolves its workspace
// dependencies through `package.json` alone.
export default defineConfig({
  test: { environment: "jsdom" },
})
