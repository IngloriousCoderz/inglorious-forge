import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { EOL } from "node:os"
import path from "node:path"
import process from "node:process"

import { Logger, MobileProject } from "@trapezedev/project"

import { readSettings } from "../config.js"
import { configureAndroid } from "./android.js"
import { configureIos } from "./ios.js"
import { appSiteAssociation, assetLinks } from "./well-known.js"

const INDENTATION = 2
const PLATFORMS = ["android", "ios"]
const WELL_KNOWN = path.join("public", ".well-known")

Logger.debug = () => {}

/**
 * Applies the `native` settings in `package.json` to the native projects that
 * exist, and writes the files the app's domain serves for App Links. Safe to
 * run any number of times: it runs after every `cap sync`.
 *
 * @param {{ root?: string, env?: NodeJS.ProcessEnv }} [options]
 * @returns {Promise<string[]>} The platforms it configured.
 */
export async function configure({
  root = process.cwd(),
  env = process.env,
} = {}) {
  const settings = await readSettings(root, env)
  writeWellKnown(settings)

  const requested = env.CAPACITOR_PLATFORM_NAME
    ? [env.CAPACITOR_PLATFORM_NAME]
    : PLATFORMS
  const platforms = requested.filter(
    (platform) =>
      PLATFORMS.includes(platform) && existsSync(path.join(root, platform)),
  )
  if (!platforms.length) return []

  const project = new MobileProject(root, {
    android: platforms.includes("android") ? { path: "android" } : undefined,
    ios: platforms.includes("ios")
      ? { path: path.join("ios", "App") }
      : undefined,
  })
  await project.load()

  if (platforms.includes("android")) configureAndroid(project, settings)
  if (platforms.includes("ios")) await configureIos(project, settings)

  await project.commit()
  return platforms
}

function writeWellKnown(settings) {
  if (!settings.appLinks) return

  const dir = path.join(settings.root, WELL_KNOWN)
  if (settings.ios.teamId) {
    writeJson(
      path.join(dir, "apple-app-site-association"),
      appSiteAssociation({
        appId: settings.appId,
        teamId: settings.ios.teamId,
        appLinks: settings.appLinks,
      }),
    )
  }
  if (settings.android.sha256.length) {
    writeJson(
      path.join(dir, "assetlinks.json"),
      assetLinks({
        appId: settings.appId,
        sha256: settings.android.sha256,
      }),
    )
  }
}

function writeJson(file, value) {
  if (existsSync(file) && isSameJson(readFileSync(file, "utf8"), value)) return
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(value, null, INDENTATION) + EOL)
}

function isSameJson(source, value) {
  try {
    return JSON.stringify(JSON.parse(source)) === JSON.stringify(value)
  } catch {
    return false
  }
}
