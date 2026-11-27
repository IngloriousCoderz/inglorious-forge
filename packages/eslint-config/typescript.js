import tsEslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import { defineConfig } from "eslint/config"
import globals from "globals"

import baseConfig from "./base.js"

export default defineConfig([
  ...baseConfig,

  {
    files: ["**/*.{ts,mts,cts,tsx,its}"],
    languageOptions: {
      parser: tsParser,
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
      "no-magic-numbers": "off",
      "@typescript-eslint/no-magic-numbers": [
        "warn",
        {
          ignoreNumericLiteralTypes: true,
          ignoreTypeIndexes: true,
          ignoreEnums: true,
        },
      ],
    },
  },

  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    files: ["**/type-tests/**"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },

  {
    files: ["**/*.{test,spec}.{ts,mts,cts,tsx,its}", "**/test/**"],
    rules: {
      "@typescript-eslint/no-magic-numbers": "off",
    },
  },
])
