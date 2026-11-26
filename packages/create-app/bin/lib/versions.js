import { execSync } from "child_process"

import { NPM_VIEW_TIMEOUT_MS } from "./constants.js"

/**
 * Replaces every `workspace:` version in the package.json being built with
 * the latest published one.
 *
 * @param {object} pkg - The package.json being built.
 * @param {(name: string) => void} [onFetch] - Called before each lookup.
 */
export function pinWorkspaceVersions(pkg, onFetch) {
  for (const depType of ["dependencies", "devDependencies"]) {
    for (const [name, version] of Object.entries(pkg[depType] ?? {})) {
      if (version.startsWith("workspace:")) {
        onFetch?.(name)
        pkg[depType][name] = latestVersionRange(name)
      }
    }
  }
}

/**
 * The caret range of a package's latest published version, or `latest` when
 * npm can't be reached.
 *
 * @param {string} packageName
 */
export function latestVersionRange(packageName) {
  const version = latestVersion(packageName)
  return version ? `^${version}` : "latest"
}

/**
 * A package's latest published version, or null when npm can't be reached.
 *
 * @param {string} packageName
 */
export function latestVersion(packageName) {
  try {
    return execSync(`npm view ${packageName} version`, {
      encoding: "utf-8",
      stdio: "pipe",
      timeout: NPM_VIEW_TIMEOUT_MS,
    }).trim()
  } catch {
    return null
  }
}
