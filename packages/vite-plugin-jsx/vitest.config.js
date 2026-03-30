import { resolve } from "node:path"
import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vitest/config"

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..", "..")

export default defineConfig({
  resolve: {
    alias: {
      "@inglorious/utils/data-structures/string.js": resolve(
        root,
        "packages/utils/src/data-structures/string.js",
      ),
    },
  },
})
