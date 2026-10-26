import browserConfig from "@inglorious/eslint-config/browser"
import typescriptConfig from "@inglorious/eslint-config/typescript"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...browserConfig,
  ...typescriptConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
