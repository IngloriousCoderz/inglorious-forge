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
