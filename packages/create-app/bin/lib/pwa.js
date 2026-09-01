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
    main = injectAfterImport(main, "@inglorious/web", `import "./pwa"`)
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
    viteConfig = injectAfterImport(
      viteConfig,
      "vite",
      `import { VitePWA } from "vite-plugin-pwa"`,
    )
  }

  if (!viteConfig.includes("VitePWA(")) {
    viteConfig = viteConfig.replace(
      /plugins: \[/,
      `plugins: [${EOL}    ${createVitePwaConfig(projectName)},`,
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
