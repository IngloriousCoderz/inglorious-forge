import { defineConfig } from "vite"
import babel from "vite-plugin-babel"

export default defineConfig({
  resolve: { extensions: [".js", ".jsx", ".ts", ".tsx", ".ijs"] },

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
