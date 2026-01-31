import reactConfig from "@inglorious/eslint-config/react"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...reactConfig,

  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "react/jsx-no-undef": "off",
    },
  },
])
