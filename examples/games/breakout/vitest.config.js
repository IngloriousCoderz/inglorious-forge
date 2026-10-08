import { defineConfig, mergeConfig } from "vitest/config"

import viteConfig from "./vite.config.js"

// A `vitest.config.js` replaces the `vite.config.js` a test run would otherwise pick up,
// so the game's own resolution and plugins are merged back in rather than lost.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: { environment: "jsdom" },
  }),
)
