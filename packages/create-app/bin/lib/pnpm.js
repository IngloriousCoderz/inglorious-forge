import fs from "fs"
import path from "path"

const RELEASE_AGE = `# Inglorious packages are used the day they are published.
minimumReleaseAgeExclude:
  - "@inglorious/*"
`

const FIREBASE_BUILDS = `
allowBuilds:
  "@firebase/util": true
  protobufjs: true
`

/**
 * The pnpm settings the app needs to install: Inglorious packages are taken
 * however recent, and Firebase's install scripts are allowed to run.
 *
 * @param {string} targetDir
 * @param {{ firebase?: boolean }} [options]
 */
export function addPnpmSettings(targetDir, { firebase = false } = {}) {
  fs.writeFileSync(
    path.join(targetDir, "pnpm-workspace.yaml"),
    RELEASE_AGE + (firebase ? FIREBASE_BUILDS : ""),
  )
}
