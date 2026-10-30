import tsEslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import { defineConfig } from "eslint/config"
import globals from "globals"

import baseConfig from "./base.js"

export default defineConfig([
  ...baseConfig,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
    },
    rules: {
      ...tsEslint.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
])
