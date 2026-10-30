import typescriptConfig from "@inglorious/eslint-config/typescript"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...typescriptConfig,

  {
    files: ["**/*.ts"],
    languageOptions: { parserOptions: { project: null } },
  },
])
