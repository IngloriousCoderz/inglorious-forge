import fs from "fs"
import path from "path"

const DEPENDABOT_CONFIG = `version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    # One pull request a week for Inglorious Forge, one for everything else.
    groups:
      inglorious:
        patterns: ["@inglorious/*"]
      dependencies:
        patterns: ["*"]
`

/**
 * Keeps the app's dependencies current with weekly Dependabot pull requests,
 * grouped so each week brings two at most instead of one per package.
 *
 * @param {string} targetDir
 */
export function addDependabot(targetDir) {
  const dir = path.join(targetDir, ".github")
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, "dependabot.yml"), DEPENDABOT_CONFIG)
}
