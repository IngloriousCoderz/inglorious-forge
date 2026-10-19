import path from "node:path"

import { mergeConfig } from "vite"

import { markdownPlugin } from "../utils/markdown.js"

/**
 * Creates a Vite configuration object for the SSX dev server.
 * It sets up the root directory, public directory, aliases, and the virtual file plugin.
 *
 * @param {Object} options - SSX configuration options.
 * @param {string} [options.rootDir="src"] - The source root directory.
 * @param {string} [options.publicDir="public"] - The public assets directory (relative to rootDir).
 * @param {number} [options.port] - The port from the command line, which overrides the config's.
 * @param {Object} [options.vite={}] - Additional Vite configuration to merge.
 * @returns {Object} The merged Vite configuration.
 */
export function createViteConfig(options = {}) {
  const { rootDir = ".", port, vite = {}, markdown = {} } = options
  const { port: defaultPort = 3000 } = vite.dev ?? {}

  const srcDir = path.resolve(process.cwd(), rootDir, "src")
  const publicDir = path.resolve(process.cwd(), rootDir, "public")

  const config = mergeConfig(
    {
      root: process.cwd(),
      publicDir,
      server: { port: defaultPort, middlewareMode: true },
      appType: "custom",
      plugins: [virtualPlugin(), markdownPlugin(markdown)],
      resolve: {
        alias: {
          "@": srcDir,
        },
      },
    },
    vite,
  )

  // A port given on the command line wins over the config's.
  if (port) config.server.port = port
  return config
}

/**
 * A map to store virtual files generated during runtime (e.g., the client entry point).
 * Keys are file paths (e.g., "/main.js") and values are the file content.
 * @type {Map<string, string>}
 */
export const virtualFiles = new Map()

/**
 * A Vite plugin to serve virtual files from the `virtualFiles` map.
 *
 * @returns {Object} The Vite plugin object.
 */
function virtualPlugin() {
  return {
    name: "ssx-virtual-files",

    resolveId(id) {
      if (virtualFiles.has(id)) return id
    },

    load(id) {
      if (virtualFiles.has(id)) return virtualFiles.get(id)
    },
  }
}
