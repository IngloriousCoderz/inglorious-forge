import fs from "fs"
import { EOL } from "os"
import path from "path"

import {
  VITE_PLUGIN_PWA_VERSION,
  VITE_PWA_ASSETS_GENERATOR_VERSION,
  WORKBOX_WINDOW_VERSION,
} from "./constants.js"
import { findMainPath, findViteConfigPath, injectAfterImport } from "./file.js"

export function addPwaSupport(targetDir, pkg, appName, { push = false } = {}) {
  pkg.devDependencies ??= {}
  pkg.devDependencies["vite-plugin-pwa"] = VITE_PLUGIN_PWA_VERSION
  pkg.devDependencies["@vite-pwa/assets-generator"] =
    VITE_PWA_ASSETS_GENERATOR_VERSION
  pkg.devDependencies["workbox-window"] = WORKBOX_WINDOW_VERSION

  const publicDir = path.join(targetDir, "public")
  fs.mkdirSync(publicDir, { recursive: true })

  injectPwaPluginConfig(targetDir, appName, { push })
  writePwaRegistration(targetDir)
  injectServiceWorkerRegistration(targetDir)
}

export function injectServiceWorkerRegistration(targetDir) {
  const mainPath = findMainPath(targetDir)

  if (!mainPath) {
    return
  }

  let main = fs.readFileSync(mainPath, "utf-8")

  if (!main.includes("./pwa")) {
    main = injectSideEffectImport(main, `import "./pwa"`)
  }

  fs.writeFileSync(mainPath, main)
}

export function injectPwaPluginConfig(
  targetDir,
  appName,
  { push = false } = {},
) {
  const viteConfigPath = findViteConfigPath(targetDir)

  if (!viteConfigPath) {
    return
  }

  let viteConfig = fs.readFileSync(viteConfigPath, "utf-8")

  if (!viteConfig.includes("vite-plugin-pwa")) {
    viteConfig = injectAfterImport(
      viteConfig,
      viteConfig.includes("vite-plugin-image-optimizer")
        ? "vite-plugin-image-optimizer"
        : "vite",
      `import { VitePWA } from "vite-plugin-pwa"`,
    )
  }

  if (!viteConfig.includes("VitePWA(")) {
    viteConfig = viteConfig.replace(
      /plugins: \[(.*)\],/,
      (_, plugins) =>
        `plugins: [${EOL}${[
          createVitePwaConfig(appName, { push }),
          ...splitPlugins(plugins),
        ]
          .map((plugin) => `    ${plugin},`)
          .join(EOL)}${EOL}  ],`,
    )
  }

  fs.writeFileSync(viteConfigPath, viteConfig)
}

export function writePwaRegistration(targetDir) {
  const mainPath = findMainPath(targetDir)

  if (!mainPath) {
    return
  }

  const extension = path.extname(mainPath)
  const pwaPath = path.join(targetDir, `src/pwa${extension}`)

  fs.writeFileSync(pwaPath, createPwaRegistrationSource(extension))
}

export function createPwaRegistrationSource(extension) {
  const registration = `import { isNative } from "@inglorious/web/native"
import { registerSW } from "virtual:pwa-register"

// The PwaUpdate type in the store keeps the installed app on this worker's
// latest version.
if (!isNative()) registerSW()
`

  if (extension === ".ts") {
    return `// Only the framework-free helpers: "client" also loads React's and Preact's
// typings, whose global JSX would replace Inglorious's.
/// <reference types="vite-plugin-pwa/vanillajs" />
${registration}`
  }

  return registration
}

/**
 * @param {string} appName
 * @param {{ push?: boolean, description?: string, registerType?: "prompt" | "autoUpdate", color?: string, display?: string, orientation?: string }} [options]
 */
export function createVitePwaConfig(
  appName,
  {
    push = false,
    description = "An Inglorious Web app.",
    registerType = "prompt",
    color = "#ffffff",
    display = "standalone",
    orientation,
  } = {},
) {
  const workbox = push
    ? `
      workbox: {
        importScripts: ["sw-push.js"],
      },`
    : ""
  return `VitePWA({
      injectRegister: false,
      registerType: "${registerType}",
      pwaAssets: {
        image: "public/logo.png",
        preset: "minimal-2023",
      },
      manifest: {
        name: "${appName}",
        short_name: "${appName}",
        description: "${description}",
        theme_color: "${color}",
        background_color: "${color}",
        display: "${display}",${
          orientation
            ? `
        orientation: "${orientation}",`
            : ""
        }
        start_url: "/",
      },${workbox}
    })`
}

function splitPlugins(source) {
  const plugins = []
  let depth = 0
  let current = ""
  for (const char of source) {
    if ("([{".includes(char)) depth++
    if (")]}".includes(char)) depth--
    if (char === "," && !depth) {
      plugins.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  if (current.trim()) plugins.push(current.trim())
  return plugins
}

function injectSideEffectImport(source, newImport) {
  const lastSideEffect = source
    .split(EOL)
    .findLast((line) => /^import ["']/.test(line))
  if (lastSideEffect) {
    return source.replace(
      `${lastSideEffect}${EOL}`,
      `${lastSideEffect}${EOL}${newImport}${EOL}`,
    )
  }
  return `${newImport}${EOL}${EOL}${source}`
}
