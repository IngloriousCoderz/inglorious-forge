import { existsSync, readFileSync, writeFileSync } from "node:fs"
import process from "node:process"

const PLATFORMS = [
  {
    file: "ios/App/App.xcodeproj/project.pbxproj",
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
    file: "android/app/build.gradle",
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

const { name, version } = JSON.parse(readFileSync("package.json", "utf8"))

// The App Store only takes up to three numbers, with no pre-release tag.
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error(`Version ${version} must be MAJOR.MINOR.PATCH for the stores`)
}

const platforms = PLATFORMS.filter(({ file }) => existsSync(file)).map(
  (platform) => ({ ...platform, source: readFileSync(platform.file, "utf8") }),
)
if (!platforms.length) {
  throw new Error("No native project found: run mobile:init:ios or :android")
}

const builds = platforms.flatMap(({ source, builds }) => builds(source))
const build = Math.max(NO_BUILD, ...builds.map(Number)) + NEXT

for (const { file, source, update } of platforms) {
  writeFileSync(file, update(source, version, build))
}

process.stdout.write(`${name} ${version}, build ${build}\n`)
