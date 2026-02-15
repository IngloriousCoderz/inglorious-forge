import path from "node:path"

import { mergeConfig } from "vite"
import { ViteImageOptimizer } from "vite-plugin-image-optimizer"

import { markdownPlugin } from "../utils/markdown.js"

// import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals"

/**
 * Generate Vite config for building the client bundle
 */
export function createViteConfig(options = {}) {
  const { rootDir = ".", outDir = "dist", vite = {}, markdown = {} } = options

  const srcDir = path.resolve(process.cwd(), rootDir, "src")
  const publicDir = path.resolve(process.cwd(), rootDir, "public")

  return mergeConfig(
    {
      root: process.cwd(),
      publicDir: publicDir,
      plugins: [
        ViteImageOptimizer({
          // Options can be overridden by the user in site.config.js via the `vite` property
        }),
        markdownPlugin(markdown),
      ],
      build: {
        outDir,
        emptyOutDir: false, // Don't delete HTML files we already generated
        rollupOptions: {
          input: {
            main: path.resolve(outDir, "main.js"),
          },
          output: {
            entryFileNames: "[name].js",
            chunkFileNames: "[name].[hash].js",
            assetFileNames: "[name].[ext]",

            manualChunks(id) {
              if (id.includes("node_modules")) {
                return "lib"
              }
            },
          },
          plugins: [
            // minifyTemplateLiterals(), // TODO: minification breaks hydration. The footprint difference is minimal after all
          ],
        },
      },
      resolve: {
        alias: {
          "@": srcDir,
        },
      },
    },
    vite,
  )
}
