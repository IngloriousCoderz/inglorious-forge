import { existsSync, mkdirSync, readFileSync } from "node:fs"
import path from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"

import sharp from "sharp"

import { ASSET_DEFAULTS, findLogo } from "../assets/index.js"
import { readSettings } from "../config.js"
import { resolveDevices, screenUrl } from "./devices.js"
import { PROMO_FORMATS, promoHtml } from "./promo.js"

const CONFIG_FILES = ["listing.config.js", "listing.config.mjs"]
const DEFAULTS = {
  url: "http://localhost:5173",
  out: "listing-assets",
  browser: "chrome",
  settle: 1000,
}
const PROMO_SHOTS = 2
const LANGUAGE_TIMEOUT = 5000
const FIRST = 0
const PLAY_ICON_SIZE = 512

/**
 * Makes what the stores ask for besides the app: screenshots of the running
 * app at each store size and in each locale, the promotional images (Google
 * Play's feature graphic, a header and a search results card) in each locale,
 * and Google Play's 512px icon. The screens, the locales and how to sign in
 * come from `listing.config.js`; the logo and colours from `native.assets`.
 *
 * @param {{ root?: string }} [options]
 * @returns {Promise<string>} The folder written to.
 */
export async function listingAssets({ root = process.cwd() } = {}) {
  const settings = await readSettings(root, {})
  const config = { ...DEFAULTS, ...(await readListingConfig(root)) }
  const assets = { ...ASSET_DEFAULTS, ...settings.assets }
  const logo = findLogo(root, assets)
  const out = path.join(root, config.out)
  const locales = config.locales?.length ? config.locales : [null]
  const devices = resolveDevices(config.devices)

  await assertReachable(config.url)
  mkdirSync(out, { recursive: true })

  const { chromium } = await import("playwright-core")
  const browser = await chromium.launch({ channel: config.browser })
  try {
    for (const locale of locales) {
      let session
      for (const [device, { viewport, scale }] of devices) {
        const dir = path.join(out, device, locale ?? "")
        mkdirSync(dir, { recursive: true })
        const context = await browser.newContext({
          viewport,
          deviceScaleFactor: scale,
          isMobile: true,
          hasTouch: true,
          ...(locale && { locale }),
          ...(session && { storageState: session }),
        })
        await context.addInitScript(
          storageScript,
          storageEntries(config.storage, locale),
        )
        const page = await context.newPage()
        if (config.signIn && !session) {
          await config.signIn(page, { url: config.url, locale })
          session = await context.storageState()
        }
        for (const screen of config.screens ?? []) {
          await page.goto(
            screenUrl(config.url, screen.path, {
              locale,
              localeParam: config.localeParam,
            }),
          )
          await page.waitForLoadState("networkidle")
          await page.waitForTimeout(config.settle)
          if (locale) await assertLanguage(page, locale, screen.name)
          if (screen.prepare) await screen.prepare(page, { locale })
          await page.screenshot({ path: path.join(dir, `${screen.name}.png`) })
        }
        await context.close()
      }
    }

    const promo = config.promo ?? {}
    const promoDevice = promo.device ?? defaultPromoDevice(devices)
    const promoScreens =
      promo.screens ??
      (config.screens ?? []).slice(FIRST, PROMO_SHOTS).map(({ name }) => name)
    for (const locale of locales) {
      const options = {
        logo: dataUrl(logo),
        name: settings.appName,
        tagline: localized(promo.tagline, locale),
        subtitle: localized(promo.subtitle, locale),
        shots: promoScreens.map((name) =>
          dataUrl(path.join(out, promoDevice, locale ?? "", `${name}.png`)),
        ),
        background: promo.background ?? assets.background,
        color: promo.color,
        accent: promo.accent,
        font: promo.font,
      }
      for (const [format, { width, height, scale }] of Object.entries(
        PROMO_FORMATS,
      )) {
        const page = await browser.newPage({
          viewport: { width, height },
          deviceScaleFactor: scale,
        })
        await page.setContent(promoHtml(format, options))
        await page.waitForLoadState("load")
        await page.screenshot({
          path: path.join(
            out,
            locale ? `${format}-${locale}.png` : `${format}.png`,
          ),
        })
        await page.close()
      }
    }
  } finally {
    await browser.close()
  }

  await playIcon(logo, assets, path.join(out, "icon-512.png"))
  return out
}

async function assertLanguage(page, locale, screen) {
  try {
    await page.waitForFunction(
      (expected) => {
        const { lang } = globalThis.document.documentElement
        return !lang || lang === expected || lang.startsWith(`${expected}-`)
      },
      locale,
      { timeout: LANGUAGE_TIMEOUT },
    )
  } catch {
    const lang = await page.evaluate(
      () => globalThis.document.documentElement.lang,
    )
    throw new Error(
      `${screen} shows "${lang}" instead of "${locale}": check localeParam, or choose the language in signIn`,
    )
  }
}

function defaultPromoDevice(devices) {
  const [[first]] = devices
  const [iphone] = devices.find(([name]) => name.startsWith("iphone")) ?? []
  return iphone ?? first
}

async function readListingConfig(root) {
  const file = CONFIG_FILES.map((name) => path.join(root, name)).find(
    (candidate) => existsSync(candidate),
  )
  if (!file) {
    throw new Error(
      `No listing config found: add listing.config.js with the screens to capture`,
    )
  }
  const { default: config } = await import(pathToFileURL(file).href)
  return config
}

async function assertReachable(url) {
  try {
    await fetch(url)
  } catch {
    throw new Error(`Nothing answers at ${url}: start the app first`)
  }
}

function storageEntries(storage, locale) {
  const values = typeof storage === "function" ? storage(locale) : storage
  return Object.entries(values ?? {}).map(([key, value]) => [
    key,
    typeof value === "string" ? value : JSON.stringify(value),
  ])
}

function storageScript(entries) {
  for (const [key, value] of entries) localStorage.setItem(key, value)
}

function localized(value, locale) {
  if (value == null || typeof value === "string") return value ?? ""
  const [first = ""] = Object.values(value)
  return value[locale] ?? first
}

function dataUrl(file) {
  const type = file.endsWith(".svg") ? "image/svg+xml" : "image/png"
  return `data:${type};base64,${readFileSync(file).toString("base64")}`
}

async function playIcon(logo, { background, iconScale }, file) {
  const mark = await sharp(readFileSync(logo))
    .resize(Math.round(PLAY_ICON_SIZE * iconScale))
    .png()
    .toBuffer()
  await sharp({
    create: {
      width: PLAY_ICON_SIZE,
      height: PLAY_ICON_SIZE,
      channels: 4,
      background,
    },
  })
    .composite([{ input: mark, gravity: "centre" }])
    .png()
    .toFile(file)
}
