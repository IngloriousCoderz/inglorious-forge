import browserConfig from "@inglorious/eslint-config/browser"
import typescriptConfig from "@inglorious/eslint-config/typescript"

export default [
  { ignores: ["dist/**"] },
  ...browserConfig,
  ...typescriptConfig,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: { tsconfigRootDir: import.meta.dirname },
    },
  },
  { rules: { "no-magic-numbers": "off" } },
]
