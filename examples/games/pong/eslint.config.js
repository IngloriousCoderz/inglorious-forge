import base from "@inglorious/eslint-config/browser"

export default [
  { ignores: [".smoke/**", ".d/**", "dist/**"] },
  ...base,
  {
    rules: { "no-magic-numbers": "off" },
  },
  {
    files: ["scripts/**/*.mjs", "*-setup.js", "smoke.js"],
    languageOptions: { globals: { process: "readonly" } },
    rules: { "no-console": "off" },
  },
]
