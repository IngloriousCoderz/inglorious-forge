import { transformAsync } from "@babel/core"
import syntaxJsx from "@babel/plugin-syntax-jsx"
import syntaxTs from "@babel/plugin-syntax-typescript"

import { jsxToLit } from "./visitor.js"

/**
 * Create the Vite plugin that compiles JSX/TSX into lit-html templates.
 *
 * @returns {import("vite").Plugin} The Vite plugin instance.
 */
export function jsx() {
  return {
    name: "@inglorious/vite-plugin-jsx",
    enforce: "pre",

    configResolved(config) {
      if ("oxc" in config) {
        config.oxc.jsx = "preserve"
      } else {
        config.esbuild.jsx = "preserve"
      }

      const optimizeDeps = config.optimizeDeps
      if ("rolldownOptions" in optimizeDeps) {
        optimizeDeps.rolldownOptions.transform ??= {}
        optimizeDeps.rolldownOptions.transform.jsx = "preserve"
      } else {
        optimizeDeps.esbuildOptions ??= {}
        optimizeDeps.esbuildOptions.jsx = "preserve"
      }
    },

    async transform(code, id) {
      if (!/\.[jt]sx$/.test(id)) return null

      const result = await transformAsync(code, {
        filename: id,
        babelrc: false,
        configFile: false,
        plugins: [syntaxJsx, [syntaxTs, { isTSX: true }], jsxToLit()],
        sourceMaps: true,
      })

      return result && { code: result.code, map: result.map }
    },
  }
}
