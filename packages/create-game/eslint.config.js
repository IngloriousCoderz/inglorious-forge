import browserConfig from "@inglorious/eslint-config/browser"
import nodeConfig from "@inglorious/eslint-config/node"
import typescriptConfig from "@inglorious/eslint-config/typescript"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...browserConfig,
  ...nodeConfig,
  ...typescriptConfig,
  {
    files: ["./bin/index.js"],
    rules: {
      "no-console": "off",
    },
  },
  {
    ignores: ["templates/**"],
  },
])
