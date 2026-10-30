import js from "@eslint/js"
import { defineConfig, globalIgnores } from "eslint/config"
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort"

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,mjs,cjs,jsx,ijs}"],
    extends: ["js/recommended"],
    plugins: { js },
    languageOptions: { globals: { v: true } },
  },
  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-magic-numbers": "warn",
      "no-unused-vars": "warn",
    },
  },

  {
    plugins: {
      "simple-import-sort": simpleImportSortPlugin,
    },
    rules: {
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
    },
  },

  {
    files: ["**/*.{test,spec}.{js,mjs,cjs,jsx,ts,mts,cts,tsx}", "**/test/**"],
    rules: {
      "no-magic-numbers": "off",
    },
  },
])
