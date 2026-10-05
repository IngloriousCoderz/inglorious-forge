import base from "@inglorious/eslint-config/browser"

export default [
  { ignores: [".smoke/**", ".d/**", "dist/**"] },
  ...base,
  {
    // A game reads better with its numbers in place than with a name per digit. The
    // rule is kept on for the packages, where a bare 16 is genuinely ambiguous
    // between a tile, a band and an altitude; in a game the surrounding position
    // usually says what the number is.
    rules: { "no-magic-numbers": "off" },
  },
  {
    // Harnesses and scripts run in node rather than in the browser.
    files: ["scripts/**/*.mjs", "*-setup.js", "smoke.js"],
    languageOptions: { globals: { process: "readonly" } },
    rules: { "no-console": "off" },
  },
]
