import fs from "fs"
import { EOL } from "os"
import path from "path"

import { HUSKY_VERSION, LINT_STAGED_VERSION } from "./constants.js"

const LINT_STAGED_CONFIG = {
  "*.{js,jsx,ts,tsx,mjs,cjs,vue,ijs,its}": [
    "eslint --fix --max-warnings=0 --no-warn-ignored",
    "prettier --write",
  ],
  "*.{json,md,css,scss,html,yml,yaml}": "prettier --write",
}

const PRE_PUSH_SCRIPTS = ["typecheck", "test"]

function readmeSection(checks) {
  const prePush = checks.length
    ? ` Before every push, ${checks.map((name) => `\`pnpm ${name}\``).join(" and ")} must pass.`
    : ""
  return `## Git hooks

\`pnpm install\` sets up Git hooks with Husky. Before every commit, the staged files are formatted with Prettier and linted with ESLint, and the commit stops while a warning is left.${prePush} Run \`git init\` before \`pnpm install\`, or \`pnpm prepare\` after it, so the hooks are installed.`
}

/**
 * Lints and formats staged files before every commit and runs the checks
 * before every push, with Husky and lint-staged. Call after the scripts the
 * pre-push hook runs are in `pkg`.
 *
 * @param {string} targetDir
 * @param {object} pkg - The package.json being built.
 */
export function addGitHooks(targetDir, pkg) {
  pkg.devDependencies ??= {}
  pkg.scripts ??= {}
  pkg.devDependencies.husky = HUSKY_VERSION
  pkg.devDependencies["lint-staged"] = LINT_STAGED_VERSION
  pkg.scripts.prepare = "husky"
  pkg["lint-staged"] = LINT_STAGED_CONFIG

  const dir = path.join(targetDir, ".husky")
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, "pre-commit"), `pnpm exec lint-staged${EOL}`)

  const checks = PRE_PUSH_SCRIPTS.filter((name) => pkg.scripts[name])
  if (checks.length) {
    fs.writeFileSync(
      path.join(dir, "pre-push"),
      checks.map((name) => `pnpm ${name}`).join(" && ") + EOL,
    )
  }

  const readmePath = path.join(targetDir, "README.md")
  if (!fs.existsSync(readmePath)) return
  const readme = fs.readFileSync(readmePath, "utf-8")
  fs.writeFileSync(
    readmePath,
    `${readme.trimEnd()}${EOL}${EOL}${readmeSection(checks)}${EOL}`,
  )
}
