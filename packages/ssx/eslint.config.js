import nodeConfig from "@inglorious/eslint-config/node"
import typescriptConfig from "@inglorious/eslint-config/typescript"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...nodeConfig,
  ...typescriptConfig,

  {
    files: ["**/*.js"],
    rules: {
      "no-magic-numbers": "off",
      "no-console": "off",
    },
  },

  {
    files: ["src/utils/page-head.js", "src/utils/page-head.test.js"],
    languageOptions: { globals: { document: "readonly", window: "readonly" } },
  },
])
