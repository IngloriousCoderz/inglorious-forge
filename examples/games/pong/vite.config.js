import { fileURLToPath } from "node:url"

import { defineConfig } from "vite"
import babel from "vite-plugin-babel"

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    extensions: [".js", ".jsx", ".ts", ".tsx", ".ijs"],
  },

  plugins: [
    babel({
      include: "src/**",
      filter: /\.(js|jsx|ts|tsx|ijs)$/,

      babelConfig: {
        presets: ["@inglorious/inglorious-script"],
      },
    }),
  ],
})
