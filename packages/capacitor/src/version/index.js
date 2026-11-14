import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"

const PLATFORMS = [
  {
    file: path.join("ios", "App", "App.xcodeproj", "project.pbxproj"),
    builds: (source) =>
      [...source.matchAll(/CURRENT_PROJECT_VERSION = (\d+);/g)].map(
        ([, build]) => build,
      ),
    update: (source, version, build) =>
      source
        .replaceAll(
          /CURRENT_PROJECT_VERSION = \d+;/g,
          `CURRENT_PROJECT_VERSION = ${build};`,
        )
        .replaceAll(
          /MARKETING_VERSION = [^;]+;/g,
          `MARKETING_VERSION = ${version};`,
        ),
  },
  {
    file: path.join("android", "app", "build.gradle"),
    builds: (source) =>
      [...source.matchAll(/versionCode (\d+)/g)].map(([, build]) => build),
    update: (source, version, build) =>
      source
        .replace(/versionCode \d+/, `versionCode ${build}`)
        .replace(/versionName "[^"]*"/, `versionName "${version}"`),
  },
]

const NO_BUILD = 0
const NEXT = 1

/**
 * Gets the native projects ready for a store upload: copies the version in
 * `package.json` into both, and raises the build number they share past the
 * highest either has, since every upload needs a new one.
 *
 * @param {{ root?: string }} [options]
 * @returns {{ name: string, version: string, build: number }}
 */
export function nativeVersion({ root = process.cwd() } = {}) {
  const { name, version } = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8"),
  )

  // The App Store only takes up to three numbers, with no pre-release tag.
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(
      `Version ${version} must be MAJOR.MINOR.PATCH for the stores`,
    )
  }

  const platforms = PLATFORMS.map((platform) => ({
    ...platform,
    file: path.join(root, platform.file),
  }))
    .filter(({ file }) => existsSync(file))
    .map((platform) => ({
      ...platform,
      source: readFileSync(platform.file, "utf8"),
    }))
  if (!platforms.length) {
    throw new Error("No native project found: run mobile:init:ios or :android")
  }

  const builds = platforms.flatMap(({ source, builds }) => builds(source))
  const build = Math.max(NO_BUILD, ...builds.map(Number)) + NEXT

  for (const { file, source, update } of platforms) {
    writeFileSync(file, update(source, version, build))
  }

  return { name, version, build }
}
