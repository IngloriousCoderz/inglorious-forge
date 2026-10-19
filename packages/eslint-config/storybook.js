import { defineConfig, globalIgnores } from "eslint/config"

import baseConfig from "./base.js"

export default defineConfig([
  ...baseConfig,

  globalIgnores(["storybook-static"]),

  {
    files: ["**/*.stories.{js,jsx,ts,tsx}"],
    rules: {
      "no-magic-numbers": "off",
    },
  },
])
