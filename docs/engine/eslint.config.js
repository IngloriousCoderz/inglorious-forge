import reactConfig from "@inglorious/eslint-config/react"
import storybookConfig from "@inglorious/eslint-config/storybook"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...reactConfig,
  ...storybookConfig,

  {
    // A recipe is an example, and an example is made of the numbers that make it read:
    // where things are, how big they are, how fast they move. Naming each one would
    // bury the thing being demonstrated.
    files: ["**/*.{js,ijs}"],
    rules: {
      "no-magic-numbers": "off",
    },
  },
])
