import {
  VITE_PLUGIN_PWA_VERSION,
  VITE_PWA_ASSETS_GENERATOR_VERSION,
  WORKBOX_WINDOW_VERSION,
} from "@inglorious/create-app/bin/lib/constants.js"
import { createVitePwaConfig } from "@inglorious/create-app/bin/lib/pwa.js"
import fs from "fs"
import { EOL } from "os"
import path from "path"

const BACKGROUND_COLOR = "#1d1f33"

const ALIAS = `  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },`

const BABEL_PLUGINS = {
  ijs: `babel({
      include: "src/**",
      filter: /\\.(js|ijs)$/,
      babelConfig: {
        presets: ["@inglorious/inglorious-script"],
      },
    })`,
  its: `babel({
      include: "src/**",
      filter: /\\.(js|ijs|ts|its)$/,
      babelConfig: {
        presets: [
          "@inglorious/inglorious-script",
          [
            "@babel/preset-typescript",
            {
              isTSX: false,
              allExtensions: true,
              onlyRemoveTypeImports: true,
            },
          ],
        ],
      },
    })`,
}

/**
 * Writes the game's `vite.config.js`, which Vitest reads too.
 *
 * @param {string} targetDir
 * @param {{ template: string, appName: string, pwa: boolean }} options
 */
export function writeViteConfig(targetDir, { template, appName, pwa }) {
  const imports = []
  const plugins = []

  if (BABEL_PLUGINS[template]) {
    imports.push(`import babel from "vite-plugin-babel"`)
    plugins.push(BABEL_PLUGINS[template])
  }

  if (pwa) {
    imports.push(`import { VitePWA } from "vite-plugin-pwa"`)
    plugins.push(
      createVitePwaConfig(appName, {
        description: "An Inglorious Engine game.",
        registerType: "autoUpdate",
        color: BACKGROUND_COLOR,
        display: "fullscreen",
      }),
    )
  }

  imports.unshift(`import { fileURLToPath } from "node:url"${EOL}`)
  imports.push(`import { defineConfig } from "vitest/config"`)

  const pluginsSource = plugins.length
    ? `  plugins: [${EOL}${plugins.map((plugin) => `    ${plugin},`).join(EOL)}${EOL}  ],${EOL}${EOL}`
    : ""

  fs.writeFileSync(
    path.join(targetDir, "vite.config.js"),
    `${imports.join(EOL)}${EOL}${EOL}export default defineConfig({${EOL}${pluginsSource}${ALIAS}${EOL}${EOL}  test: { environment: "jsdom" },${EOL}})${EOL}`,
  )
}

/**
 * Makes the game installable and playable offline, updating itself in the
 * background. Inside the Capacitor app the files are already on the phone, so
 * no service worker is registered there.
 *
 * @param {string} targetDir
 * @param {object} pkg - The package.json being built.
 * @param {{ isTypeScript: boolean, mobile: boolean }} options
 */
export function addPwaSupport(targetDir, pkg, { isTypeScript, mobile }) {
  pkg.devDependencies["vite-plugin-pwa"] = VITE_PLUGIN_PWA_VERSION
  pkg.devDependencies["@vite-pwa/assets-generator"] =
    VITE_PWA_ASSETS_GENERATOR_VERSION
  pkg.devDependencies["workbox-window"] = WORKBOX_WINDOW_VERSION

  const ext = isTypeScript ? "ts" : "js"
  const reference = isTypeScript
    ? `/// <reference types="vite-plugin-pwa/vanillajs" />${EOL}`
    : ""
  const imports = mobile
    ? `import { Capacitor } from "@capacitor/core"${EOL}import { registerSW } from "virtual:pwa-register"`
    : `import { registerSW } from "virtual:pwa-register"`
  const register = mobile
    ? `if (!Capacitor.isNativePlatform()) registerSW({ immediate: true })`
    : `registerSW({ immediate: true })`

  fs.writeFileSync(
    path.join(targetDir, `src/pwa.${ext}`),
    `${reference}${imports}${EOL}${EOL}${register}${EOL}`,
  )

  const mainPath = path.join(targetDir, `src/main.${ext}`)
  const main = fs.readFileSync(mainPath, "utf-8")
  fs.writeFileSync(mainPath, `import "./pwa.${ext}"${EOL}${EOL}${main}`)

  const readmePath = path.join(targetDir, "README.md")
  const readme = fs.readFileSync(readmePath, "utf-8")
  fs.writeFileSync(readmePath, `${readme.trimEnd()}${EOL}${EOL}${PWA_README}`)
}

const PWA_README = `## Install and play offline

The game is a Progressive Web App: once deployed over HTTPS, browsers offer to install it, and it then opens fullscreen and plays without a connection. \`pnpm build\` makes the icons from \`public/logo.png\` and the service worker; \`pnpm preview\` serves the build to try it locally. A new deploy reaches players on their next visit. The name and colors are in \`VitePWA\` in \`vite.config.js\`.
`
