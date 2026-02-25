import browserConfig from "@inglorious/eslint-config/browser"
import storybookConfig from "@inglorious/eslint-config/storybook"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...browserConfig,
  ...storybookConfig,

  {
    files: ["**/*.js"],
    rules: {
      "no-magic-numbers": "off",
    },
  },
])
