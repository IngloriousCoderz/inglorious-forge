import reactConfig from "@inglorious/eslint-config/react"
import storybookConfig from "@inglorious/eslint-config/storybook"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...reactConfig,
  ...storybookConfig,

  {
    files: ["**/*.js"],
    rules: {
      "no-magic-numbers": "off",
    },
  },
])
