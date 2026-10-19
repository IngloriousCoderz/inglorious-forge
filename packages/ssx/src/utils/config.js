import { existsSync } from "node:fs"
import path from "node:path"
import { pathToFileURL } from "node:url"

import { runnerImport } from "vite"

/**
 * Loads the site config from `src/`. A TypeScript config is loaded through
 * Vite, as the pages are, so it can import other TypeScript modules.
 * Without a config file, the defaults apply.
 */
export async function loadConfig(options) {
  const { rootDir = ".", configPath = "site.config.js" } = options
  const configFile = path.resolve(rootDir, "src", configPath)

  if (!existsSync(configFile)) {
    return {} // Default config
  }

  const config = /\.[cm]?ts$/.test(configFile)
    ? (
        await runnerImport(configFile, {
          root: path.resolve(rootDir),
          configFile: false,
          logLevel: "error",
        })
      ).module
    : await import(pathToFileURL(configFile).href)

  return config.default || config
}
