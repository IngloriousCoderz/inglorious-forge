import nodeConfig from "@inglorious/eslint-config/node"
import typescriptConfig from "@inglorious/eslint-config/typescript"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...nodeConfig,
  ...typescriptConfig,
  {
    files: ["bin/**"],
    rules: {
      "no-console": "off",
    },
  },
])
