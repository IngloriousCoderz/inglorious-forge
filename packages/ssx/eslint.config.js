import nodeConfig from "@inglorious/eslint-config/node"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...nodeConfig,

  {
    files: ["**/*.js"],
    rules: {
      "no-magic-numbers": "off",
      "no-console": "off",
    },
  },

  // Runs in the browser, imported by the generated client entry.
  {
    files: ["src/utils/page-head.js", "src/utils/page-head.test.js"],
    languageOptions: { globals: { document: "readonly", window: "readonly" } },
  },
])
