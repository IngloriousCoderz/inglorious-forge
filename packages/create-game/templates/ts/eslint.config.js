import browserConfig from "@inglorious/eslint-config/browser"
import typescriptConfig from "@inglorious/eslint-config/typescript"

export default [
  { ignores: ["dist/**"] },
  ...browserConfig,
  ...typescriptConfig,
  {
    rules: {
      "no-magic-numbers": "off",
      "@typescript-eslint/no-magic-numbers": "off",
    },
  },
]
