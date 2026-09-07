import { defineConfig } from "vite"
import babel from "vite-plugin-babel"

export default defineConfig({
  // @see https://github.com/vitejs/vite/issues/1973
  define: { "process.env": {} },

  plugins: [
    babel({
      include: /[\\/]src[\\/].*\.(js|ijs|ts|its)$/,

      babelConfig: {
        presets: [
          "@inglorious/inglorious-script",
          [
            "@babel/preset-typescript",
            {
              ignoreExtensions: true,
              onlyRemoveTypeImports: true,
            },
          ],
        ],
      },
    }),
  ],
})
