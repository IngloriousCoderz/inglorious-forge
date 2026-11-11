import nodeConfig from "@inglorious/eslint-config/node"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...nodeConfig,
  {
    files: ["bin/**"],
    rules: {
      "no-console": "off",
    },
  },
])
