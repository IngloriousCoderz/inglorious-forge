import fs from "fs"
import path from "path"

import { escapeRegExp } from "./file.js"
import { latestVersion } from "./versions.js"

/**
 * Points a no-build template's import map at the latest published versions
 * of the given packages, so the page loads the code it was scaffolded with.
 *
 * @param {string} targetDir
 * @param {string[]} packageNames
 * @param {(name: string) => void} [onFetch] - Called before each lookup.
 */
export function pinCdnVersions(targetDir, packageNames, onFetch) {
  const htmlPath = path.join(targetDir, "index.html")
  let html = fs.readFileSync(htmlPath, "utf-8")

  for (const packageName of packageNames) {
    onFetch?.(packageName)
    const version = latestVersion(packageName)
    if (!version) continue

    html = html.replace(
      new RegExp(`${escapeRegExp(packageName)}@[^/]+/`, "g"),
      `${packageName}@${version}/`,
    )
  }

  fs.writeFileSync(htmlPath, html)
}
