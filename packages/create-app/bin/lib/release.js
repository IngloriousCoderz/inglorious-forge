import fs from "fs"
import { EOL } from "os"
import path from "path"

import { CHANGESETS_VERSION, INDENTATION } from "./constants.js"

const CHANGESET_CONFIG = {
  $schema: "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  changelog: "@changesets/cli/changelog",
  commit: false,
  fixed: [],
  linked: [],
  access: "restricted",
  baseBranch: "main",
  updateInternalDependencies: "patch",
  ignore: [],
}

const CHANGESET_README = `# Changesets

Each file here describes a change for the next release. Add one with
\`pnpm changeset\`; \`pnpm release:version\` turns them into a new version in
\`package.json\` and an entry in \`CHANGELOG.md\`.
`

/**
 * Versions the app with Changesets: \`package.json\` holds the version, which
 * the Vite config hands to the app as \`import.meta.env.VITE_APP_VERSION\`.
 *
 * @param {string} targetDir
 * @param {object} pkg - The package.json being built.
 */
export function addReleaseSupport(targetDir, pkg) {
  pkg.devDependencies ??= {}
  pkg.scripts ??= {}

  pkg.devDependencies["@changesets/cli"] = CHANGESETS_VERSION
  pkg.scripts.changeset = "changeset"
  pkg.scripts["release:version"] = "changeset version"

  const dir = path.join(targetDir, ".changeset")
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(
    path.join(dir, "config.json"),
    JSON.stringify(CHANGESET_CONFIG, null, INDENTATION) + EOL,
  )
  fs.writeFileSync(path.join(dir, "README.md"), CHANGESET_README)
}
