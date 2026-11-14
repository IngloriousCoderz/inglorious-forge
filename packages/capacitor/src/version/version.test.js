import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { nativeVersion } from "./index.js"

const FIXTURES = fileURLToPath(
  new URL("../configure/fixtures", import.meta.url),
)
const PBXPROJ = path.join("ios", "App", "App.xcodeproj", "project.pbxproj")
const GRADLE = path.join("android", "app", "build.gradle")

describe("nativeVersion", () => {
  let root

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), "inglorious-capacitor-version-"))
    cpSync(FIXTURES, root, { recursive: true })
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("copies the version and raises the shared build number", () => {
    writeVersion(root, "1.4.0")
    const highest = Math.max(...builds(root))

    const result = nativeVersion({ root })

    expect(result).toEqual({
      name: "app",
      version: "1.4.0",
      build: highest + 1,
    })
    const pbxproj = readFileSync(path.join(root, PBXPROJ), "utf8")
    const gradle = readFileSync(path.join(root, GRADLE), "utf8")
    expect(pbxproj).toContain(`CURRENT_PROJECT_VERSION = ${highest + 1};`)
    expect(pbxproj).toContain("MARKETING_VERSION = 1.4.0;")
    expect(gradle).toContain(`versionCode ${highest + 1}`)
    expect(gradle).toContain('versionName "1.4.0"')
  })

  it("refuses a version the App Store wouldn't take", () => {
    writeVersion(root, "1.4.0-beta.1")

    expect(() => nativeVersion({ root })).toThrow("MAJOR.MINOR.PATCH")
  })

  it("asks for a native project when there is none", () => {
    rmSync(path.join(root, "ios"), { recursive: true })
    rmSync(path.join(root, "android"), { recursive: true })
    writeVersion(root, "1.0.0")

    expect(() => nativeVersion({ root })).toThrow("No native project found")
  })
})

function writeVersion(root, version) {
  writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify({ name: "app", version }),
  )
}

function builds(root) {
  const pbxproj = readFileSync(path.join(root, PBXPROJ), "utf8")
  const gradle = readFileSync(path.join(root, GRADLE), "utf8")
  return [
    ...[...pbxproj.matchAll(/CURRENT_PROJECT_VERSION = (\d+);/g)],
    ...[...gradle.matchAll(/versionCode (\d+)/g)],
  ].map(([, build]) => Number(build))
}
