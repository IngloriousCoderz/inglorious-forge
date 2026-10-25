import typescriptConfig from "@inglorious/eslint-config/typescript"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...typescriptConfig,

  // A handful of type shims has no tsconfig of its own, and the shared rules do not need
  // type information to run.
  {
    files: ["**/*.ts"],
    languageOptions: { parserOptions: { project: null } },
  },
])
