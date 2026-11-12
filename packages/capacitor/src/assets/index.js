import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import process from "node:process"

import sharp from "sharp"

import { readSettings } from "../config.js"

const LOGOS = ["public/logo.svg", "public/logo.png"]
const SOURCES = path.join(
  "node_modules",
  ".cache",
  "inglorious-capacitor",
  "assets",
)
const PLATFORMS = ["ios", "android"]
export const ASSET_DEFAULTS = {
  background: "#ffffff",
  backgroundDark: "#121212",
  iconScale: 0.6,
  splashScale: 0.3,
}
const ICON_SIZE = 1024
const SPLASH_SIZE = 2732
const TRANSPARENT = "#00000000"

/**
 * Makes every app icon and splash screen of the native projects from one
 * logo, centred on the background colours of `native.assets` in
 * `package.json`, in light and dark. The mark is sized from the logo itself,
 * so a new logo needs no new settings.
 *
 * @param {{ root?: string, platforms?: string[] }} [options] Both platforms
 *   that exist by default.
 */
export async function assets({ root = process.cwd(), platforms = [] } = {}) {
  const settings = await readSettings(root, {})
  const options = { ...ASSET_DEFAULTS, ...settings.assets }
  const logo = findLogo(root, options)

  const targets = (platforms.length ? platforms : PLATFORMS).filter(
    (platform) =>
      PLATFORMS.includes(platform) && existsSync(path.join(root, platform)),
  )
  if (!targets.length) {
    throw new Error(
      "No native project found: run mobile:init:ios or mobile:init:android",
    )
  }

  const sources = path.join(root, SOURCES)
  rmSync(sources, { recursive: true, force: true })
  mkdirSync(sources, { recursive: true })
  await composeSources(readFileSync(logo), sources, options)

  execFileSync(
    process.execPath,
    [
      capacitorAssetsBin(),
      "generate",
      ...targets.map((platform) => `--${platform}`),
      "--assetPath",
      SOURCES,
    ],
    { cwd: root, stdio: "inherit" },
  )
}

/**
 * @param {string} root
 * @param {{ logo?: string }} options
 * @returns {string} The logo's full path.
 */
export function findLogo(root, { logo } = {}) {
  const file =
    logo ?? LOGOS.find((candidate) => existsSync(path.join(root, candidate)))
  if (!file || !existsSync(path.join(root, file))) {
    throw new Error(
      `No logo found: add ${LOGOS.join(" or ")}, or set native.assets.logo`,
    )
  }
  return path.join(root, file)
}

/**
 * The sources `@capacitor/assets` expects, so it never scales the logo itself:
 * it would size the splash from the image's width, not the mark's.
 */
async function composeSources(
  logo,
  dir,
  { background, backgroundDark, iconScale, splashScale },
) {
  const mark = (canvas, scale) =>
    sharp(logo)
      .resize(Math.round(canvas * scale))
      .png()
      .toBuffer()

  const canvas = (size, color) =>
    sharp({
      create: { width: size, height: size, channels: 4, background: color },
    })

  const icon = await mark(ICON_SIZE, iconScale)
  await canvas(ICON_SIZE, background)
    .composite([{ input: icon, gravity: "centre" }])
    .png()
    .toFile(path.join(dir, "icon-only.png"))
  await canvas(ICON_SIZE, TRANSPARENT)
    .composite([{ input: icon, gravity: "centre" }])
    .png()
    .toFile(path.join(dir, "icon-foreground.png"))
  await canvas(ICON_SIZE, background)
    .png()
    .toFile(path.join(dir, "icon-background.png"))

  const splash = await mark(SPLASH_SIZE, splashScale)
  for (const [name, color] of [
    ["splash.png", background],
    ["splash-dark.png", backgroundDark],
  ]) {
    await canvas(SPLASH_SIZE, color)
      .composite([{ input: splash, gravity: "centre" }])
      .png()
      .toFile(path.join(dir, name))
  }
}

function capacitorAssetsBin() {
  const require = createRequire(import.meta.url)
  const manifest = require.resolve("@capacitor/assets/package.json")
  const { bin } = JSON.parse(readFileSync(manifest, "utf8"))
  return path.join(path.dirname(manifest), bin["capacitor-assets"])
}
