import browserConfig from "@inglorious/eslint-config/browser"
import typescriptConfig from "@inglorious/eslint-config/typescript"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...browserConfig,
  ...typescriptConfig,

  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "react/jsx-no-undef": "off",
    },
  },

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.app.json", "./tsconfig.node.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
