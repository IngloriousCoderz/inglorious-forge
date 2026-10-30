import base from "@inglorious/eslint-config/browser"

export default [
  { ignores: ["dist/**"] },
  ...base,
  {
    rules: {
      "no-magic-numbers": "off",
    },
  },
]
