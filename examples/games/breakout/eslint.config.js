import base from "@inglorious/eslint-config/browser"

export default [
  { ignores: [".smoke/**", ".d/**", "dist/**"] },
  ...base,
  {
    // Harnesses and scripts run in node rather than in the browser.
    files: ["scripts/**/*.mjs", "*-setup.js", "smoke.js"],
    languageOptions: { globals: { process: "readonly" } },
    rules: { "no-console": "off" },
  },
]
