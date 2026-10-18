import fs from "fs"
import { EOL } from "os"
import path from "path"

import {
  VITE_PLUGIN_PWA_VERSION,
  VITE_PWA_ASSETS_GENERATOR_VERSION,
  WORKBOX_WINDOW_VERSION,
} from "./constants.js"
import { findMainPath, findViteConfigPath, injectAfterImport } from "./file.js"

export function addPwaSupport(targetDir, pkg, projectName) {
  pkg.devDependencies ??= {}
  pkg.devDependencies["vite-plugin-pwa"] = VITE_PLUGIN_PWA_VERSION
  pkg.devDependencies["@vite-pwa/assets-generator"] =
    VITE_PWA_ASSETS_GENERATOR_VERSION
  pkg.devDependencies["workbox-window"] = WORKBOX_WINDOW_VERSION

  const publicDir = path.join(targetDir, "public")
  fs.mkdirSync(publicDir, { recursive: true })

  injectPwaPluginConfig(targetDir, projectName)
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

export function injectPwaPluginConfig(targetDir, projectName) {
  const viteConfigPath = findViteConfigPath(targetDir)

  if (!viteConfigPath) {
    return
  }

  let viteConfig = fs.readFileSync(viteConfigPath, "utf-8")

  if (!viteConfig.includes("vite-plugin-pwa")) {
    // Right after the image optimizer, where the imports' alphabetical order
    // puts it.
    viteConfig = injectAfterImport(
      viteConfig,
      viteConfig.includes("vite-plugin-image-optimizer")
        ? "vite-plugin-image-optimizer"
        : "vite",
      `import { VitePWA } from "vite-plugin-pwa"`,
    )
  }

  if (!viteConfig.includes("VitePWA(")) {
    // One plugin per line, as Prettier prints a list this long.
    viteConfig = viteConfig.replace(
      /plugins: \[(.*)\],/,
      (_, plugins) =>
        `plugins: [${EOL}${[
          createVitePwaConfig(projectName),
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
  if (extension === ".ts") {
    return `/// <reference types="vite-plugin-pwa/client" />
import { isNative } from "@inglorious/web/mobile"
import { registerSW } from "virtual:pwa-register"

if (!isNative()) {
  registerSW()
}
`
  }

  return `import { isNative } from "@inglorious/web/mobile"
import { registerSW } from "virtual:pwa-register"

if (!isNative()) {
  registerSW()
}
`
}

export function createVitePwaConfig(projectName) {
  return `VitePWA({
      injectRegister: false,
      registerType: "autoUpdate",
      pwaAssets: {
        image: "public/logo.png",
        preset: "minimal-2023",
      },
      manifest: {
        name: "${projectName}",
        short_name: "${projectName}",
        description: "An Inglorious Web app.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
      },
    })`
}

// The plugins of a one-line `plugins: [a(), b({ c: 1 })]`, split at the
// top-level commas.
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

// A side-effect import goes with the others at the top, in the order they
// come, as eslint-plugin-simple-import-sort keeps them.
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
